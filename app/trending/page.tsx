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
  score: number
  reviews_count: number
  price: number
}

const trendingReasons = [
  'Most reviewed this week',
  'Highest rated in category',
  'Price dropped recently',
  'Trending on social media',
  'Editor\'s pick',
  'Best seller',
]

export default function TrendingPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .order('reviews_count', { ascending: false })
      .limit(12)
      .then(({ data }) => {
        if (data) setProducts(data)
        setLoading(false)
      })
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f6' }}>

      <nav style={{ background: '#fff', borderBottom: '1px solid #eee', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/" style={{ fontSize: '20px', fontWeight: '500', textDecoration: 'none', color: '#1a1a1a' }}>
          Get<span style={{ color: '#378ADD' }}>Smart</span>Reviews
        </Link>
        <div style={{ display: 'flex', gap: '24px' }}>
          <Link href="/browse" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>Browse</Link>
          <Link href="/trending" style={{ fontSize: '14px', color: '#378ADD', textDecoration: 'none', fontWeight: '500' }}>Trending</Link>
          <Link href="/recommendations" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>Recommendations</Link>
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
            <span style={{ fontSize: '26px' }}>🔥</span>
            <h1 style={{ fontSize: '24px', fontWeight: '500', color: '#1a1a1a' }}>Trending Now</h1>
          </div>
          <p style={{ fontSize: '14px', color: '#666' }}>The most popular products people are talking about right now</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>Loading...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
            {products.map((product, i) => (
              <div key={product.id} style={{ background: '#fff', border: '1px solid #eee', borderRadius: '14px', overflow: 'hidden', position: 'relative' }}>
                {/* Rank badge */}
                <div style={{ position: 'absolute', top: '10px', left: '10px', background: i < 3 ? '#BA7517' : '#378ADD', color: '#fff', borderRadius: '8px', padding: '2px 8px', fontSize: '11px', fontWeight: '600', zIndex: 1 }}>
                  #{i + 1}
                </div>
                <Link href={`/product/${product.id}`} style={{ background: '#f8f8f6', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '52px', textDecoration: 'none', cursor: 'pointer' }}>
                  {product.emoji}
                </Link>
                <div style={{ padding: '14px' }}>
                  <div style={{ fontSize: '11px', background: '#E6F1FB', color: '#185FA5', padding: '2px 8px', borderRadius: '4px', display: 'inline-block', marginBottom: '6px' }}>
                    {product.category}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a1a', marginBottom: '2px' }}>{product.name}</div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>by {product.brand}</div>
                  <div style={{ fontSize: '11px', color: '#666', background: '#FFF8E6', border: '1px solid #F5E0A0', borderRadius: '6px', padding: '4px 8px', marginBottom: '10px' }}>
                    🔥 {trendingReasons[i % trendingReasons.length]}
                  </div>
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
