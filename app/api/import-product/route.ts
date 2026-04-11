import { NextRequest } from 'next/server'

export const maxDuration = 30

function extractJsonLd(html: string) {
  const matches = html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)
  for (const match of matches) {
    try {
      const data = JSON.parse(match[1])
      const items = Array.isArray(data) ? data : [data]
      for (const item of items) {
        if (item['@type'] === 'Product') return item
        if (item['@graph']) {
          const p = item['@graph'].find((g: { '@type': string }) => g['@type'] === 'Product')
          if (p) return p
        }
      }
    } catch { /* skip */ }
  }
  return null
}

function extractMeta(html: string, property: string): string {
  const m = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'))
    || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`, 'i'))
  return m ? m[1].trim() : ''
}

function guessCategory(text: string): string {
  const t = text.toLowerCase()
  if (/phone|laptop|tablet|headphone|earphone|speaker|camera|tv|monitor|keyboard|mouse|charger|router|smartwatch|processor|gpu|ssd|mobile|computer/.test(t)) return 'Tech'
  if (/cream|serum|lipstick|foundation|moisturizer|shampoo|conditioner|perfume|cologne|skincare|makeup|hair|lotion|sunscreen/.test(t)) return 'Beauty'
  if (/shirt|jeans|dress|shoes|sneaker|jacket|kurta|saree|watch|bag|wallet|sandal|boot|trouser|top|tshirt/.test(t)) return 'Fashion'
  if (/sofa|bed|mattress|curtain|pillow|cookware|mixer|fridge|washing machine|vacuum|air purifier|lamp|furniture/.test(t)) return 'Home'
  if (/cycle|yoga|gym|protein|dumbbell|cricket|football|badminton|tennis|treadmill|fitness|sport/.test(t)) return 'Sports'
  if (/food|snack|biscuit|chocolate|juice|coffee|tea|spice|oil|flour|rice|supplement/.test(t)) return 'Food'
  return 'Tech'
}

function parsePrice(raw: unknown): number {
  if (!raw) return 0
  return Math.round(parseFloat(String(raw).replace(/[^0-9.]/g, '')) || 0)
}

function parseReviewCount(raw: unknown): number {
  if (!raw) return 0
  return parseInt(String(raw).replace(/[^0-9]/g, '')) || 0
}

function parseScore(raw: unknown): number {
  if (!raw) return 7.5
  const num = parseFloat(String(raw))
  if (isNaN(num)) return 7.5
  return num <= 5 ? Math.round(num * 2 * 10) / 10 : Math.min(10, Math.round(num * 10) / 10)
}

function extractSpecs(jsonLd: Record<string, unknown> | null, html: string): Record<string, string> {
  const specs: Record<string, string> = {}

  // From JSON-LD additionalProperty
  if (jsonLd?.additionalProperty && Array.isArray(jsonLd.additionalProperty)) {
    for (const prop of jsonLd.additionalProperty) {
      if (prop.name && prop.value) specs[prop.name] = String(prop.value)
    }
  }

  // From common spec table patterns in HTML
  const tableMatches = html.matchAll(/<tr[^>]*>[\s\S]*?<t[dh][^>]*>([\s\S]*?)<\/t[dh]>[\s\S]*?<t[dh][^>]*>([\s\S]*?)<\/t[dh]>[\s\S]*?<\/tr>/gi)
  let count = 0
  for (const m of tableMatches) {
    if (count >= 15) break
    const key = m[1].replace(/<[^>]+>/g, '').trim()
    const val = m[2].replace(/<[^>]+>/g, '').trim()
    if (key && val && key.length < 50 && val.length < 200 && key.length > 1) {
      specs[key] = val
      count++
    }
  }

  return specs
}

function extractReviews(jsonLd: Record<string, unknown> | null): Array<{ reviewer: string; rating: number; text: string }> {
  const reviews: Array<{ reviewer: string; rating: number; text: string }> = []
  if (!jsonLd?.review) return reviews

  const raw = Array.isArray(jsonLd.review) ? jsonLd.review : [jsonLd.review]
  for (const r of raw.slice(0, 5)) {
    reviews.push({
      reviewer: r.author?.name || r.author || 'Anonymous',
      rating: parseScore(r.reviewRating?.ratingValue),
      text: (r.reviewBody || r.description || '').slice(0, 300),
    })
  }
  return reviews
}

function extractImage(jsonLd: Record<string, unknown> | null, html: string): string {
  // From JSON-LD
  if (jsonLd?.image) {
    const img = Array.isArray(jsonLd.image) ? jsonLd.image[0] : jsonLd.image
    if (typeof img === 'string') return img
    if (img?.url) return img.url
    if (img?.contentUrl) return img.contentUrl
  }

  // From og:image
  const og = extractMeta(html, 'og:image') || extractMeta(html, 'twitter:image')
  if (og) return og

  return ''
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url || !url.startsWith('http')) {
      return Response.json({ error: 'Invalid URL' }, { status: 400 })
    }

    let html: string
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: AbortSignal.timeout(20000),
      })
      if (!res.ok) return Response.json({ error: `Could not fetch page (status ${res.status})` }, { status: 400 })
      html = await res.text()
    } catch (e: unknown) {
      return Response.json({ error: 'Could not reach the page: ' + (e instanceof Error ? e.message : 'timeout') }, { status: 400 })
    }

    const jsonLd = extractJsonLd(html)

    let name = jsonLd?.name || ''
    let brand = typeof jsonLd?.brand === 'object' ? (jsonLd?.brand as Record<string,string>)?.name || '' : String(jsonLd?.brand || '')
    let description = jsonLd?.description || ''
    let price = parsePrice(jsonLd?.offers?.price || (jsonLd?.offers as Record<string,unknown>[])?.[0]?.price || 0)
    const score = parseScore(jsonLd?.aggregateRating?.ratingValue)
    const reviews_count = parseReviewCount(jsonLd?.aggregateRating?.reviewCount || jsonLd?.aggregateRating?.ratingCount)

    if (!name) name = extractMeta(html, 'og:title') || extractMeta(html, 'twitter:title')
    if (!description) description = extractMeta(html, 'og:description') || extractMeta(html, 'description') || extractMeta(html, 'twitter:description')
    if (!name) {
      const t = html.match(/<title[^>]*>([^<]+)<\/title>/i)
      if (t) name = t[1].trim().split('|')[0].split('-')[0].trim()
    }

    if (!name) {
      return Response.json({ error: 'Could not extract product details. The site may be blocking automated access.' }, { status: 400 })
    }

    description = description.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#\d+;/g, '').slice(0, 300)

    const specs = extractSpecs(jsonLd, html)
    const reviews = extractReviews(jsonLd)
    const image_url = extractImage(jsonLd, html)
    const category = guessCategory(name + ' ' + description)

    return Response.json({
      product: {
        name: name.slice(0, 200),
        brand: brand.slice(0, 100) || 'Unknown',
        category,
        price,
        description,
        score,
        reviews_count,
        image_url,
        specs,
        reviews,
      }
    })

  } catch (e: unknown) {
    return Response.json({ error: 'Server error: ' + (e instanceof Error ? e.message : 'unknown') }, { status: 500 })
  }
}
