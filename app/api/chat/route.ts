import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  const { messages } = await request.json()

  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    thinking: { type: 'adaptive' },
    system: `You are HELP, the friendly customer support assistant for GetSmartReviews — India's trusted product review and price comparison platform.

You help customers with:
- Finding the right products based on their needs and budget
- Understanding product reviews and scores
- Navigating the website (browse, compare, wishlist, account)
- Account issues (login, signup, password reset)
- Understanding how reviews and scores are calculated
- Price comparisons across Indian stores (Flipkart, Amazon, Meesho, etc.)

Guidelines:
- Be warm, concise, and helpful
- Respond in the same language the user writes in (Hindi or English)
- Keep responses short and to the point — no walls of text
- If you don't know something specific about a product, say so honestly
- Never make up prices or review data
- For account/technical issues you can't resolve, suggest emailing support`,
    messages,
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          controller.enqueue(encoder.encode(event.delta.text))
        }
      }
      controller.close()
    },
    cancel() {
      stream.controller.abort()
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
