'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

const ADMIN_EMAIL = 'sahilshek135@gmail.com'

type Product = {
  id: string
  name: string
  brand: string
  category: string
  emoji: string
  description: string
  score: number
  reviews_count: number
  price: number
}

type Review = {
  id: string
  reviewer_name: string
  title: string
  score: number
  star_rating: number
  approved: boolean
  created_at: string
  products: { name: string }
}

const emojis = ['🎧','📱','💻','💇','👟','🍳','🎵','🏃','📖','🥘','👖','🎼','📷','🎮','👜','⌚','🖥️','🎁']

export default function AdminPage() {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [checking, setChecking] = useState(true)
  const [tab, setTab] = useState<'products' | 'reviews' | 'add'>('products')
  const [products, setProducts] = useState<Product[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [adminEmail, setAdminEmail] = useState('')

  const [form, setForm] = useState({
    name: '', brand: '', category: 'Tech', emoji: '🎧',
    description: '', score: '8.5', price: '', reviews_count: '0'
  })

  const categories = ['Tech', 'Beauty', 'Fashion', 'Home', 'Sports', 'Food', 'Automotive']

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }
    setAdminEmail(session.user.email || '')
    setAuthorized(true)
    setChecking(false)
    loadData()
  }

  async function loadData() {
    setLoading(true)
    const { data: prods } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    if (prods) setProducts(prods)
    const { data: revs } = await supabase.from('reviews').select('*, products(name)').order('created_at', { ascending: false })
    if (revs) setReviews(revs as Review[])
    setLoading(false)
  }

  async function addProduct() {
    setSaving(true)
    setMessage('')
    if (!form.name || !form.brand || !form.price) {
      setMessage('Please fill in name, brand and price!')
      setSaving(false)
      return
    }
    const { error } = await supabase.from('products').insert({
      name: form.name,
      brand: form.brand,
      category: form.category,
      emoji: form.emoji,
      description: form.description,
      score: parseFloat(form.score),
      price: parseInt(form.price),
      reviews_count: parseInt(form.reviews_count),
    })
    if (error) {
      setMessage('Error: ' + error.message)
    } else {
      setMessage('Product added successfully!')
      setForm({ name: '', brand: '', category: 'Tech', emoji: '🎧', description: '', score: '8.5', price: '', reviews_count: '0' })
      loadData()
      setTimeout(() => setTab('products'), 1500)
    }
    setSaving(false)
  }

  async function deleteProduct(id: string) {
    await supabase.from('products').delete().eq('id', id)
    setDeleteConfirm(null)
    loadData()
  }

  async function approveReview(id: string) {
    await supabase.from('reviews').update({ approved: true }).eq('id', id)
    loadData()
  }

  async function deleteReview(id: string) {
    await supabase.from('reviews').delete().eq('id', id)
    loadData()
  }

  const pendingReviews = reviews.filter(r => !r.approved)
  const approvedReviews = reviews.filter(r => r.approved)

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f8f6' }}>
        <div style={{ fontSize: '16px', color: '#666' }}>Checking access...</div>
      </div>
    )
  }

  if (!authorized) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f8f6' }}>
        <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>🔒</div>
          <h2 style={{ fontSize: '20px', fontWeight: '500', marginBottom: '8px' }}>Access denied</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>You don't have permission to access this page.</p>
          <Link href="/" style={{ padding: '10px 24px', background: '#378ADD', color: '#fff', borderRadius: '8px', textDecoration: 'none' }}>Go home</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f6' }}>

      <nav style={{ background: '#1a1a1a', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '18px', fontWeight: '500', color: '#fff' }}>
          Get<span style={{ color: '#378ADD' }}>Smart</span>Reviews <span style={{ fontSize: '12px', background: '#378ADD', padding: '2px 8px', borderRadius: '4px', marginLeft: '8px' }}>Admin</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link href="/" style={{ fontSize: '13px', color: '#aaa', textDecoration: 'none' }}>View site</Link>
          <span style={{ fontSize: '13px', color: '#aaa' }}>👋 {adminEmail}</span>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/login') }}
            style={{ padding: '6px 14px', background: 'transparent', border: '1px solid #555', color: '#aaa', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
            Sign out
          </button>
        </div>
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', minHeight: 'calc(100vh - 57px)' }}>

        <div style={{ background: '#fff', borderRight: '1px solid #eee', padding: '20px 0' }}>
          {[
            { key: 'products', label: '📦 Products', count: products.length },
            { key: 'reviews', label: '⭐ Reviews', count: pendingReviews.length },
            { key: 'add', label: '➕ Add product', count: null },
          ].map(item => (
            <div key={item.key} onClick={() => setTab(item.key as typeof tab)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', cursor: 'pointer', background: tab === item.key ? '#E6F1FB' : 'transparent', borderRight: tab === item.key ? '3px solid #378ADD' : 'none', color: tab === item.key ? '#185FA5' : '#666', fontSize: '14px', fontWeight: tab === item.key ? '500' : '400' }}>
              <span>{item.label}</span>
              {item.count !== null && <span style={{ background: item.key === 'reviews' && item.count > 0 ? '#E24B4A' : '#eee', color: item.key === 'reviews' && item.count > 0 ? '#fff' : '#666', fontSize: '11px', padding: '1px 7px', borderRadius: '20px' }}>{item.count}</span>}
            </div>
          ))}

          <div style={{ margin: '20px 10px 0', padding: '12px', background: '#f8f8f6', borderRadius: '8px' }}>
            <div style={{ fontSize: '11px', color: '#999', marginBottom: '6px' }}>API Connections</div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#E24B4A', display: 'inline-block' }}></span>
              Amazon API
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#E24B4A', display: 'inline-block' }}></span>
              Flipkart API
            </div>
            <button onClick={() => setTab('add')}
              style={{ width: '100%', padding: '6px', fontSize: '11px', background: '#378ADD', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              Connect APIs
            </button>
          </div>
        </div>

        <div style={{ padding: '24px' }}>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>Loading...</div>
          ) : (
            <>
              {tab === 'products' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h1 style={{ fontSize: '20px', fontWeight: '500', color: '#1a1a1a' }}>All products ({products.length})</h1>
                    <button onClick={() => setTab('add')} style={{ padding: '9px 18px', background: '#378ADD', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>+ Add product</button>
                  </div>
                  <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ background: '#f8f8f6' }}>
                          <th style={{ textAlign: 'left', padding: '12px 16px', color: '#666', fontWeight: '500' }}>Product</th>
                          <th style={{ textAlign: 'left', padding: '12px 16px', color: '#666', fontWeight: '500' }}>Category</th>
                          <th style={{ textAlign: 'left', padding: '12px 16px', color: '#666', fontWeight: '500' }}>Score</th>
                          <th style={{ textAlign: 'left', padding: '12px 16px', color: '#666', fontWeight: '500' }}>Price</th>
                          <th style={{ textAlign: 'left', padding: '12px 16px', color: '#666', fontWeight: '500' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map(p => (
                          <tr key={p.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '22px' }}>{p.emoji}</span>
                                <div>
                                  <div style={{ fontWeight: '500', color: '#1a1a1a' }}>{p.name}</div>
                                  <div style={{ color: '#999', fontSize: '12px' }}>by {p.brand}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{ background: '#E6F1FB', color: '#185FA5', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>{p.category}</span>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{ color: '#3B6D11', fontWeight: '500' }}>{p.score}</span>
                            </td>
                            <td style={{ padding: '12px 16px' }}>₹{p.price.toLocaleString('en-IN')}</td>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <Link href={`/product/${p.id}`} style={{ padding: '5px 10px', fontSize: '12px', border: '1px solid #ddd', borderRadius: '6px', textDecoration: 'none', color: '#1a1a1a', background: '#fff' }}>View</Link>
                                {deleteConfirm === p.id ? (
                                  <div style={{ display: 'flex', gap: '4px' }}>
                                    <button onClick={() => deleteProduct(p.id)} style={{ padding: '5px 10px', fontSize: '12px', border: 'none', borderRadius: '6px', background: '#E24B4A', color: '#fff', cursor: 'pointer' }}>Confirm</button>
                                    <button onClick={() => setDeleteConfirm(null)} style={{ padding: '5px 10px', fontSize: '12px', border: '1px solid #ddd', borderRadius: '6px', background: '#fff', cursor: 'pointer' }}>Cancel</button>
                                  </div>
                                ) : (
                                  <button onClick={() => setDeleteConfirm(p.id)} style={{ padding: '5px 10px', fontSize: '12px', border: '1px solid #F7C1C1', borderRadius: '6px', background: '#FCEBEB', color: '#A32D2D', cursor: 'pointer' }}>Delete</button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {tab === 'reviews' && (
                <div>
                  <h1 style={{ fontSize: '20px', fontWeight: '500', color: '#1a1a1a', marginBottom: '20px' }}>Reviews</h1>
                  {pendingReviews.length > 0 && (
                    <div style={{ marginBottom: '24px' }}>
                      <h2 style={{ fontSize: '15px', fontWeight: '500', color: '#A32D2D', marginBottom: '12px' }}>⏳ Pending approval ({pendingReviews.length})</h2>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {pendingReviews.map(r => (
                          <div key={r.id} style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                <div style={{ fontWeight: '500', color: '#1a1a1a', marginBottom: '2px' }}>{r.title}</div>
                                <div style={{ fontSize: '12px', color: '#666' }}>by {r.reviewer_name} · {r.products?.name} · Score: {r.score}/10</div>
                              </div>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button onClick={() => approveReview(r.id)} style={{ padding: '6px 14px', fontSize: '12px', border: 'none', borderRadius: '6px', background: '#EAF3DE', color: '#3B6D11', cursor: 'pointer', fontWeight: '500' }}>✓ Approve</button>
                                <button onClick={() => deleteReview(r.id)} style={{ padding: '6px 14px', fontSize: '12px', border: 'none', borderRadius: '6px', background: '#FCEBEB', color: '#A32D2D', cursor: 'pointer' }}>✗ Reject</button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <h2 style={{ fontSize: '15px', fontWeight: '500', color: '#3B6D11', marginBottom: '12px' }}>✓ Approved ({approvedReviews.length})</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {approvedReviews.map(r => (
                        <div key={r.id} style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: '500', color: '#1a1a1a', marginBottom: '2px' }}>{r.title}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>by {r.reviewer_name} · {r.products?.name}</div>
                          </div>
                          <button onClick={() => deleteReview(r.id)} style={{ padding: '6px 14px', fontSize: '12px', border: 'none', borderRadius: '6px', background: '#FCEBEB', color: '#A32D2D', cursor: 'pointer' }}>Delete</button>
                        </div>
                      ))}
                      {approvedReviews.length === 0 && <div style={{ color: '#666', fontSize: '14px' }}>No approved reviews yet.</div>}
                    </div>
                  </div>
                </div>
              )}

              {tab === 'add' && (
                <div style={{ maxWidth: '600px' }}>
                  <h1 style={{ fontSize: '20px', fontWeight: '500', color: '#1a1a1a', marginBottom: '20px' }}>Add new product</h1>

                  <div style={{ background: '#E6F1FB', border: '1px solid #B5D4F4', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#0C447C', marginBottom: '8px' }}>🔗 Affiliate API connections</div>
                    <div style={{ fontSize: '13px', color: '#185FA5', marginBottom: '12px' }}>Connect your affiliate APIs to auto-import products and prices</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div style={{ background: '#fff', borderRadius: '8px', padding: '12px', border: '1px solid #B5D4F4' }}>
                        <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a1a', marginBottom: '4px' }}>Amazon PA API</div>
                        <div style={{ fontSize: '11px', color: '#999', marginBottom: '8px' }}>Auto-import Amazon products</div>
                        <input placeholder="Your Amazon API key" style={{ width: '100%', padding: '7px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '12px', outline: 'none', marginBottom: '6px' }} />
                        <button style={{ width: '100%', padding: '7px', background: '#FF9900', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>Connect Amazon</button>
                      </div>
                      <div style={{ background: '#fff', borderRadius: '8px', padding: '12px', border: '1px solid #B5D4F4' }}>
                        <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a1a', marginBottom: '4px' }}>Flipkart API</div>
                        <div style={{ fontSize: '11px', color: '#999', marginBottom: '8px' }}>Auto-import Flipkart products</div>
                        <input placeholder="Your Flipkart API key" style={{ width: '100%', padding: '7px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '12px', outline: 'none', marginBottom: '6px' }} />
                        <button style={{ width: '100%', padding: '7px', background: '#FF9F00', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>Connect Flipkart</button>
                      </div>
                    </div>
                  </div>

                  <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '16px', padding: '24px' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '16px' }}>Add manually</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Product name *</div>
                        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Sony WH-1000XM6"
                          style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '13px', outline: 'none' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Brand *</div>
                        <input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} placeholder="e.g. Sony"
                          style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '13px', outline: 'none' }} />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Category</div>
                        <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                          style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#fff' }}>
                          {categories.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Price (₹) *</div>
                        <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="e.g. 24990"
                          style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '13px', outline: 'none' }} />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Score (out of 10)</div>
                        <input type="number" min="0" max="10" step="0.1" value={form.score} onChange={e => setForm(f => ({ ...f, score: e.target.value }))}
                          style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '13px', outline: 'none' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Review count</div>
                        <input type="number" value={form.reviews_count} onChange={e => setForm(f => ({ ...f, reviews_count: e.target.value }))}
                          style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '13px', outline: 'none' }} />
                      </div>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Description</div>
                      <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description..."
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '13px', outline: 'none', minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }} />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>Emoji icon</div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {emojis.map(e => (
                          <div key={e} onClick={() => setForm(f => ({ ...f, emoji: e }))}
                            style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', border: `2px solid ${form.emoji === e ? '#378ADD' : '#eee'}`, borderRadius: '8px', cursor: 'pointer', background: form.emoji === e ? '#E6F1FB' : '#fff' }}>
                            {e}
                          </div>
                        ))}
                      </div>
                    </div>
                    {message && (
                      <div style={{ background: message.includes('Error') ? '#FCEBEB' : '#EAF3DE', color: message.includes('Error') ? '#A32D2D' : '#3B6D11', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>
                        {message}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => setTab('products')} style={{ padding: '10px 20px', border: '1px solid #ddd', borderRadius: '8px', background: '#fff', fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
                      <button onClick={addProduct} disabled={saving}
                        style={{ flex: 1, padding: '10px', background: saving ? '#aaa' : '#3B6D11', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: '500' }}>
                        {saving ? 'Saving...' : 'Add product'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}