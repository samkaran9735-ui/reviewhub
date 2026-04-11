'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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

type User = {
  email?: string
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [wishlist, setWishlist] = useState<Set<string>>(new Set())
  const router = useRouter()

  const toggleWishlist = (id: string) => {
    if (!user) {
      router.push('/login')
      return
    }
    setWishlist(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  useEffect(() => {
    async function loadProducts() {
      const { data } = await supabase.from('products').select('*').order('score', { ascending: false })
      if (data) setProducts(data)
      setLoading(false)
    }
    loadProducts()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser(session.user)
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) setUser(session.user)
      else setUser(null)
    })
  }, [])

  const filtered = products
    .filter(p => category === 'All' || p.category === category)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f6' }}>

      <style>{`
        .nav-links { display: flex; gap: 24px; }
        .nav-right { display: flex; align-items: center; gap: 10px; }
        .hamburger { display: none; }
        .mobile-menu { display: none; }
        .hero-title { font-size: 32px; }
        .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
        @media (max-width: 768px) {
          .nav-links { display: none; }
          .nav-right { display: none; }
          .hamburger { display: block; background: none; border: none; font-size: 24px; cursor: pointer; color: #1a1a1a; }
          .mobile-menu { display: flex; flex-direction: column; gap: 0; background: #fff; border-top: 1px solid #eee; padding: 8px 0; }
          .mobile-menu a, .mobile-menu button { display: block; padding: 12px 20px; font-size: 15px; color: #1a1a1a; text-decoration: none; border: none; background: none; text-align: left; cursor: pointer; width: 100%; }
          .hero-title { font-size: 22px !important; }
          .products-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
          .ad-text { font-size: 11px !important; }
          .category-scroll { overflow-x: auto; justify-content: flex-start !important; flex-wrap: nowrap !important; padding-bottom: 4px; }
          .category-scroll::-webkit-scrollbar { display: none; }
        }
        @media (max-width: 400px) {
          .products-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <nav style={{ background: '#fff', borderBottom: '1px solid #eee', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/" style={{ fontSize: '18px', fontWeight: '500', textDecoration: 'none', color: '#1a1a1a' }}>
          Get<span style={{ color: '#378ADD' }}>Smart</span>Reviews
        </Link>
        <div className="nav-links">
          <Link href="/browse" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>Browse</Link>
          <Link href="/trending" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>Trending</Link>
          <Link href="/recommendations" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>Recommendations</Link>
          <Link href="/compare" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>Compare</Link>
          <Link href="/submit-review" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>Submit review</Link>
        </div>
        <div className="nav-right">
          {user ? (
            <>
              <span style={{ fontSize: '13px', color: '#666' }}>👋 {user.email}</span>
              <button onClick={async () => { await supabase.auth.signOut(); setUser(null) }}
                style={{ padding: '8px 16px', background: '#fff', color: '#378ADD', border: '1px solid #378ADD', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
                Sign out
              </button>
            </>
          ) : (
            <Link href="/login" style={{ padding: '8px 18px', background: '#378ADD', color: '#fff', borderRadius: '8px', fontSize: '14px', textDecoration: 'none' }}>
              Sign in
            </Link>
          )}
        </div>
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {menuOpen && (
        <div className="mobile-menu">
          <Link href="/browse" onClick={() => setMenuOpen(false)}>Browse</Link>
          <Link href="/trending" onClick={() => setMenuOpen(false)}>Trending</Link>
          <Link href="/recommendations" onClick={() => setMenuOpen(false)}>Recommendations</Link>
          <Link href="/compare" onClick={() => setMenuOpen(false)}>Compare</Link>
          <Link href="/submit-review" onClick={() => setMenuOpen(false)}>Submit review</Link>
          {user ? (
            <button onClick={async () => { await supabase.auth.signOut(); setUser(null); setMenuOpen(false) }}>Sign out</button>
          ) : (
            <Link href="/login" onClick={() => setMenuOpen(false)}>Sign in</Link>
          )}
        </div>
      )}

      <div style={{ background: '#E6F1FB', borderBottom: '1px solid #B5D4F4', padding: '8px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '10px', background: '#fff', border: '1px solid #B5D4F4', color: '#185FA5', padding: '2px 6px', borderRadius: '4px', flexShrink: 0 }}>Ad</span>
          <span className="ad-text" style={{ fontSize: '12px', color: '#0C447C' }}>Flipkart Big Billion Days — up to 80% off on electronics and more</span>
        </div>
        <span style={{ fontSize: '12px', color: '#185FA5', cursor: 'pointer', fontWeight: '500', flexShrink: 0, marginLeft: '8px' }}>Shop →</span>
      </div>

      <div style={{ textAlign: 'center', padding: '32px 20px 24px' }}>
        <h1 className="hero-title" style={{ fontWeight: '500', color: '#1a1a1a', marginBottom: '10px', lineHeight: '1.3' }}>
          Find the best products, reviewed by real people
        </h1>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
          Honest reviews across tech, beauty, fashion and more
        </p>
        <div style={{ display: 'flex', maxWidth: '520px', margin: '0 auto', border: '1px solid #ddd', borderRadius: '12px', overflow: 'hidden', background: '#fff' }}>
          <input
            placeholder="Search products, brands..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, padding: '11px 14px', border: 'none', outline: 'none', fontSize: '14px', minWidth: 0 }}
          />
          <button style={{ padding: '11px 16px', background: '#378ADD', color: '#fff', border: 'none', fontSize: '14px', cursor: 'pointer', flexShrink: 0 }}>
            Search
          </button>
        </div>
      </div>

      <div className="category-scroll" style={{ display: 'flex', gap: '8px', padding: '0 20px 16px', justifyContent: 'center' }}>
        {['All', 'Tech', 'Beauty', 'Fashion', 'Home', 'Sports'].map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            style={{ padding: '6px 14px', borderRadius: '20px', border: '1px solid #ddd', background: category === cat ? '#378ADD' : '#fff', color: category === cat ? '#fff' : '#666', fontSize: '13px', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}>
            {cat}
          </button>
        ))}
      </div>

      <div style={{ padding: '0 20px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '500', marginBottom: '14px', color: '#1a1a1a' }}>
          {loading ? 'Loading...' : `${filtered.length} products found`}
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>Loading...</div>
        ) : (
          <div className="products-grid">
            {filtered.map(product => (
              <div key={product.id} style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden' }}>
                <Link href={`/product/${product.id}`} style={{ background: '#f8f8f6', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '44px', position: 'relative', textDecoration: 'none', cursor: 'pointer' }}>
                  {product.emoji}
                  <button
                    onClick={(e) => { e.preventDefault(); toggleWishlist(product.id) }}
                    style={{ position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', lineHeight: 1 }}
                    title={wishlist.has(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill={wishlist.has(product.id) ? '#e53935' : 'none'} stroke={wishlist.has(product.id) ? '#e53935' : '#999'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>
                </Link>
                <div style={{ padding: '10px' }}>
                  <div style={{ fontSize: '11px', background: '#E6F1FB', color: '#185FA5', padding: '2px 7px', borderRadius: '4px', display: 'inline-block', marginBottom: '5px' }}>
                    {product.category}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a1a', marginBottom: '2px', lineHeight: '1.3' }}>{product.name}</div>
                  <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px' }}>by {product.brand}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ color: '#BA7517', fontSize: '11px' }}>★★★★★ <span style={{ color: '#999' }}>({product.reviews_count.toLocaleString()})</span></span>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: '#3B6D11', background: '#EAF3DE', padding: '2px 7px', borderRadius: '4px' }}>{product.score}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px' }}>From ₹{product.price.toLocaleString('en-IN')}</div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <Link href="/compare" style={{ flex: 1, padding: '6px', fontSize: '11px', border: '1px solid #ddd', borderRadius: '8px', background: '#fff', textAlign: 'center', textDecoration: 'none', color: '#1a1a1a' }}>
                      Compare
                    </Link>
                    <Link href={`/product/${product.id}`} style={{ flex: 1, padding: '6px', fontSize: '11px', border: 'none', borderRadius: '8px', background: '#3B6D11', color: '#fff', textAlign: 'center', textDecoration: 'none' }}>
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