'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
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

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setMessage('Logged in successfully!')
        setTimeout(() => router.push('/'), 1000)
      }
    } else {
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
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>👋</div>
            <h1 style={{ fontSize: '22px', fontWeight: '500', color: '#1a1a1a', marginBottom: '4px' }}>
              {isLogin ? 'Welcome back!' : 'Create your account'}
            </h1>
            <p style={{ fontSize: '14px', color: '#666' }}>
              {isLogin ? 'Sign in to your account' : 'Join thousands of smart buyers'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0', marginBottom: '24px', background: '#f8f8f6', borderRadius: '10px', padding: '4px' }}>
            <button
              onClick={() => setIsLogin(true)}
              style={{ flex: 1, padding: '9px', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', background: isLogin ? '#fff' : 'transparent', color: isLogin ? '#1a1a1a' : '#666', fontWeight: isLogin ? '500' : '400' }}
            >
              Sign in
            </button>
            <button
              onClick={() => setIsLogin(false)}
              style={{ flex: 1, padding: '9px', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', background: !isLogin ? '#fff' : 'transparent', color: !isLogin ? '#1a1a1a' : '#666', fontWeight: !isLogin ? '500' : '400' }}
            >
              Sign up
            </button>
          </div>

          {!isLogin && (
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a1a', marginBottom: '6px' }}>Your name</div>
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{ width: '100%', padding: '11px 14px', border: '1px solid #ddd', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
              />
            </div>
          )}

          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a1a', marginBottom: '6px' }}>Email address</div>
            <input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', border: '1px solid #ddd', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a1a', marginBottom: '6px' }}>Password</div>
            <input
              type="password"
              placeholder="Min 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', border: '1px solid #ddd', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
            />
          </div>

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

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ width: '100%', padding: '13px', background: loading ? '#aaa' : '#378ADD', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#666' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span
              onClick={() => setIsLogin(!isLogin)}
              style={{ color: '#378ADD', cursor: 'pointer', fontWeight: '500' }}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </span>
          </div>

        </div>
      </div>
    </div>
  )
}