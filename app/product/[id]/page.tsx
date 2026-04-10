'use client'

import Link from 'next/link'
import { use } from 'react'

const products: Record<string, {
  name: string, brand: string, category: string,
  emoji: string, score: number, reviews: number,
  desc: string, pros: string[], cons: string[],
  scores: Record<string, number>,
  stores: { name: string, price: string, tag: string, color: string }[]
}> = {
  '1': {
    name: 'Sony WH-1000XM6',
    brand: 'Sony',
    category: 'Tech · Headphones',
    emoji: '🎧',
    score: 9.6,
    reviews: 3841,
    desc: 'The best noise-cancelling headphones you can buy right now.',
    pros: ['Best-in-class ANC', '40-hour battery life', 'Multipoint Bluetooth'],
    cons: ['Premium price tag', 'No IP rating', 'Touch controls tricky'],
    scores: { 'Sound quality': 9.7, 'Noise cancellation': 9.6, 'Battery life': 9.4, 'Comfort': 9.0, 'Value': 8.8 },
    stores: [
      { name: 'Flipkart', price: '₹24,990', tag: 'Best price', color: '#FF9F00' },
      { name: 'Amazon', price: '₹25,490', tag: 'Prime fast', color: '#FF9900' },
      { name: 'Meesho', price: '₹26,100', tag: 'Coupon available', color: '#F43397' },
      { name: 'Croma', price: '₹26,490', tag: 'In store', color: '#111111' },
      { name: 'Sony Store', price: '₹27,990', tag: 'Official', color: '#003087' },
    ]
  },
  '2': {
    name: 'Samsung Galaxy S25 Ultra',
    brand: 'Samsung',
    category: 'Tech · Smartphones',
    emoji: '📱',
    score: 9.5,
    reviews: 4210,
    desc: 'The ultimate Android flagship with S Pen and incredible cameras.',
    pros: ['Stunning 200MP camera', 'S Pen included', 'Long battery life'],
    cons: ['Very expensive', 'Large and heavy'],
    scores: { 'Camera': 9.8, 'Performance': 9.7, 'Battery life': 9.2, 'Display': 9.6, 'Value': 8.5 },
    stores: [
      { name: 'Flipkart', price: '₹1,24,999', tag: 'Best price', color: '#FF9F00' },
      { name: 'Amazon', price: '₹1,25,999', tag: 'Prime fast', color: '#FF9900' },
      { name: 'Samsung Store', price: '₹1,29,999', tag: 'Official', color: '#1428A0' },
    ]
  },
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const product = products[id] || products['1']

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f6' }}>

      <nav style={{ background: '#fff', borderBottom: '1px solid #eee', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ fontSize: '20px', fontWeight: '500', textDecoration: 'none', color: '#1a1a1a' }}>
          Review<span style={{ color: '#378ADD' }}>Hub</span>
        </Link>
        <div style={{ fontSize: '13px', color: '#666' }}>
          <Link href="/" style={{ color: '#378ADD', textDecoration: 'none' }}>Home</Link>
          {' > '}
          <Link href="/browse" style={{ color: '#378ADD', textDecoration: 'none' }}>Browse</Link>
          {' > '}
          {product.name}
        </div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px' }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>

          <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '16px', height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '100px' }}>
            {product.emoji}
          </div>

          <div>
            <div style={{ fontSize: '11px', background: '#E6F1FB', color: '#185FA5', padding: '3px 10px', borderRadius: '4px', display: 'inline-block', marginBottom: '10px' }}>
              {product.category}
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '500', color: '#1a1a1a', marginBottom: '6px' }}>
              {product.name}
            </h1>
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>by {product.brand}</div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '36px', fontWeight: '500', color: '#3B6D11' }}>{product.score}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>out of 10</div>
              </div>
              <div>
                <div style={{ color: '#BA7517', fontSize: '18px' }}>★★★★★</div>
                <div style={{ fontSize: '13px', color: '#666' }}>{product.reviews.toLocaleString()} reviews</div>
              </div>
            </div>

            <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.7', marginBottom: '20px' }}>
              {product.desc}
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <a href="#stores" style={{ flex: 2, padding: '13px', background: '#378ADD', color: '#fff', borderRadius: '10px', fontSize: '15px', fontWeight: '500', cursor: 'pointer', textAlign: 'center', textDecoration: 'none' }}>
                Buy now
              </a>
              <Link href="/compare" style={{ flex: 1, padding: '13px', background: '#fff', color: '#1a1a1a', border: '1px solid #ddd', borderRadius: '10px', fontSize: '14px', textAlign: 'center', textDecoration: 'none' }}>
                Compare
              </Link>
            </div>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '16px' }}>Score breakdown</h2>
          {Object.entries(product.scores).map(([label, score]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ fontSize: '13px', color: '#666', minWidth: '140px' }}>{label}</div>
              <div style={{ flex: 1, height: '6px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${score * 10}%`, background: '#378ADD', borderRadius: '4px' }} />
              </div>
              <div style={{ fontSize: '13px', fontWeight: '500', minWidth: '28px', textAlign: 'right' }}>{score}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div style={{ background: '#EAF3DE', borderRadius: '16px', padding: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#3B6D11', marginBottom: '10px' }}>Pros</h3>
            {product.pros.map(pro => (
              <div key={pro} style={{ fontSize: '13px', color: '#27500A', padding: '4px 0' }}>+ {pro}</div>
            ))}
          </div>
          <div style={{ background: '#FCEBEB', borderRadius: '16px', padding: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#A32D2D', marginBottom: '10px' }}>Cons</h3>
            {product.cons.map(con => (
              <div key={con} style={{ fontSize: '13px', color: '#791F1F', padding: '4px 0' }}>- {con}</div>
            ))}
          </div>
        </div>

        <div id="stores" style={{ background: '#fff', border: '1px solid #eee', borderRadius: '16px', padding: '20px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '4px' }}>Where to buy</h2>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '16px' }}>Prices updated today</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {product.stores.map((store, i) => (
              <div key={store.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', border: i === 0 ? '2px solid #185FA5' : '1px solid #eee', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: store.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '500' }}>
                    {store.name[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>{store.name}</div>
                    <div style={{ fontSize: '11px', padding: '1px 7px', background: '#E6F1FB', color: '#185FA5', borderRadius: '4px', display: 'inline-block', marginTop: '2px' }}>
                      {store.tag}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '18px', fontWeight: '500' }}>{store.price}</div>
                  <button style={{ padding: '8px 18px', background: i === 0 ? '#378ADD' : '#fff', color: i === 0 ? '#fff' : '#378ADD', border: '1px solid #378ADD', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
                    Buy now
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '11px', color: '#999', marginTop: '14px', textAlign: 'center' }}>
            Links may include affiliate codes. ReviewHub earns a small commission at no extra cost to you.
          </div>
        </div>

      </div>
    </div>
  )
}