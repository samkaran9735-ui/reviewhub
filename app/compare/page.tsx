'use client'

import Link from 'next/link'
import { useState } from 'react'

const allProducts = [
  { id: '1', name: 'Sony WH-1000XM6', brand: 'Sony', category: 'Tech', emoji: '🎧', score: 9.6, price: '₹24,990', battery: '40 hrs', anc: 'Yes', weight: '250g', water: 'No' },
  { id: '2', name: 'Samsung Galaxy S25 Ultra', brand: 'Samsung', category: 'Tech', emoji: '📱', score: 9.5, price: '₹1,24,999', battery: '29 hrs', anc: 'N/A', weight: '218g', water: 'Yes' },
  { id: '3', name: 'Dyson Airwrap', brand: 'Dyson', category: 'Beauty', emoji: '💇', score: 9.2, price: '₹45,900', battery: 'N/A', anc: 'N/A', weight: '1.3kg', water: 'No' },
  { id: '4', name: 'Nike Air Max 2025', brand: 'Nike', category: 'Fashion', emoji: '👟', score: 8.3, price: '₹12,995', battery: 'N/A', anc: 'N/A', weight: '310g', water: 'No' },
  { id: '5', name: 'Instant Pot Duo', brand: 'Instant', category: 'Home', emoji: '🍳', score: 9.1, price: '₹8,999', battery: 'N/A', anc: 'N/A', weight: '5.4kg', water: 'No' },
  { id: '6', name: 'MacBook Pro M4', brand: 'Apple', category: 'Tech', emoji: '💻', score: 9.4, price: '₹1,29,990', battery: '22 hrs', anc: 'N/A', weight: '1.55kg', water: 'No' },
  { id: '7', name: 'Apple AirPods Max', brand: 'Apple', category: 'Tech', emoji: '🎵', score: 9.0, price: '₹59,900', battery: '20 hrs', anc: 'Yes', weight: '385g', water: 'No' },
  { id: '8', name: 'Adidas Ultraboost 25', brand: 'Adidas', category: 'Sports', emoji: '🏃', score: 8.9, price: '₹16,999', battery: 'N/A', anc: 'N/A', weight: '320g', water: 'No' },
]

export default function ComparePage() {
  const [leftId, setLeftId] = useState('1')
  const [rightId, setRightId] = useState('7')

  const left = allProducts.find(p => p.id === leftId) || allProducts[0]
  const right = allProducts.find(p => p.id === rightId) || allProducts[6]

  const winner = left.score >= right.score ? left : right

  const specs = [
    { label: 'Score', leftVal: String(left.score), rightVal: String(right.score) },
    { label: 'Price', leftVal: left.price, rightVal: right.price },
    { label: 'Battery', leftVal: left.battery, rightVal: right.battery },
    { label: 'ANC', leftVal: left.anc, rightVal: right.anc },
    { label: 'Weight', leftVal: left.weight, rightVal: right.weight },
    { label: 'Water resistant', leftVal: left.water, rightVal: right.water },
  ]

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
          <Link href="/compare" style={{ fontSize: '14px', color: '#378ADD', textDecoration: 'none', fontWeight: '500' }}>Compare</Link>
          <Link href="/submit-review" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>Submit review</Link>
        </div>
        <button style={{ padding: '8px 18px', background: '#378ADD', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>
          Sign in
        </button>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px' }}>

        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '500', color: '#1a1a1a', marginBottom: '4px' }}>Compare products</h1>
          <p style={{ fontSize: '14px', color: '#666' }}>Select any two products to compare them side by side</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 1fr', gap: '0', marginBottom: '20px' }}>

          <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #eee', background: '#f8f8f6' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>Product A</div>
              <select
                value={leftId}
                onChange={e => setLeftId(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '13px', background: '#fff', outline: 'none', cursor: 'pointer' }}
              >
                {allProducts.map(p => (
                  <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>
                ))}
              </select>
            </div>
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '64px', marginBottom: '12px' }}>{left.emoji}</div>
              <div style={{ fontSize: '16px', fontWeight: '500', color: '#1a1a1a', marginBottom: '4px' }}>{left.name}</div>
              <div style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>by {left.brand}</div>
              <div style={{ fontSize: '32px', fontWeight: '500', color: '#3B6D11', background: '#EAF3DE', padding: '8px 20px', borderRadius: '12px', display: 'inline-block' }}>
                {left.score}
              </div>
            </div>
            <div style={{ borderTop: '1px solid #eee' }}>
              {specs.map(spec => (
                <div key={spec.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #f5f5f5' }}>
                  <span style={{ fontSize: '12px', color: '#999' }}>{spec.label}</span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: spec.leftVal === spec.rightVal ? '#1a1a1a' : left.score >= right.score ? '#3B6D11' : '#666' }}>
                    {spec.leftVal}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ padding: '14px 16px' }}>
              <Link href={`/product/${left.id}`} style={{ display: 'block', padding: '10px', background: '#378ADD', color: '#fff', borderRadius: '10px', fontSize: '14px', textAlign: 'center', textDecoration: 'none', fontWeight: '500' }}>
                Buy now
              </Link>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fff', border: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '500', color: '#666' }}>
              VS
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #eee', background: '#f8f8f6' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>Product B</div>
              <select
                value={rightId}
                onChange={e => setRightId(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '13px', background: '#fff', outline: 'none', cursor: 'pointer' }}
              >
                {allProducts.map(p => (
                  <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>
                ))}
              </select>
            </div>
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '64px', marginBottom: '12px' }}>{right.emoji}</div>
              <div style={{ fontSize: '16px', fontWeight: '500', color: '#1a1a1a', marginBottom: '4px' }}>{right.name}</div>
              <div style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>by {right.brand}</div>
              <div style={{ fontSize: '32px', fontWeight: '500', color: '#3B6D11', background: '#EAF3DE', padding: '8px 20px', borderRadius: '12px', display: 'inline-block' }}>
                {right.score}
              </div>
            </div>
            <div style={{ borderTop: '1px solid #eee' }}>
              {specs.map(spec => (
                <div key={spec.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #f5f5f5' }}>
                  <span style={{ fontSize: '12px', color: '#999' }}>{spec.label}</span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: spec.leftVal === spec.rightVal ? '#1a1a1a' : right.score > left.score ? '#3B6D11' : '#666' }}>
                    {spec.rightVal}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ padding: '14px 16px' }}>
              <Link href={`/product/${right.id}`} style={{ display: 'block', padding: '10px', background: '#fff', color: '#378ADD', border: '1px solid #378ADD', borderRadius: '10px', fontSize: '14px', textAlign: 'center', textDecoration: 'none', fontWeight: '500' }}>
                Buy now
              </Link>
            </div>
          </div>

        </div>

        <div style={{ background: '#EAF3DE', borderRadius: '12px', padding: '14px 20px', textAlign: 'center', fontSize: '14px', color: '#3B6D11', fontWeight: '500' }}>
          🏆 {winner.name} wins — higher score of {winner.score}/10
        </div>

      </div>
    </div>
  )
}