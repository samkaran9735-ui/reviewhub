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
  if (!raw) return 0
  const num = parseFloat(String(raw))
  if (isNaN(num)) return 0
  return num <= 5 ? Math.round(num * 2 * 10) / 10 : Math.min(10, Math.round(num * 10) / 10)
}

function extractPriceFromHtml(html: string, url: string): number {
  // Amazon-specific patterns
  if (url.includes('amazon')) {
    const patterns = [
      /"priceAmount"\s*:\s*"?([\d.]+)"?/,
      /class="a-price-whole"[^>]*>([\d,]+)/,
      /"price"\s*:\s*"?₹?\s*([\d,]+(?:\.\d+)?)"?/,
      /id="priceblock_ourprice"[^>]*>[\s₹]*([\d,]+)/,
      /id="priceblock_dealprice"[^>]*>[\s₹]*([\d,]+)/,
      /"displayPrice"\s*:\s*"₹\s*([\d,]+)"/,
      /selling-price[^>]*>[\s\S]{0,20}₹\s*([\d,]+)/,
    ]
    for (const p of patterns) {
      const m = html.match(p)
      if (m) return Math.round(parseFloat(m[1].replace(/,/g, '')) || 0)
    }
  }

  // Flipkart-specific patterns
  if (url.includes('flipkart')) {
    const patterns = [
      /"price"\s*:\s*([\d]+)/,
      /class="[^"]*_30jeq3[^"]*"[^>]*>₹([\d,]+)/,
      /class="[^"]*Nx9bqj[^"]*"[^>]*>₹([\d,]+)/,
      /"finalPrice"\s*:\s*([\d]+)/,
      /"mrp"\s*:\s*([\d]+)/,
    ]
    for (const p of patterns) {
      const m = html.match(p)
      if (m) return Math.round(parseFloat(m[1].replace(/,/g, '')) || 0)
    }
  }

  // Generic patterns — look for ₹ followed by numbers
  const generic = [
    /₹\s*([\d,]+(?:\.\d{2})?)/,
    /Rs\.?\s*([\d,]+(?:\.\d{2})?)/i,
    /INR\s*([\d,]+(?:\.\d{2})?)/i,
    /"price":\s*"?([\d.]+)"?/,
    /itemprop="price"[^>]+content="([\d.]+)"/,
    /itemprop="price"[^>]*>([\d,₹\s.]+)</,
  ]
  for (const p of generic) {
    const m = html.match(p)
    if (m) {
      const val = Math.round(parseFloat(m[1].replace(/[,₹\s]/g, '')) || 0)
      if (val > 0) return val
    }
  }

  return 0
}

function extractImageFromHtml(html: string, url: string): string {
  // Amazon-specific
  if (url.includes('amazon')) {
    const patterns = [
      /"hiRes"\s*:\s*"(https:[^"]+)"/,
      /"large"\s*:\s*"(https:[^"]+)"/,
      /"mainUrl"\s*:\s*"(https:[^"]+)"/,
      /id="landingImage"[^>]+src="([^"]+)"/,
      /id="imgBlkFront"[^>]+src="([^"]+)"/,
      /data-old-hires="([^"]+)"/,
      /data-a-dynamic-image="([^"]+)"/,
    ]
    for (const p of patterns) {
      const m = html.match(p)
      if (m) {
        let imgUrl = m[1]
        // data-a-dynamic-image is a JSON object of url:dimensions
        if (p.source?.includes('dynamic-image')) {
          try {
            const parsed = JSON.parse(imgUrl.replace(/&quot;/g, '"'))
            imgUrl = Object.keys(parsed)[0]
          } catch { /* skip */ }
        }
        if (imgUrl.startsWith('http')) return imgUrl
      }
    }
  }

  // Flipkart-specific
  if (url.includes('flipkart')) {
    const patterns = [
      /"image"\s*:\s*\["(https:[^"]+)"/,
      /"imageUrl"\s*:\s*"(https:[^"]+)"/,
      /class="[^"]*_396cs4[^"]*"[^>]+src="([^"]+)"/,
      /class="[^"]*DByuf4[^"]*"[^>]+src="([^"]+)"/,
    ]
    for (const p of patterns) {
      const m = html.match(p)
      if (m && m[1].startsWith('http')) return m[1]
    }
  }

  // Generic og:image / twitter:image
  const og = extractMeta(html, 'og:image') || extractMeta(html, 'twitter:image')
  if (og && og.startsWith('http')) return og

  // Generic — first large product image
  const imgMatch = html.match(/<img[^>]+(?:itemprop="image"|class="[^"]*product[^"]*")[^>]+src="(https:[^"]+)"/i)
  if (imgMatch) return imgMatch[1]

  return ''
}

function extractSpecs(jsonLd: Record<string, unknown> | null, html: string): Record<string, string> {
  const specs: Record<string, string> = {}

  if (jsonLd?.additionalProperty && Array.isArray(jsonLd.additionalProperty)) {
    for (const prop of jsonLd.additionalProperty) {
      if (prop.name && prop.value) specs[prop.name] = String(prop.value)
    }
  }

  // Flipkart spec tables
  const flipkartSpecs = html.matchAll(/class="[^"]*_0ZhAN9[^"]*"[^>]*>([\s\S]*?)<\/div>/gi)
  for (const m of flipkartSpecs) {
    const keyMatch = m[1].match(/class="[^"]*rougNe[^"]*"[^>]*>([^<]+)/)
    const valMatch = m[1].match(/class="[^"]*_2H87os[^"]*"[^>]*>([^<]+)/)
    if (keyMatch && valMatch) specs[keyMatch[1].trim()] = valMatch[1].trim()
  }

  // Generic HTML table extraction
  if (Object.keys(specs).length < 3) {
    const tableMatches = html.matchAll(/<tr[^>]*>[\s\S]*?<t[dh][^>]*>([\s\S]*?)<\/t[dh]>[\s\S]*?<t[dh][^>]*>([\s\S]*?)<\/t[dh]>[\s\S]*?<\/tr>/gi)
    let count = 0
    for (const m of tableMatches) {
      if (count >= 20) break
      const key = m[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim()
      const val = m[2].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim()
      if (key && val && key.length < 60 && val.length < 200 && key.length > 1 && !key.match(/^\d+$/)) {
        specs[key] = val
        count++
      }
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
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-IN,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
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
    let brand = typeof jsonLd?.brand === 'object' ? (jsonLd?.brand as Record<string, string>)?.name || '' : String(jsonLd?.brand || '')
    let description = jsonLd?.description || ''

    // Price: try JSON-LD first, then HTML patterns
    let price = parsePrice(
      jsonLd?.offers?.price ||
      (Array.isArray(jsonLd?.offers) ? jsonLd?.offers[0]?.price : null) ||
      0
    )
    if (!price) price = extractPriceFromHtml(html, url)

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

    description = description.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#\d+;/g, '').trim().slice(0, 300)

    // Image: try JSON-LD first, then HTML patterns
    let image_url = ''
    if (jsonLd?.image) {
      const img = Array.isArray(jsonLd.image) ? jsonLd.image[0] : jsonLd.image
      image_url = typeof img === 'string' ? img : (img?.url || img?.contentUrl || '')
    }
    if (!image_url) image_url = extractImageFromHtml(html, url)

    const specs = extractSpecs(jsonLd, html)
    const reviews = extractReviews(jsonLd)
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
