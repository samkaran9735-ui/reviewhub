'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const products = [
  'Sony WH-1000XM6',
  'Samsung Galaxy S25 Ultra',
  'Dyson Airwrap',
  'Nike Air Max 2025',
  'Instant Pot Duo',
  'MacBook Pro M4',
  'Apple AirPods Pro 3',
  'Adidas Ultraboost 25',
]

export default function SubmitReviewPage() {
  const [step, setStep] = useState(1)
  const [stars, setStars] = useState(5)
  const [submitted, setSubmitted] = useState(false)
  const [scores, setScores] = useState({ q1: 9, q2: 9, q3: 8, q4: 8, q5: 8 })
  const [user, setUser] = useState<{ email?: string } | null | undefined>(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
  }, [])

  const scoreLabels = ['q1', 'q2', 'q3', 'q4', 'q5']
  const scoreNames = ['Sound / Performance', 'Design & Build', 'Battery / Durability', 'Value for money', 'Overall experience']
  const starLabels = ['', 'Terrible', 'Poor', 'Average', 'Good', 'Excellent!']

  const avg = (Object.values(scores).reduce((a, b) => a + b, 0) / 5).toFixed(1)

  if (user === undefined) return null // loading

  if (user === null) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f8f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '20px', padding: '48px', textAlign: 'center', maxWidth: '420px', width: '100%' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>✍️</div>
          <h2 style={{ fontSize: '20px', fontWeight: '500', color: '#1a1a1a', marginBottom: '8px' }}>Sign in to submit a review</h2>
          <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6', marginBottom: '28px' }}>
            You need to be logged in to share your review. Join thousands of honest reviewers helping others buy smarter.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link href="/login" style={{ display: 'block', padding: '12px', background: '#378ADD', color: '#fff', borderRadius: '10px', fontSize: '15px', textDecoration: 'none', fontWeight: '500' }}>
              Sign in
            </Link>
            <Link href="/login" style={{ display: 'block', padding: '12px', background: '#fff', color: '#378ADD', border: '1px solid #378ADD', borderRadius: '10px', fontSize: '15px', textDecoration: 'none' }}>
              Create an account
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f8f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '20px', padding: '48px', textAlign: 'center', maxWidth: '480px' }}>
          <div style={{ width: '64px', height: '64px', background: '#EAF3DE', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '28px' }}>
            ✓
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '500', color: '#1a1a1a', marginBottom: '10px' }}>Review submitted!</h2>
          <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6', marginBottom: '24px' }}>
            Thank you! Your review will go live within 24 hours after our team reviews it.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={() => { setSubmitted(false); setStep(1); setStars(5) }}
              style={{ padding: '10px 20px', border: '1px solid #ddd', borderRadius: '10px', background: '#fff', fontSize: '14px', cursor: 'pointer' }}
            >
              Submit another
            </button>
            <Link href="/" style={{ padding: '10px 20px', background: '#378ADD', color: '#fff', borderRadius: '10px', fontSize: '14px', textDecoration: 'none', fontWeight: '500' }}>
              Browse products
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f6' }}>

      <nav style={{ background: '#fff', borderBottom: '1px solid #eee', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ fontSize: '20px', fontWeight: '500', textDecoration: 'none', color: '#1a1a1a' }}>
          Review<span style={{ color: '#378ADD' }}>Hub</span>
        </Link>
        <div style={{ display: 'flex', gap: '24px' }}>
          <Link href="/browse" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>Browse</Link>
          <Link href="/trending" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>Trending</Link>
          <Link href="/recommendations" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>Recommendations</Link>
          <Link href="/compare" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>Compare</Link>
          <Link href="/submit-review" style={{ fontSize: '14px', color: '#378ADD', textDecoration: 'none', fontWeight: '500' }}>Submit review</Link>
        </div>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', color: '#666' }}>👋 {user.email}</span>
            <button onClick={async () => { await supabase.auth.signOut(); setUser(null) }}
              style={{ padding: '8px 16px', background: '#fff', color: '#378ADD', border: '1px solid #378ADD', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
              Sign out
            </button>
          </div>
        ) : (
          <Link href="/login" style={{ padding: '8px 18px', background: '#378ADD', color: '#fff', borderRadius: '8px', fontSize: '14px', textDecoration: 'none' }}>
            Sign in
          </Link>
        )}
      </nav>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '24px' }}>

        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '500', color: '#1a1a1a', marginBottom: '4px' }}>Submit a review</h1>
          <p style={{ fontSize: '14px', color: '#666' }}>Share your honest experience to help other buyers</p>
        </div>

        <div style={{ display: 'flex', gap: '0', marginBottom: '24px', background: '#fff', border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden' }}>
          {['Product', 'Ratings', 'Your review', 'Submit'].map((label, i) => (
            <div key={label} style={{ flex: 1, padding: '12px', textAlign: 'center', background: step === i + 1 ? '#378ADD' : step > i + 1 ? '#EAF3DE' : '#fff', borderRight: i < 3 ? '1px solid #eee' : 'none' }}>
              <div style={{ fontSize: '12px', fontWeight: '500', color: step === i + 1 ? '#fff' : step > i + 1 ? '#3B6D11' : '#999' }}>
                {step > i + 1 ? '✓ ' : `${i + 1}. `}{label}
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '16px', overflow: 'hidden' }}>

          {step === 1 && (
            <div style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '16px' }}>Which product are you reviewing?</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                {products.map(p => (
                  <div key={p} style={{ padding: '12px 14px', border: '1px solid #ddd', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', color: '#1a1a1a' }}
                    onClick={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#378ADD'; (e.currentTarget as HTMLDivElement).style.background = '#E6F1FB' }}>
                    {p}
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', color: '#666', marginBottom: '6px' }}>Or search for a product</div>
                <input placeholder="Type product name..." style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '16px' }}>How would you rate it?</h2>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a1a', marginBottom: '8px' }}>Overall star rating</div>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <span key={n} onClick={() => setStars(n)} style={{ fontSize: '32px', cursor: 'pointer', color: n <= stars ? '#BA7517' : '#ddd' }}>★</span>
                  ))}
                </div>
                <div style={{ fontSize: '13px', color: '#666' }}>{stars} star{stars > 1 ? 's' : ''} — {starLabels[stars]}</div>
              </div>

              <div style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a1a', marginBottom: '12px' }}>Score breakdown</div>
                {scoreLabels.map((key, i) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ fontSize: '13px', color: '#666', minWidth: '170px' }}>{scoreNames[i]}</div>
                    <input
                      type="range" min="1" max="10" step="1"
                      value={scores[key as keyof typeof scores]}
                      onChange={e => setScores(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                      style={{ flex: 1 }}
                    />
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#3B6D11', minWidth: '24px', textAlign: 'right' }}>
                      {scores[key as keyof typeof scores]}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background: '#EAF3DE', borderRadius: '10px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#3B6D11' }}>Your average score</span>
                <span style={{ fontSize: '20px', fontWeight: '500', color: '#3B6D11' }}>{avg} / 10</span>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '16px' }}>Write your review</h2>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a1a', marginBottom: '6px' }}>Review title</div>
                <input placeholder="Summarise your experience in one line..." style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a1a', marginBottom: '6px' }}>Your full review</div>
                <textarea placeholder="Write about what you liked, what could be better, and who you would recommend it to..." style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', outline: 'none', minHeight: '120px', resize: 'vertical', fontFamily: 'inherit' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a1a', marginBottom: '6px' }}>How long have you used it?</div>
                  <select style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', outline: 'none', background: '#fff' }}>
                    <option>Less than a week</option>
                    <option>1-4 weeks</option>
                    <option>1-3 months</option>
                    <option>3-6 months</option>
                    <option>6+ months</option>
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a1a', marginBottom: '6px' }}>Where did you buy it?</div>
                  <select style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', outline: 'none', background: '#fff' }}>
                    <option>Flipkart</option>
                    <option>Amazon India</option>
                    <option>Meesho</option>
                    <option>Croma</option>
                    <option>Official store</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '16px' }}>Almost done!</h2>
              <div style={{ background: '#f8f8f6', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  <div><div style={{ fontSize: '11px', color: '#999' }}>Product</div><div style={{ fontSize: '13px', color: '#1a1a1a' }}>Sony WH-1000XM6</div></div>
                  <div><div style={{ fontSize: '11px', color: '#999' }}>Your score</div><div style={{ fontSize: '13px', color: '#3B6D11', fontWeight: '500' }}>{avg} / 10</div></div>
                  <div><div style={{ fontSize: '11px', color: '#999' }}>Star rating</div><div style={{ fontSize: '13px', color: '#BA7517' }}>{'★'.repeat(stars)} {stars}/5</div></div>
                </div>
                <div style={{ fontSize: '12px', color: '#666', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                  Your review will go live after admin approval, usually within 24 hours.
                </div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a1a', marginBottom: '6px' }}>Your name (shown publicly)</div>
                <input placeholder="e.g. Rahul S." style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a1a', marginBottom: '6px' }}>Email (not shown publicly)</div>
                <input type="email" placeholder="you@email.com" style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <input type="checkbox" defaultChecked style={{ marginTop: '2px', width: 'auto' }} />
                <label style={{ fontSize: '12px', color: '#666', lineHeight: '1.5' }}>
                  I confirm this is my genuine experience and not a paid review. I agree to ReviewHub community guidelines.
                </label>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid #eee', background: '#f8f8f6' }}>
            <button
              onClick={() => setStep(s => Math.max(1, s - 1))}
              style={{ padding: '9px 20px', border: '1px solid #ddd', borderRadius: '10px', background: '#fff', fontSize: '13px', cursor: 'pointer', visibility: step === 1 ? 'hidden' : 'visible' }}
            >
              Back
            </button>
            <div style={{ fontSize: '12px', color: '#999' }}>Step {step} of 4</div>
            <button
              onClick={() => step < 4 ? setStep(s => s + 1) : setSubmitted(true)}
              style={{ padding: '9px 24px', background: step === 4 ? '#3B6D11' : '#378ADD', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}
            >
              {step === 4 ? 'Submit review' : 'Continue'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}