import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

export const maxDuration = 60 // extend Vercel function timeout to 60s

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, 12000)
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url || !url.startsWith('http')) {
      return Response.json({ error: 'Invalid URL' }, { status: 400 })
    }

    // Fetch the page
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
      if (!res.ok) return Response.json({ error: `Could not fetch page (status ${res.status}). Try a different URL.` }, { status: 400 })
      html = await res.text()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      return Response.json({ error: `Could not reach the page: ${msg}` }, { status: 400 })
    }

    const text = stripHtml(html)
    if (text.length < 100) {
      return Response.json({ error: 'Page content is too short or empty. The site may be blocking automated access.' }, { status: 400 })
    }

    // Ask Claude to extract product info
    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Extract product details from this webpage text and return a JSON object with exactly these fields:
- name (string): full product name
- brand (string): brand/manufacturer name
- category (string): one of: Tech, Beauty, Fashion, Home, Sports, Food, Automotive
- price (number): price in Indian Rupees as integer (convert if needed, use 0 if not found)
- description (string): 1-2 sentence product description
- score (number): estimated quality score 1-10 based on ratings mentioned (use 7.5 if none found)
- reviews_count (number): number of reviews/ratings mentioned (use 0 if none found)

Return ONLY valid JSON, no markdown fences, no explanation.

Webpage text:
${text}`,
        },
      ],
    })

    const raw = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
    const cleaned = raw.replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '').trim()

    try {
      const product = JSON.parse(cleaned)
      return Response.json({ product })
    } catch {
      return Response.json({ error: 'Could not parse product details. Raw: ' + cleaned.slice(0, 200) }, { status: 400 })
    }

  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return Response.json({ error: 'Server error: ' + msg }, { status: 500 })
  }
}
