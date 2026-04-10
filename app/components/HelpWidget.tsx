'use client'

import { useState, useRef, useEffect } from 'react'

type Message = { role: 'user' | 'assistant'; content: string }

export default function HelpWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I\'m HELP, your GetSmartReviews assistant. How can I help you today?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return

    const userMessage: Message = { role: 'user', content: text }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    const assistantMessage: Message = { role: 'assistant', content: '' }
    setMessages([...newMessages, assistantMessage])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        }),
      })

      if (!res.ok || !res.body) throw new Error('Failed')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role: 'assistant',
            content: updated[updated.length - 1].content + chunk
          }
          return updated
        })
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.'
        }
        return updated
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Chat window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '80px', right: '20px', width: '340px', maxHeight: '480px',
          background: '#fff', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          display: 'flex', flexDirection: 'column', zIndex: 9999, border: '1px solid #eee', overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{ background: '#378ADD', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>💬</div>
              <div>
                <div style={{ color: '#fff', fontWeight: '600', fontSize: '14px' }}>HELP</div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>GetSmartReviews Support</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer', lineHeight: 1 }}>✕</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px', minHeight: 0 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '80%', padding: '9px 12px', borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  background: msg.role === 'user' ? '#378ADD' : '#f4f4f2',
                  color: msg.role === 'user' ? '#fff' : '#1a1a1a',
                  fontSize: '13px', lineHeight: '1.45',
                  whiteSpace: 'pre-wrap'
                }}>
                  {msg.content || (loading && i === messages.length - 1 ? '...' : '')}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '10px', borderTop: '1px solid #eee', display: 'flex', gap: '8px' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Type a message..."
              disabled={loading}
              style={{
                flex: 1, padding: '9px 12px', border: '1px solid #ddd', borderRadius: '10px',
                fontSize: '13px', outline: 'none', background: loading ? '#f8f8f6' : '#fff'
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                padding: '9px 14px', background: loading || !input.trim() ? '#aaa' : '#378ADD',
                color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', flexShrink: 0
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Chat with HELP"
        style={{
          position: 'fixed', bottom: '20px', right: '20px', width: '56px', height: '56px',
          borderRadius: '50%', background: '#378ADD', color: '#fff', border: 'none',
          cursor: 'pointer', fontSize: '22px', boxShadow: '0 4px 16px rgba(55,138,221,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
          transition: 'transform 0.15s'
        }}
      >
        {open ? '✕' : '💬'}
      </button>
    </>
  )
}
