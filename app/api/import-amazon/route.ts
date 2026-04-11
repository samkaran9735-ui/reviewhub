import { NextRequest } from 'next/server'

export const maxDuration = 45

function extractASIN(url: string): string {
  const patterns = [
    /\/dp\/([A-Z0-9]{10})/,
    /\/gp\/product\/([A-Z0-9]{10})/,
    /\/ASIN\/([A-Z0-9]{10})/,
    /\/product\/([A-Z0-9]{10})/,
    /asin=([A-Z0-9]{10})/i,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return ''
}

function cleanText(s: string): string {
  return s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#\d+;/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
}

function extractName(html: string): string {
  const patterns = [
    /<span[^>]+id="productTitle"[^>]*>([\s\S]*?)<\/span>/i,
    /<h1[^>]+class="[^"]*product[^"]*"[^>]*>([\s\S]*?)<\/h1>/i,
    /"productTitle"\s*:\s*"([^"]+)"/,
    /<title>([^<]+)<\/title>/i,
  ]
  for (const p of patterns) {
    const m = html.match(p)
    if (m) {
      const name = cleanText(m[1]).split('|')[0].split(':')[0].trim()
      if (name.length > 3) return name.slice(0, 200)
    }
  }
  return ''
}

function extractBrand(html: string): string {
  const patterns = [
    /<a[^>]+id="bylineInfo"[^>]*>([\s\S]*?)<\/a>/i,
    /class="[^"]*byline[^"]*"[^>]*>([\s\S]*?)<\/[a-z]+>/i,
    /"brand"\s*:\s*"([^"]+)"/i,
    /itemprop="brand"[^>]*>([\s\S]*?)<\/[a-z]+>/i,
    /<tr[^>]*>[\s\S]*?Brand[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>/i,
  ]
  for (const p of patterns) {
    const m = html.match(p)
    if (m) {
      const brand = cleanText(m[1]).replace(/^(Visit the |Brand:\s*)/i, '').trim()
      if (brand.length > 1 && brand.length < 80) return brand
    }
  }
  return 'Unknown'
}

function extractPrice(html: string): number {
  const patterns = [
    /class="[^"]*a-price-whole[^"]*"[^>]*>([\d,]+)/,
    /"priceAmount"\s*:\s*"?([\d.]+)"?/,
    /"price"\s*:\s*"?₹?\s*([\d,]+(?:\.\d+)?)"?/,
    /id="priceblock_ourprice"[^>]*>[\s\S]{0,10}₹\s*([\d,]+)/,
    /id="priceblock_dealprice"[^>]*>[\s\S]{0,10}₹\s*([\d,]+)/,
    /"displayPrice"\s*:\s*"(?:₹|Rs\.?|INR)\s*([\d,]+)"/i,
    /class="[^"]*priceToPay[^"]*"[\s\S]{0,200}?₹\s*([\d,]+)/,
    /class="[^"]*apexPriceToPay[^"]*"[\s\S]{0,200}?₹\s*([\d,]+)/,
    /"buyingPrice"\s*:\s*([\d.]+)/,
    /₹\s*([\d,]+(?:\.\d{2})?)/,
  ]
  for (const p of patterns) {
    const m = html.match(p)
    if (m) {
      const val = Math.round(parseFloat(m[1].replace(/,/g, '')) || 0)
      if (val > 50 && val < 10000000) return val
    }
  }
  return 0
}

function extractImages(html: string): string[] {
  const images: string[] = []

  // Main image data block Amazon uses
  const imageDataMatch = html.match(/'colorImages'\s*:\s*\{[^}]*'initial'\s*:\s*(\[[\s\S]*?\])\s*\}/)
    || html.match(/"colorImages"\s*:\s*\{[^}]*"initial"\s*:\s*(\[[\s\S]*?\])/)
  if (imageDataMatch) {
    try {
      const data = JSON.parse(imageDataMatch[1])
      for (const item of data) {
        const url = item.hiRes || item.large || item.main
        if (url && url.startsWith('http') && !images.includes(url)) images.push(url)
      }
    } catch { /* skip */ }
  }

  if (images.length === 0) {
    // data-old-hires on main image
    const hires = html.match(/data-old-hires="(https:[^"]+)"/g)
    if (hires) {
      for (const h of hires) {
        const u = h.match(/data-old-hires="(https:[^"]+)"/)?.[1]
        if (u && !images.includes(u)) images.push(u)
      }
    }
  }

  if (images.length === 0) {
    // landingImage src
    const li = html.match(/id="landingImage"[^>]+src="(https:[^"]+)"/)
      || html.match(/id="imgBlkFront"[^>]+src="(https:[^"]+)"/)
    if (li?.[1]) images.push(li[1])
  }

  if (images.length === 0) {
    // og:image fallback
    const og = html.match(/<meta[^>]+property="og:image"[^>]+content="(https:[^"]+)"/)
      || html.match(/<meta[^>]+content="(https:[^"]+)"[^>]+property="og:image"/)
    if (og?.[1]) images.push(og[1])
  }

  return images.slice(0, 6)
}

