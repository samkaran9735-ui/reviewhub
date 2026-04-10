import Link from 'next/link'

const products = [
  { id: 1, name: 'Sony WH-1000XM6', brand: 'Sony', category: 'Tech', emoji: '🎧', score: 9.6, reviews: 3841, price: '₹24,990' },
  { id: 2, name: 'Samsung Galaxy S25 Ultra', brand: 'Samsung', category: 'Tech', emoji: '📱', score: 9.5, reviews: 4210, price: '₹1,24,999' },
  { id: 3, name: 'Dyson Airwrap', brand: 'Dyson', category: 'Beauty', emoji: '💇', score: 9.2, reviews: 1870, price: '₹45,900' },
  { id: 4, name: 'Nike Air Max 2025', brand: 'Nike', category: 'Fashion', emoji: '👟', score: 8.3, reviews: 876, price: '₹12,995' },
  { id: 5, name: 'Instant Pot Duo', brand: 'Instant', category: 'Home', emoji: '🍳', score: 9.1, reviews: 5200, price: '₹8,999' },
  { id: 6, name: 'MacBook Pro M4', brand: 'Apple', category: 'Tech', emoji: '💻', score: 9.4, reviews: 2140, price: '₹1,29,990' },
]

export default function HomePage() {
  return (
    <div style={{minHeight: '100vh', background: '#f8f8f6'}}>

      <nav style={{background: '#fff', borderBottom: '1px solid #eee', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <div style={{fontSize: '20px', fontWeight: '500'}}>
          Review<span style={{color: '#378ADD'}}>Hub</span>
        </div>
        <div style={{display: 'flex', gap: '24px'}}>
          <Link href="/browse" style={{fontSize: '14px', color: '#666', textDecoration: 'none'}}>Browse</Link>
          <Link href="/compare" style={{fontSize: '14px', color: '#666', textDecoration: 'none'}}>Compare</Link>
          <Link href="/submit-review" style={{fontSize: '14px', color: '#666', textDecoration: 'none'}}>Submit review</Link>
        </div>
        <button style={{padding: '8px 18px', background: '#378ADD', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer'}}>
          Sign in
        </button>
      </nav>

      <div style={{background: '#E6F1FB', borderBottom: '1px solid #B5D4F4', padding: '10px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
          <span style={{fontSize: '10px', background: '#fff', border: '1px solid #B5D4F4', color: '#185FA5', padding: '2px 6px', borderRadius: '4px'}}>Ad</span>
          <span style={{fontSize: '13px', color: '#0C447C'}}>Flipkart Big Billion Days — up to 80% off on electronics, fashion and more</span>
        </div>
        <span style={{fontSize: '13px', color: '#185FA5', cursor: 'pointer', fontWeight: '500'}}>Shop now →</span>
      </div>

      <div style={{textAlign: 'center', padding: '48px 24px 32px'}}>
        <h1 style={{fontSize: '32px', fontWeight: '500', color: '#1a1a1a', marginBottom: '12px'}}>
          Find the best products, reviewed by real people
        </h1>
        <p style={{fontSize: '16px', color: '#666', marginBottom: '24px'}}>
          Honest reviews across tech, beauty, food, fashion and more
        </p>
        <div style={{display: 'flex', maxWidth: '520px', margin: '0 auto', border: '1px solid #ddd', borderRadius: '12px', overflow: 'hidden', background: '#fff'}}>
          <input
            placeholder="Search products, brands, categories..."
            style={{flex: 1, padding: '12px 16px', border: 'none', outline: 'none', fontSize: '14px'}}
          />
          <button style={{padding: '12px 20px', background: '#378ADD', color: '#fff', border: 'none', fontSize: '14px', cursor: 'pointer'}}>
            Search
          </button>
        </div>
      </div>

      <div style={{display: 'flex', gap: '8px', padding: '0 24px 20px', flexWrap: 'wrap', justifyContent: 'center'}}>
        {['All', 'Tech', 'Beauty', 'Fashion', 'Home', 'Sports'].map(cat => (
          <button key={cat} style={{padding: '6px 16px', borderRadius: '20px', border: '1px solid #ddd', background: cat === 'All' ? '#378ADD' : '#fff', color: cat === 'All' ? '#fff' : '#666', fontSize: '13px', cursor: 'pointer'}}>
            {cat}
          </button>
        ))}
      </div>

      <div style={{padding: '0 24px 40px', maxWidth: '1200px', margin: '0 auto'}}>
        <h2 style={{fontSize: '16px', fontWeight: '500', marginBottom: '16px', color: '#1a1a1a'}}>Latest reviews</h2>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px'}}>
          {products.map(product => (
            <div key={product.id} style={{background: '#fff', border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden'}}>
              <div style={{background: '#f8f8f6', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px'}}>
                {product.emoji}
              </div>
              <div style={{padding: '12px'}}>
                <div style={{fontSize: '11px', background: '#E6F1FB', color: '#185FA5', padding: '2px 8px', borderRadius: '4px', display: 'inline-block', marginBottom: '6px'}}>
                  {product.category}
                </div>
                <div style={{fontSize: '14px', fontWeight: '500', color: '#1a1a1a', marginBottom: '2px'}}>{product.name}</div>
                <div style={{fontSize: '12px', color: '#666', marginBottom: '10px'}}>by {product.brand}</div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                  <div>
                    <span style={{color: '#BA7517', fontSize: '12px'}}>★★★★★</span>
                    <span style={{fontSize: '11px', color: '#666', marginLeft: '4px'}}>({product.reviews.toLocaleString()})</span>
                  </div>
                  <div style={{fontSize: '15px', fontWeight: '500', color: '#3B6D11', background: '#EAF3DE', padding: '2px 8px', borderRadius: '4px'}}>
                    {product.score}
                  </div>
                </div>
                <div style={{fontSize: '12px', color: '#666', marginBottom: '10px'}}>From {product.price}</div>
                <div style={{display: 'flex', gap: '6px'}}>
                  <button style={{flex: 1, padding: '7px', fontSize: '12px', border: '1px solid #ddd', borderRadius: '8px', background: '#fff', cursor: 'pointer'}}>
                    Compare
                  </button>
                  <button style={{flex: 1, padding: '7px', fontSize: '12px', border: 'none', borderRadius: '8px', background: '#378ADD', color: '#fff', cursor: 'pointer'}}>
                    Buy now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}