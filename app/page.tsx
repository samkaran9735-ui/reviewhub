'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Product = {
  id: string
  name: string
  brand: string
  category: string
  emoji: string
  score: number
  reviews_count: number
  price: number
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ email: string } | null>(null)

  useEffect(() => {
    async function loadProducts() {
      const { data } = await supabase.from('products').select('*').order('score', { ascending: false })
      if (data) setProducts(data)
      setLoading(false)
    }
    loadProducts()

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
  }, [])

  const filtered = products
    .filter(p => category === 'All' || p.category === category)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f6' }}>

      <nav style={{ background: '#fff', borderBottom: '1px solid #eee', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '20px', fontWeight: '500' }}>
          Get<span style={{ color: '#378ADD' }}>Smart</span>Reviews
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          <Link href="/browse" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>Browse</Link>
          <Link href="/compare" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>Compare</Link>
          <Link href="/submit-review" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>Submit review</Link>
        </div>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', color: '#666' }}>👋 {user.email}</span>
            <button
              onClick={async () => { await supabase.auth.signOut(); setUser(null) }}
              style={{ padding: '8px 18px', background: '#fff', color: '#378ADD', border: '1px solid #378ADD', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}
            >
              Sign out
            </button>
          </div>
        ) : (
          <Link href="/login" style={{ padding: '8px 18px', background: '#378ADD', color: '#fff', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', textDecoration: 'none' }}>
            Sign in
          </Link>
        )}
      </nav>

      <div style={{ background: '#E6F1FB', borderBottom: '1px solid #B5D4F4', padding: '10px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '10px', background: '#fff', border: '1px solid #B5D4F4', color: '#185FA5', padding: '2px 6px', borderRadius: '4px' }}>Ad</span>
          <span style={{ fontSize: '13px', color: '#0C447C' }}>Flipkart Big Billion Days — up to 80% off on electronics, fashion and more</span>
        </div>
        <span style={{ fontSize: '13px', color: '#185FA5', cursor: 'pointer', fontWeight: '500' }}>Shop now →</span>
      </div>

      <div style={{ textAlign: 'center', padding: '48px 24px 32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '500', color: '#1a1a1a', marginBottom: '12px' }}>
          Find the best products, reviewed by real people
        </h1>
        <p style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>
          Honest reviews across tech, beauty, food, fashion and more
        </p>
        <div style={{ display: 'flex', maxWidth: '520px', margin: '0 auto', border: '1px solid #ddd', borderRadius: '12px', overflow: 'hidden', background: '#fff' }}>
          <input
            placeholder="Search products, brands..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, padding: '12px 16px', border: 'none', outline: 'none', fontSize: '14px' }}
          />
          <button style={{ padding: '12px 20px', background: '#378ADD', color: '#fff', border: 'none', fontSize: '14px', cursor: 'pointer' }}>
            Search
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', padding: '0 24px 20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {['All', 'Tech', 'Beauty', 'Fashion', 'Home', 'Sports'].map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} style={{ padding: '6px 16px', borderRadius: '20px', border: '1px solid #ddd', background: category === cat ? '#378ADD' : '#fff', color: category === cat ? '#fff' : '#666', fontSize: '13px', cursor: 'pointer' }}>
            {cat}
          </button>
        ))}
      </div>

      <div style={{ padding: '0 24px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '16px', color: '#1a1a1a' }}>
          {loading ? 'Loading products...' : `${filtered.length} products found`}
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>Loading...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {filtered.map(product => (
              <div key={product.id} style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ background: '#f8f8f6', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>
                  {product.emoji}
                </div>
                <div style={{ padding: '12px' }}>
                  <div style={{ fontSize: '11px', background: '#E6F1FB', color: '#185FA5', padding: '2px 8px', borderRadius: '4px', display: 'inline-block', marginBottom: '6px' }}>
                    {product.category}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a1a', marginBottom: '2px' }}>{product.name}</div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>by {product.brand}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <span style={{ color: '#BA7517', fontSize: '12px' }}>★★★★★</span>
                      <span style={{ fontSize: '11px', color: '#666', marginLeft: '4px' }}>({product.reviews_count.toLocaleString()})</span>
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: '500', color: '#3B6D11', background: '#EAF3DE', padding: '2px 8px', borderRadius: '4px' }}>
                      {product.score}
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>From ₹{product.price.toLocaleString('en-IN')}</div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <Link href="/compare" style={{ flex: 1, padding: '7px', fontSize: '12px', border: '1px solid #ddd', borderRadius: '8px', background: '#fff', cursor: 'pointer', textAlign: 'center', textDecoration: 'none', color: '#1a1a1a' }}>
                      Compare
                    </Link>
                    <Link href={`/product/${product.id}`} style={{ flex: 1, padding: '7px', fontSize: '12px', border: 'none', borderRadius: '8px', background: '#378ADD', color: '#fff', cursor: 'pointer', textAlign: 'center', textDecoration: 'none' }}>
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}