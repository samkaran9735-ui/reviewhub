'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit() {
    setLoading(true)
    setError('')
    setMessage('')

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setMessage('Logged in successfully!')
        setTimeout(() => router.push('/'), 1000)
      }

    } else if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } }
      })
      if (error) {
        setError(error.message)
      } else {
        setMessage('Account created! Please check your email to verify your account.')
      }

    } else if (mode === 'forgot') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://getsmartreviews.in/reset-password',
      })
      if (error) {
        setError(error.message)
      } else {
        setMessage('Password reset email sent! Check your inbox and follow the link to reset your password.')
      }
    }

    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f6', display: 'flex', flexDirection: 'column' }}>

      <nav style={{ background: '#fff', borderBottom: '1px solid #eee', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ fontSize: '20px', fontWeight: '500', textDecoration: 'none', color: '#1a1a1a' }}>
          Get<span style={{ color: '#378ADD' }}>Smart</span>Reviews
        </Link>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '20px', padding: '36px', width: '100%', maxWidth: '420px' }}>

          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>
              {mode === 'forgot' ? '🔑' : '👋'}
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: '500', color: '#1a1a1a', marginBottom: '4px' }}>
              {mode === 'login' ? 'Welcome back!' : mode === 'signup' ? 'Create your account' : 'Reset your password'}
            </h1>
            <p style={{ fontSize: '14px', color: '#666' }}>
              {mode === 'login' ? 'Sign in to your account' : mode === 'signup' ? 'Join thousands of smart buyers' : 'Enter your email and we will send you a reset link'}
            </p>
          </div>

          {mode !== 'forgot' && (
            <div style={{ display: 'flex', gap: '0', marginBottom: '24px', background: '#f8f8f6', borderRadius: '10px', padding: '4px' }}>
              <button onClick={() => { setMode('login'); setError(''); setMessage('') }}
                style={{ flex: 1, padding: '9px', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', background: mode === 'login' ? '#fff' : 'transparent', color: mode === 'login' ? '#1a1a1a' : '#666', fontWeight: mode === 'login' ? '500' : '400' }}>
                Sign in
              </button>
              <button onClick={() => { setMode('signup'); setError(''); setMessage('') }}
                style={{ flex: 1, padding: '9px', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', background: mode === 'signup' ? '#fff' : 'transparent', color: mode === 'signup' ? '#1a1a1a' : '#666', fontWeight: mode === 'signup' ? '500' : '400' }}>
                Sign up
              </button>
            </div>
          )}

          {mode === 'signup' && (
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a1a', marginBottom: '6px' }}>Your name</div>
              <input type="text" placeholder="e.g. Rahul Sharma" value={name} onChange={e => setName(e.target.value)}
                style={{ width: '100%', padding: '11px 14px', border: '1px solid #ddd', borderRadius: '10px', fontSize: '14px', outline: 'none' }} />
            </div>
          )}

          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a1a', marginBottom: '6px' }}>Email address</div>
            <input type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', border: '1px solid #ddd', borderRadius: '10px', fontSize: '14px', outline: 'none' }} />
          </div>

          {mode !== 'forgot' && (
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a1a', marginBottom: '6px' }}>Password</div>
              <input type="password" placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)}
                style={{ width: '100%', padding: '11px 14px', border: '1px solid #ddd', borderRadius: '10px', fontSize: '14px', outline: 'none' }} />
            </div>
          )}

          {mode === 'login' && (
            <div style={{ textAlign: 'right', marginBottom: '20px' }}>
              <span onClick={() => { setMode('forgot'); setError(''); setMessage('') }}
                style={{ fontSize: '13px', color: '#378ADD', cursor: 'pointer' }}>
                Forgot password?
              </span>
            </div>
          )}

          {mode !== 'login' && <div style={{ marginBottom: '20px' }} />}

          {error && (
            <div style={{ background: '#FCEBEB', color: '#A32D2D', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>
              {error}
            </div>
          )}

          {message && (
            <div style={{ background: '#EAF3DE', color: '#3B6D11', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>
              {message}
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading}
            style={{ width: '100%', padding: '13px', background: loading ? '#aaa' : '#378ADD', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset link'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#666' }}>
            {mode === 'forgot' ? (
              <span onClick={() => { setMode('login'); setError(''); setMessage('') }}
                style={{ color: '#378ADD', cursor: 'pointer', fontWeight: '500' }}>
                Back to sign in
              </span>
            ) : mode === 'login' ? (
              <>Don't have an account? <span onClick={() => { setMode('signup'); setError(''); setMessage('') }} style={{ color: '#378ADD', cursor: 'pointer', fontWeight: '500' }}>Sign up</span></>
            ) : (
              <>Already have an account? <span onClick={() => { setMode('login'); setError(''); setMessage('') }} style={{ color: '#378ADD', cursor: 'pointer', fontWeight: '500' }}>Sign in</span></>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}