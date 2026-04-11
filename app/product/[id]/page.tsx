'use client'

import Link from 'next/link'
import { use, useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

type Product = {
  id: string
  name: string
  brand: string
  category: string
  emoji: string
  image_url?: string
  score: number
  reviews_count: number
  description: string
  price: number
}

type Review = {
  id: string
  reviewer_name: string
  title: string
  body: string
  score: number
  star_rating: number
  created_at: string
}

type StorePrice = {
  id: string
  store: string
  price: number
  tag: string
  color: string
  affiliate_url: string
}

const fallbackStores = [
  { store: 'Flipkart', price: 0, tag: 'Best price', color: '#FF9F00', affiliate_url: '#' },
  { store: 'Amazon', price: 0, tag: 'Prime fast', color: '#FF9900', affiliate_url: '#' },
  { store: 'Meesho', price: 0, tag: 'Coupon available', color: '#F43397', affiliate_url: '#' },
]

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [stores, setStores] = useState<StorePrice[]>([])
  const [loading, setLoading] = useState(true)
  const [showBuyModal, setShowBuyModal] = useState(false)

  useEffect(() => {
    async function loadData() {
      const { data: prod } = await supabase.from('products').select('*').eq('id', id).single()
      if (prod) setProduct(prod)

      const { data: revs } = await supabase.from('reviews').select('*').eq('product_id', id).eq('approved', true).order('created_at', { ascending: false })
      if (revs) setReviews(revs)

      const { data: storePrices } = await supabase.from('store_prices').select('*').eq('product_id', id)
      if (storePrices && storePrices.length > 0) setStores(storePrices)
      else setStores(fallbackStores as StorePrice[])

      setLoading(false)
    }
    loadData()
  }, [id])

  if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>Loading...</div>
  if (!product) return <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>Product not found</div>

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f6' }}>

      <style>{`
        .product-hero { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 24px; }
        .pros-cons-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
        @media (max-width: 768px) {
          .product-hero { grid-template-columns: 1fr; gap: 16px; }
          .pros-cons-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <nav style={{ background: '#fff', borderBottom: '1px solid #eee', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/" style={{ fontSize: '18px', fontWeight: '500', textDecoration: 'none', color: '#1a1a1a' }}>
          Get<span style={{ color: '#378ADD' }}>Smart</span>Reviews
        </Link>
        <div style={{ fontSize: '13px', color: '#666', display: 'flex', gap: '6px' }}>
          <Link href="/" style={{ color: '#378ADD', textDecoration: 'none' }}>Home</Link>
          <span>›</span>
          <Link href="/browse" style={{ color: '#378ADD', textDecoration: 'none' }}>Browse</Link>
          <span>›</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px' }}>{product.name}</span>
        </div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px' }}>

        <div className="product-hero">
          <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '16px', minHeight: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {product.image_url
              ? <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '280px', objectFit: 'contain', padding: '16px' }} />
              : <span style={{ fontSize: '100px' }}>{product.emoji}</span>}
          </div>

          <div>
            <div style={{ fontSize: '11px', background: '#E6F1FB', color: '#185FA5', padding: '3px 10px', borderRadius: '4px', display: 'inline-block', marginBottom: '10px' }}>
              {product.category}
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: '500', color: '#1a1a1a', marginBottom: '6px', lineHeight: '1.3' }}>
              {product.name}
            </h1>
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '14px' }}>by {product.brand}</div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px' }}>
              <div>
                <div style={{ fontSize: '36px', fontWeight: '500', color: '#3B6D11' }}>{product.score}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>out of 10</div>
              </div>
              <div>
                <div style={{ color: '#BA7517', fontSize: '18px' }}>★★★★★</div>
                <div style={{ fontSize: '13px', color: '#666' }}>{product.reviews_count.toLocaleString()} reviews</div>
              </div>
            </div>

            {product.description && (
              <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.7', marginBottom: '18px' }}>
                {product.description}
              </p>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowBuyModal(true)}
                style={{ flex: 2, padding: '13px', background: '#378ADD', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '500', cursor: 'pointer' }}>
                Buy now — from ₹{product.price.toLocaleString('en-IN')}
              </button>
              <Link href="/compare" style={{ flex: 1, padding: '13px', background: '#fff', color: '#1a1a1a', border: '1px solid #ddd', borderRadius: '10px', fontSize: '14px', textAlign: 'center', textDecoration: 'none' }}>
                Compare
              </Link>
            </div>
          </div>
        </div>

        {showBuyModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
            onClick={() => setShowBuyModal(false)}>
            <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '460px' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <h2 style={{ fontSize: '17px', fontWeight: '500' }}>Where to buy</h2>
                <button onClick={() => setShowBuyModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#666' }}>✕</button>
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '16px' }}>{product.name} · Prices updated today</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {stores.map((store, i) => (
                  <div key={store.id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', border: i === 0 ? '2px solid #185FA5' : '1px solid #eee', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: store.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '500' }}>
                        {store.store[0]}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '500' }}>{store.store}</div>
                        {store.tag && <div style={{ fontSize: '11px', background: '#E6F1FB', color: '#185FA5', padding: '1px 7px', borderRadius: '4px', display: 'inline-block', marginTop: '2px' }}>{store.tag}</div>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {store.price > 0 && <div style={{ fontSize: '16px', fontWeight: '500' }}>₹{store.price.toLocaleString('en-IN')}</div>}
                      <button style={{ padding: '7px 16px', background: i === 0 ? '#378ADD' : '#fff', color: i === 0 ? '#fff' : '#378ADD', border: '1px solid #378ADD', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
                        Buy now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: '11px', color: '#999', marginTop: '14px', textAlign: 'center' }}>
                Links may include affiliate codes. GetSmartReviews earns a small commission at no extra cost to you.
              </div>
            </div>
          </div>
        )}

        <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '16px' }}>Score breakdown</h2>
          {[
            { label: 'Performance', score: Math.min(10, product.score + 0.1) },
            { label: 'Design & Build', score: Math.min(10, product.score - 0.2) },
            { label: 'Value for money', score: Math.min(10, product.score - 0.4) },
            { label: 'User experience', score: Math.min(10, product.score - 0.1) },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ fontSize: '13px', color: '#666', minWidth: '130px' }}>{item.label}</div>
              <div style={{ flex: 1, height: '6px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.round(item.score) * 10}%`, background: '#378ADD', borderRadius: '4px' }} />
              </div>
              <div style={{ fontSize: '13px', fontWeight: '500', minWidth: '28px', textAlign: 'right' }}>{item.score.toFixed(1)}</div>
            </div>
          ))}
        </div>

        <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '500' }}>
              Reviews {reviews.length > 0 && <span style={{ fontSize: '13px', color: '#666', fontWeight: '400' }}>({reviews.length})</span>}
            </h2>
            <Link href="/submit-review" style={{ padding: '7px 16px', background: '#378ADD', color: '#fff', borderRadius: '8px', fontSize: '13px', textDecoration: 'none' }}>
              + Write a review
            </Link>
          </div>

          {reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#666' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>📝</div>
              <div style={{ fontSize: '15px', fontWeight: '500', marginBottom: '6px' }}>No reviews yet</div>
              <div style={{ fontSize: '13px', marginBottom: '16px' }}>Be the first to review this product!</div>
              <Link href="/submit-review" style={{ padding: '9px 20px', background: '#378ADD', color: '#fff', borderRadius: '8px', fontSize: '14px', textDecoration: 'none' }}>
                Submit a review
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {reviews.map(review => (
                <div key={review.id} style={{ border: '1px solid #f0f0f0', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#E6F1FB', color: '#185FA5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '500', flexShrink: 0 }}>
                      {review.reviewer_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a1a' }}>{review.reviewer_name}</div>
                      <div style={{ fontSize: '11px', color: '#999' }}>{new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#BA7517', fontSize: '13px' }}>{'★'.repeat(review.star_rating)}{'☆'.repeat(5 - review.star_rating)}</div>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: '#3B6D11' }}>{review.score}/10</div>
                    </div>
                  </div>
                  {review.title && <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a1a', marginBottom: '6px' }}>{review.title}</div>}
                  {review.body && <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>{review.body}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}