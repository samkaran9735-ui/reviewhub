'use client'

import Link from 'next/link'
import { useState } from 'react'

const allProducts = [
  { id: 1, name: 'Sony WH-1000XM6', brand: 'Sony', category: 'Tech', emoji: '🎧', score: 9.6, reviews: 3841, price: 24990 },
  { id: 2, name: 'Samsung Galaxy S25 Ultra', brand: 'Samsung', category: 'Tech', emoji: '📱', score: 9.5, reviews: 4210, price: 124999 },
  { id: 3, name: 'Dyson Airwrap', brand: 'Dyson', category: 'Beauty', emoji: '💇', score: 9.2, reviews: 1870, price: 45900 },
  { id: 4, name: 'Nike Air Max 2025', brand: 'Nike', category: 'Fashion', emoji: '👟', score: 8.3, reviews: 876, price: 12995 },
  { id: 5, name: 'Instant Pot Duo', brand: 'Instant', category: 'Home', emoji: '🍳', score: 9.1, reviews: 5200, price: 8999 },
  { id: 6, name: 'MacBook Pro M4', brand: 'Apple', category: 'Tech', emoji: '💻', score: 9.4, reviews: 2140, price: 129990 },
  { id: 7, name: 'Adidas Ultraboost 25', brand: 'Adidas', category: 'Sports', emoji: '🏃', score: 8.9, reviews: 2300, price: 16999 },
  { id: 8, name: 'Charlotte Tilbury Flawless', brand: 'Charlotte', category: 'Beauty', emoji: '💄', score: 8.7, reviews: 1100, price: 5500 },
  { id: 9, name: 'Kindle Scribe', brand: 'Amazon', category: 'Tech', emoji: '📖', score: 8.8, reviews: 980, price: 29999 },
  { id: 10, name: 'Philips Air Fryer XXL', brand: 'Philips', category: 'Home', emoji: '🥘', score: 8.5, reviews: 4300, price: 14999 },
  { id: 11, name: 'Levi\'s 501 Original', brand: 'Levi\'s', category: 'Fashion', emoji: '👖', score: 8.6, reviews: 6700, price: 3999 },
  { id: 12, name: 'Apple AirPods Pro 3', brand: 'Apple', category: 'Tech', emoji: '🎵', score: 9.3, reviews: 3120, price: 26900 },
]