function extractSpecs(html: string): Record<string, string> {
  const specs: Record<string, string> = {}

  // Amazon product details table
  const techTable = html.match(/id="productDetails_techSpec_section_1"[\s\S]*?<table[\s\S]*?<\/table>/i)
    || html.match(/id="productDetails_detailBullets_sections1"[\s\S]*?<table[\s\S]*?<\/table>/i)
    || html.match(/class="[^"]*prodDetTable[^"]*"[\s\S]*?<\/table>/i)

  if (techTable) {
    const rows = techTable[0].matchAll(/<tr[^>]*>[\s\S]*?<t[dh][^>]*>([\s\S]*?)<\/t[dh]>[\s\S]*?<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)
    for (const row of rows) {
      const k = cleanText(row[1])
      const v = cleanText(row[2])
      if (k && v && k.length < 80 && v.length < 300 && !k.match(/^[\d\s]+$/)) {
        specs[k] = v
      }
    }
  }

  // Amazon detail bullets (ul list format)
  const bullets = html.match(/id="detailBulletsWrapper_feature_div"[\s\S]*?<\/ul>/i)
  if (bullets) {
    const items = bullets[0].matchAll(/<li[\s\S]*?<span[^>]*>([^<:]+)\s*:\s*<\/span>[\s\S]*?<span[^>]*>([^<]+)<\/span>/gi)
    for (const item of items) {
      const k = cleanText(item[1])
      const v = cleanText(item[2])
      if (k && v) specs[k] = v
    }
  }

  // Generic table fallback
  if (Object.keys(specs).length < 3) {
    const rows = html.matchAll(/<tr[^>]*>[\s\S]*?<t[dh][^>]*>([\s\S]*?)<\/t[dh]>[\s\S]*?<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)
    let count = 0
    for (const row of rows) {
      if (count >= 20) break
      const k = cleanText(row[1])
      const v = cleanText(row[2])
      if (k && v && k.length > 2 && k.length < 60 && v.length < 300 && !k.match(/^[\d\s]+$/)) {
        if (!specs[k]) { specs[k] = v; count++ }
      }
    }
  }

  return specs
}

function extractRating(html: string): { score: number; reviews_count: number } {
  let score = 0
  let reviews_count = 0

  const ratingMatch = html.match(/(\d+\.?\d*)\s*out of\s*5\s*stars/i)
    || html.match(/"ratingValue"\s*:\s*"?(\d+\.?\d*)"?/)
    || html.match(/class="[^"]*a-icon-alt[^"]*"[^>]*>[\s\S]*?(\d+\.?\d*)\s*out of/i)
  if (ratingMatch) {
    const r = parseFloat(ratingMatch[1])
    score = Math.round(r * 2 * 10) / 10
  }

  const countMatch = html.match(/([\d,]+)\s*(?:global\s*)?ratings?/i)
    || html.match(/([\d,]+)\s*(?:customer\s*)?reviews?/i)
    || html.match(/"reviewCount"\s*:\s*"?(\d+)"?/)
  if (countMatch) {
    reviews_count = parseInt(countMatch[1].replace(/,/g, '')) || 0
  }

  return { score, reviews_count }
}

function extractDescription(html: string): string {
  // Feature bullets
  const bullets: string[] = []
  const featureBullets = html.match(/id="feature-bullets"[\s\S]*?<\/ul>/i)
  if (featureBullets) {
    const items = featureBullets[0].matchAll(/<li[^>]*>[\s\S]*?<span[^>]*>([^<]{10,})<\/span>/gi)
    for (const item of items) {
      const text = cleanText(item[1])
      if (text.length > 10 && text.length < 300) bullets.push(text)
      if (bullets.length >= 3) break
    }
  }
  if (bullets.length > 0) return bullets.join('. ').slice(0, 400)

  // og:description fallback
  const og = html.match(/<meta[^>]+(?:property="og:description"|name="description")[^>]+content="([^"]+)"/i)
    || html.match(/<meta[^>]+content="([^"]+)"[^>]+(?:property="og:description"|name="description")/i)
  if (og) return cleanText(og[1]).slice(0, 400)

  return ''
}

