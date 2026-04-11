'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

type Product = {
  id: string
  name: string
  brand: string
  category: string
  emoji: string
  image_url?: string
  score: number
  reviews_count: number
  price: number
}

const categories = ['Tech', 'Beauty', 'Fashion', 'Home', 'Sports']

const categoryDescriptions: Record<string, string> = {
  Tech: 'Top-rated gadgets chosen by our editors',
  Beauty: 'Loved by thousands of verified buyers',
  Fashion: 'Best value picks this season',
  Home: 'Most recommended by families',
  Sports: 'Gear that professionals trust',
}

const categoryEmojis: Record<string, string> = {
  Tech: '💡',
  Beauty: '✨',
  Fashion: '👗',
  Home: '🏠',
  Sports: '🏆',
}

export default function RecommendationsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('Tech')

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .order('score', { ascending: false })
      .then(({ data }) => {
        if (data) setProducts(data)
        setLoading(false)
      })
  }, [])

  const filtered = products.filter(p => p.category === activeCategory).slice(0, 6)

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f6' }}>

      <nav style={{ background: '#fff', borderBottom: '1px solid #eee', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/" style={{ fontSize: '20px', fontWeight: '500', textDecoration: 'none', color: '#1a1a1a' }}>
          Get<span style={{ color: '#378ADD' }}>Smart</span>Reviews
        </Link>
        <div style={{ display: 'flex', gap: '24px' }}>
          <Link href="/browse" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>Browse</Link>
          <Link href="/trending" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>Trending</Link>
          <Link href="/recommendations" style={{ fontSize: '14px', color: '#378ADD', textDecoration: 'none', fontWeight: '500' }}>Recommendations</Link>
          <Link href="/compare" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>Compare</Link>
          <Link href="/submit-review" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>Submit review</Link>
        </div>
        <Link href="/login" style={{ padding: '8px 18px', background: '#378ADD', color: '#fff', borderRadius: '8px', fontSize: '14px', textDecoration: 'none' }}>
          Sign in
        </Link>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 24px' }}>

        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ fontSize: '26px' }}>⭐</span>
            <h1 style={{ fontSize: '24px', fontWeight: '500', color: '#1a1a1a' }}>Recommendations</h1>
          </div>
          <p style={{ fontSize: '14px', color: '#666' }}>Hand-picked products based on expert reviews and community ratings</p>
        </div>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '8px 18px', borderRadius: '20px', border: '1px solid #ddd', fontSize: '13px', cursor: 'pointer',
                background: activeCategory === cat ? '#378ADD' : '#fff',
                color: activeCategory === cat ? '#fff' : '#666',
                fontWeight: activeCategory === cat ? '500' : '400'
              }}
            >
              {categoryEmojis[cat]} {cat}
            </button>
          ))}
        </div>

        {/* Category description */}
        <div style={{ background: '#E6F1FB', border: '1px solid #B5D4F4', borderRadius: '12px', padding: '14px 18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>{categoryEmojis[activeCategory]}</span>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#0C447C' }}>{activeCategory} Picks</div>
            <div style={{ fontSize: '13px', color: '#185FA5' }}>{categoryDescriptions[activeCategory]}</div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>No products found in this category yet.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
            {filtered.map((product, i) => (
              <div key={product.id} style={{ background: '#fff', border: '1px solid #eee', borderRadius: '14px', overflow: 'hidden', position: 'relative' }}>
                {i === 0 && (
                  <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#BA7517', color: '#fff', borderRadius: '8px', padding: '2px 8px', fontSize: '11px', fontWeight: '600', zIndex: 1 }}>
                    ⭐ Top Pick
                  </div>
                )}
                <Link href={`/product/${product.id}`} style={{ background: '#f8f8f6', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', cursor: 'pointer', overflow: 'hidden' }}>
                  {product.image_url
                    ? <img src={product.image_url} alt={product.name} style={{ display: 'block', width: '100%', height: '140px', objectFit: 'contain', padding: '10px' }} />
                    : <span style={{ fontSize: '52px' }}>{product.emoji}</span>}
                </Link>
                <div style={{ padding: '14px' }}>
                  <div style={{ fontSize: '11px', background: '#E6F1FB', color: '#185FA5', padding: '2px 8px', borderRadius: '4px', display: 'inline-block', marginBottom: '6px' }}>
                    {product.category}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a1a', marginBottom: '2px' }}>{product.name}</div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>by {product.brand}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ color: '#BA7517', fontSize: '12px' }}>★★★★★ <span style={{ color: '#999' }}>({product.reviews_count.toLocaleString()})</span></span>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: '#3B6D11', background: '#EAF3DE', padding: '2px 7px', borderRadius: '4px' }}>{product.score}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>From ₹{product.price.toLocaleString('en-IN')}</div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <Link href="/compare" style={{ flex: 1, padding: '7px', fontSize: '12px', border: '1px solid #ddd', borderRadius: '8px', background: '#fff', textAlign: 'center', textDecoration: 'none', color: '#1a1a1a' }}>
                      Compare
                    </Link>
                    <Link href={`/product/${product.id}`} style={{ flex: 1, padding: '7px', fontSize: '12px', border: 'none', borderRadius: '8px', background: '#3B6D11', color: '#fff', textAlign: 'center', textDecoration: 'none' }}>
                      Buy
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