export default function BrowsePage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('score')
  const [maxPrice, setMaxPrice] = useState(200000)

  const categories = ['All', 'Tech', 'Beauty', 'Fashion', 'Home', 'Sports']

  const filtered = allProducts
    .filter(p => category === 'All' || p.category === category)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase()))
    .filter(p => p.price <= maxPrice)
    .sort((a, b) => {
      if (sort === 'score') return b.score - a.score
      if (sort === 'price_asc') return a.price - b.price
      if (sort === 'price_desc') return b.price - a.price
      if (sort === 'reviews') return b.reviews - a.reviews
      return 0
    })

  return (
    <div style={{minHeight: '100vh', background: '#f8f8f6'}}>

      {/* Navbar */}
      <nav style={{background: '#fff', borderBottom: '1px solid #eee', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <Link href="/" style={{fontSize: '20px', fontWeight: '500', textDecoration: 'none', color: '#1a1a1a'}}>
          Review<span style={{color: '#378ADD'}}>Hub</span>
        </Link>
        <div style={{display: 'flex', gap: '24px'}}>
          <Link href="/browse" style={{fontSize: '14px', color: '#378ADD', textDecoration: 'none', fontWeight: '500'}}>Browse</Link>
          <Link href="/compare" style={{fontSize: '14px', color: '#666', textDecoration: 'none'}}>Compare</Link>
          <Link href="/submit-review" style={{fontSize: '14px', color: '#666', textDecoration: 'none'}}>Submit review</Link>
        </div>
        <button style={{padding: '8px 18px', background: '#378ADD', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer'}}>
          Sign in
        </button>
      </nav>

      <div style={{display: 'grid', gridTemplateColumns: '220px 1fr', gap: '0', minHeight: 'calc(100vh - 57px)'}}>

        {/* Sidebar Filters */}
        <div style={{background: '#fff', borderRight: '1px solid #eee', padding: '20px'}}>
          <div style={{marginBottom: '24px'}}>
            <div style={{fontSize: '13px', fontWeight: '500', color: '#1a1a1a', marginBottom: '10px'}}>Category</div>
            {categories.map(cat => (
              <div key={cat} style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 0', cursor: 'pointer'}} onClick={() => setCategory(cat)}>
                <div style={{width: '16px', height: '16px', borderRadius: '50%', border: `2px solid ${category === cat ? '#378ADD' : '#ddd'}`, background: category === cat ? '#378ADD' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  {category === cat && <div style={{width: '6px', height: '6px', borderRadius: '50%', background: '#fff'}} />}
                </div>
                <span style={{fontSize: '13px', color: category === cat ? '#378ADD' : '#666'}}>{cat}</span>
              </div>
            ))}
          </div>

          <div style={{marginBottom: '24px'}}>
            <div style={{fontSize: '13px', fontWeight: '500', color: '#1a1a1a', marginBottom: '10px'}}>Max price: ₹{maxPrice.toLocaleString('en-IN')}</div>
            <input
              type="range"
              min="0"
              max="200000"
              step="1000"
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              style={{width: '100%'}}
            />
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#999', marginTop: '4px'}}>
              <span>₹0</span>
              <span>₹2,00,000</span>
            </div>
          </div>

          <button
            onClick={() => { setCategory('All'); setSearch(''); setMaxPrice(200000); setSort('score') }}
            style={{width: '100%', padding: '8px', fontSize: '12px', border: '1px solid #ddd', borderRadius: '8px', background: '#fff', cursor: 'pointer', color: '#666'}}
          >
            Clear all filters
          </button>
        </div>

        {/* Main Content */}
        <div style={{padding: '20px'}}>
          {/* Search and Sort */}
          <div style={{display: 'flex', gap: '12px', marginBottom: '16px'}}>
            <input
              placeholder="Search products or brands..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{flex: 1, padding: '10px 14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', outline: 'none', background: '#fff'}}
            />
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              style={{padding: '10px 14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '13px', background: '#fff', cursor: 'pointer', outline: 'none'}}
            >
              <option value="score">Top rated</option>
              <option value="price_asc">Price: Low to high</option>
              <option value="price_desc">Price: High to low</option>
              <option value="reviews">Most reviewed</option>
            </select>
          </div>

          <div style={{fontSize: '13px', color: '#666', marginBottom: '16px'}}>
            Showing {filtered.length} product{filtered.length !== 1 ? 's' : ''}
          </div>

          {/* Category Pills */}
          <div style={{display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap'}}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{padding: '5px 14px', borderRadius: '20px', border: '1px solid #ddd', background: category === cat ? '#378ADD' : '#fff', color: category === cat ? '#fff' : '#666', fontSize: '12px', cursor: 'pointer'}}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px'}}>
            {filtered.map(product => (
              <div key={product.id} style={{background: '#fff', border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden'}}>
                <div style={{background: '#f8f8f6', height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '44px'}}>
                  {product.emoji}
                </div>
                <div style={{padding: '12px'}}>
                  <div style={{fontSize: '11px', background: '#E6F1FB', color: '#185FA5', padding: '2px 8px', borderRadius: '4px', display: 'inline-block', marginBottom: '6px'}}>
                    {product.category}
                  </div>
                  <div style={{fontSize: '13px', fontWeight: '500', color: '#1a1a1a', marginBottom: '2px'}}>{product.name}</div>
                  <div style={{fontSize: '11px', color: '#666', marginBottom: '8px'}}>by {product.brand}</div>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px'}}>
                    <span style={{color: '#BA7517', fontSize: '11px'}}>★★★★★ <span style={{color: '#999'}}>({product.reviews.toLocaleString()})</span></span>
                    <span style={{fontSize: '14px', fontWeight: '500', color: '#3B6D11', background: '#EAF3DE', padding: '2px 7px', borderRadius: '4px'}}>{product.score}</span>
                  </div>
                  <div style={{fontSize: '12px', color: '#666', marginBottom: '10px'}}>From ₹{product.price.toLocaleString('en-IN')}</div>
                  <div style={{display: 'flex', gap: '6px'}}>
                    <Link href="/compare" style={{flex: 1, padding: '6px', fontSize: '11px', border: '1px solid #ddd', borderRadius: '8px', background: '#fff', cursor: 'pointer', textAlign: 'center', textDecoration: 'none', color: '#1a1a1a'}}>
                      Compare
                    </Link>
                    <Link href={`/product/${product.id}`} style={{flex: 1, padding: '6px', fontSize: '11px', border: 'none', borderRadius: '8px', background: '#378ADD', color: '#fff', cursor: 'pointer', textAlign: 'center', textDecoration: 'none'}}>
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{textAlign: 'center', padding: '60px', color: '#666'}}>
              <div style={{fontSize: '32px', marginBottom: '12px'}}>🔍</div>
              <div style={{fontSize: '16px', fontWeight: '500', marginBottom: '6px'}}>No products found</div>
              <div style={{fontSize: '13px'}}>Try adjusting your filters or search term</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}