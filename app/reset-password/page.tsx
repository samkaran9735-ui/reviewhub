'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleReset() {
    setLoading(true)
    setError('')
    setMessage('')

    if (password !== confirm) {
      setError('Passwords do not match!')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters!')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Password updated successfully!')
      setTimeout(() => router.push('/'), 2000)
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f6', display: 'flex', flexDirection: 'column' }}>

      <nav style={{ background: '#fff', borderBottom: '1px solid #eee', padding: '14px 24px' }}>
        <Link href="/" style={{ fontSize: '20px', fontWeight: '500', textDecoration: 'none', color: '#1a1a1a' }}>
          Get<span style={{ color: '#378ADD' }}>Smart</span>Reviews
        </Link>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '20px', padding: '36px', width: '100%', maxWidth: '420px' }}>

          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔐</div>
            <h1 style={{ fontSize: '22px', fontWeight: '500', color: '#1a1a1a', marginBottom: '4px' }}>Set new password</h1>
            <p style={{ fontSize: '14px', color: '#666' }}>Enter your new password below</p>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a1a', marginBottom: '6px' }}>New password</div>
            <input type="password" placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', border: '1px solid #ddd', borderRadius: '10px', fontSize: '14px', outline: 'none' }} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a1a', marginBottom: '6px' }}>Confirm new password</div>
            <input type="password" placeholder="Repeat your new password" value={confirm} onChange={e => setConfirm(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', border: '1px solid #ddd', borderRadius: '10px', fontSize: '14px', outline: 'none' }} />
          </div>

          {error && (
            <div style={{ background: '#FCEBEB', color: '#A32D2D', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>
              {error}
            </div>
          )}

          {message && (
            <div style={{ background: '#EAF3DE', color: '#3B6D11', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>
              {message} Redirecting...
            </div>
          )}

          <button onClick={handleReset} disabled={loading}
            style={{ width: '100%', padding: '13px', background: loading ? '#aaa' : '#378ADD', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Updating...' : 'Update password'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Link href="/login" style={{ fontSize: '13px', color: '#378ADD' }}>Back to sign in</Link>
          </div>

        </div>
      </div>
    </div>
  )
}