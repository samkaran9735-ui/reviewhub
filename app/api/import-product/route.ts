import { NextRequest } from 'next/server'

export const maxDuration = 30

function extractJsonLd(html: string) {
  const matches = html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)
  for (const match of matches) {
    try {
      const data = JSON.parse(match[1])
      const items = Array.isArray(data) ? data : [data]
      for (const item of items) {
        if (item['@type'] === 'Product' || item['@type'] === 'product') return item
        // some pages nest it under @graph
        if (item['@graph']) {
          const product = item['@graph'].find((g: { '@type': string }) => g['@type'] === 'Product')
          if (product) return product
        }
      }
    } catch { /* skip malformed */ }
  }
  return null
}

function extractMeta(html: string, property: string): string {
  const m = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'))
    || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`, 'i'))
  return m ? m[1].trim() : ''
}

function guessCategory(name: string, description: string): string {
  const text = (name + ' ' + description).toLowerCase()
  if (/phone|laptop|tablet|headphone|earphone|speaker|camera|tv|monitor|keyboard|mouse|charger|router|smartwatch|processor|gpu|ssd/.test(text)) return 'Tech'
  if (/cream|serum|lipstick|foundation|moisturizer|shampoo|conditioner|perfume|cologne|skincare|makeup|hair/.test(text)) return 'Beauty'
  if (/shirt|jeans|dress|shoes|sneaker|jacket|kurta|saree|watch|bag|wallet|sandal|boot/.test(text)) return 'Fashion'
  if (/sofa|bed|mattress|curtain|pillow|cookware|mixer|fridge|washing machine|vacuum|air purifier|lamp/.test(text)) return 'Home'
  if (/cycle|yoga|gym|protein|dumbbell|cricket|football|badminton|tennis|treadmill|fitness/.test(text)) return 'Sports'
  if (/food|snack|biscuit|chocolate|juice|coffee|tea|spice|oil|flour|rice/.test(text)) return 'Food'
  return 'Tech'
}

function parsePrice(raw: unknown): number {
  if (!raw) return 0
  const str = String(raw).replace(/[^0-9.]/g, '')
  return Math.round(parseFloat(str) || 0)
}

function parseReviewCount(raw: unknown): number {
  if (!raw) return 0
  const str = String(raw).replace(/[^0-9]/g, '')
  return parseInt(str) || 0
}

function parseScore(raw: unknown): number {
  if (!raw) return 7.5
  const num = parseFloat(String(raw))
  if (isNaN(num)) return 7.5
  // normalize: if out of 5, convert to 10
  if (num <= 5) return Math.round(num * 2 * 10) / 10
  return Math.min(10, Math.round(num * 10) / 10)
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

    // 1. Try JSON-LD structured data (most reliable)
    const jsonLd = extractJsonLd(html)

    let name = ''
    let brand = ''
    let description = ''
    let price = 0
    let score = 7.5
    let reviews_count = 0

    if (jsonLd) {
      name = jsonLd.name || ''
      brand = typeof jsonLd.brand === 'object' ? jsonLd.brand?.name || '' : jsonLd.brand || ''
      description = jsonLd.description || ''
      price = parsePrice(jsonLd.offers?.price || jsonLd.offers?.[0]?.price || 0)
      score = parseScore(jsonLd.aggregateRating?.ratingValue)
      reviews_count = parseReviewCount(jsonLd.aggregateRating?.reviewCount || jsonLd.aggregateRating?.ratingCount)
    }

    // 2. Fill gaps from Open Graph / meta tags
    if (!name) name = extractMeta(html, 'og:title') || extractMeta(html, 'twitter:title')
    if (!description) description = extractMeta(html, 'og:description') || extractMeta(html, 'description') || extractMeta(html, 'twitter:description')

    // 3. Try title tag as last resort for name
    if (!name) {
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
      if (titleMatch) name = titleMatch[1].trim().split('|')[0].split('-')[0].trim()
    }

    if (!name) {
      return Response.json({ error: 'Could not extract product details from this page. The site may be blocking automated access.' }, { status: 400 })
    }

    // Clean up description — remove HTML entities
    description = description.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#\d+;/g, '').slice(0, 300)

    const category = guessCategory(name, description)

    const product = {
      name: name.slice(0, 200),
      brand: brand.slice(0, 100) || 'Unknown',
      category,
      price,
      description,
      score,
      reviews_count,
    }

    return Response.json({ product })

  } catch (e: unknown) {
    return Response.json({ error: 'Server error: ' + (e instanceof Error ? e.message : 'unknown') }, { status: 500 })
  }
}