function guessCategory(text: string): string {
  const t = text.toLowerCase()
  if (/phone|laptop|tablet|headphone|earphone|speaker|camera|tv|monitor|keyboard|mouse|charger|router|smartwatch|ssd|mobile|computer|gaming/.test(t)) return 'Tech'
  if (/cream|serum|lipstick|foundation|moisturizer|shampoo|conditioner|perfume|skincare|makeup|hair/.test(t)) return 'Beauty'
  if (/shirt|jeans|dress|shoes|sneaker|jacket|kurta|saree|wallet|sandal|boot/.test(t)) return 'Fashion'
  if (/sofa|bed|mattress|cookware|mixer|fridge|washing|vacuum|air purifier|lamp|furniture/.test(t)) return 'Home'
  if (/cycle|yoga|gym|protein|dumbbell|cricket|football|badminton|treadmill|fitness/.test(t)) return 'Sports'
  if (/food|snack|biscuit|chocolate|juice|coffee|tea|spice|supplement/.test(t)) return 'Food'
  return 'Tech'
}

async function fetchWithProxy(url: string): Promise<string> {
  // Try mobile Amazon URL too — easier to scrape
  const mobileUrl = url.replace('www.amazon.in', 'm.amazon.in').replace('www.amazon.com', 'm.amazon.com')

  const strategies = [
    // Strategy 1: Amazon mobile version (less protected)
    async () => {
      const res = await fetch(mobileUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-IN,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
        },
        signal: AbortSignal.timeout(15000),
      })
      if (!res.ok) throw new Error(`Mobile status ${res.status}`)
      return res.text()
    },
    // Strategy 2: Direct fetch with Chrome desktop headers
    async () => {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-IN,en;q=0.9,hi;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'max-age=0',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Upgrade-Insecure-Requests': '1',
        },
        signal: AbortSignal.timeout(15000),
      })
      if (!res.ok) throw new Error(`Status ${res.status}`)
      return res.text()
    },
    // Strategy 3: via allorigins raw proxy
    async () => {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
      const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(20000) })
      if (!res.ok) throw new Error(`Allorigins-raw status ${res.status}`)
      return res.text()
    },
    // Strategy 4: via allorigins json proxy
    async () => {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
      const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(20000) })
      if (!res.ok) throw new Error(`Allorigins status ${res.status}`)
      const data = await res.json()
      return data.contents || ''
    },
    // Strategy 5: via codetabs proxy
    async () => {
      const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
      const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(20000) })
      if (!res.ok) throw new Error(`Codetabs status ${res.status}`)
      return res.text()
    },
    // Strategy 6: via corsproxy with Googlebot UA
    async () => {
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`
      const res = await fetch(proxyUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' },
        signal: AbortSignal.timeout(15000),
      })
      if (!res.ok) throw new Error(`Corsproxy status ${res.status}`)
      return res.text()
    },
  ]

  let lastError = ''
  for (const strategy of strategies) {
    try {
      const html = await strategy()
      if (html && html.length > 500) return html
    } catch (e) {
      lastError = e instanceof Error ? e.message : 'failed'
    }
  }
  throw new Error(`All fetch strategies failed. Last error: ${lastError}`)
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url || !url.startsWith('http')) {
      return Response.json({ error: 'Invalid URL' }, { status: 400 })
    }

    if (!url.includes('amazon')) {
      return Response.json({ error: 'This endpoint is for Amazon URLs only. Use the general import for other sites.' }, { status: 400 })
    }

    const asin = extractASIN(url)
    // Normalize to clean Amazon India URL
    const cleanUrl = asin
      ? `https://www.amazon.in/dp/${asin}`
      : url.replace('amazon.com', 'amazon.in')

    let html: string
    try {
      html = await fetchWithProxy(cleanUrl)
    } catch (e: unknown) {
      return Response.json({
        error: 'Amazon is blocking automated access. Please fill in the details manually below.',
        asin,
        partial: { name: '', brand: '', asin }
      }, { status: 422 })
    }

    // Check if Amazon returned a CAPTCHA/robot check page
    if (html.includes('Type the characters') || html.includes('Enter the characters you see below') || (html.includes('captcha') && html.length < 50000)) {
      return Response.json({
        error: 'Amazon returned a CAPTCHA. Please fill in details manually.',
        asin,
        partial: { name: '', brand: '', asin }
      }, { status: 422 })
    }

    const name = extractName(html)
    if (!name) {
      return Response.json({
        error: 'Could not extract product name. Amazon may be blocking access. Please fill in details manually.',
        asin,
        partial: { asin }
      }, { status: 422 })
    }

    const brand = extractBrand(html)
    const price = extractPrice(html)
    const images = extractImages(html)
    const specs = extractSpecs(html)
    const { score, reviews_count } = extractRating(html)
    const description = extractDescription(html)
    const category = guessCategory(name + ' ' + description)

    return Response.json({
      product: {
        name,
        brand,
        category,
        price,
        description,
        score,
        reviews_count,
        image_url: images[0] || '',
        images,
        specs,
        reviews: [],
        asin,
        amazon_url: cleanUrl,
      }
    })

  } catch (e: unknown) {
    return Response.json({ error: 'Server error: ' + (e instanceof Error ? e.message : 'unknown') }, { status: 500 })
  }
}
