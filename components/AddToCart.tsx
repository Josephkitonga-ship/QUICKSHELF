'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from './Providers'
export function AddToCart({ slug, stock }: { slug: string; stock: number }) {
  const { add, saved, toggleSave } = useStore(); const [qty, setQty] = useState(1); const router = useRouter()
  if (stock === 0) return <button className="btn block" disabled>Sold out</button>
  return (
    <div className="form">
      <label>Quantity<input type="number" min={1} max={stock} value={qty} onChange={(e) => setQty(Math.min(stock, Math.max(1, Number(e.target.value) || 1)))} /></label>
      <button className="btn" onClick={() => { add(slug, qty); router.push('/cart') }}>Add to cart</button>
      <button className="btn out" aria-pressed={saved.includes(slug)} onClick={() => toggleSave(slug)}>{saved.includes(slug) ? 'Saved' : 'Save for later'}</button>
    </div>
  )
}
