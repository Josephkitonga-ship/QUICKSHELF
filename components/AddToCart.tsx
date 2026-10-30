'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { quickOrderMessage, waLink } from '@/lib/whatsapp'
import { useStore } from './Providers'
type Props = { slug: string; stock: number; name: string; price: number; vendor: string; whatsapp: string }
export function AddToCart({ slug, stock, name, price, vendor, whatsapp }: Props) {
  const { add, saved, toggleSave } = useStore(); const [qty, setQty] = useState(1); const router = useRouter()
  if (stock === 0) return <button className="btn block" disabled>Sold out</button>
  return (
    <div className="form">
      <label>Quantity<input type="number" min={1} max={stock} value={qty} onChange={(e) => setQty(Math.min(stock, Math.max(1, Number(e.target.value) || 1)))} /></label>
      <button className="btn" onClick={() => { add(slug, qty); router.push('/cart') }}>Add to cart</button>
      <a className="btn out" target="_blank" rel="noopener noreferrer" href={waLink(whatsapp, quickOrderMessage(vendor, name, qty, price * qty))}>Order on WhatsApp</a>
      <button className="btn out" aria-pressed={saved.includes(slug)} onClick={() => toggleSave(slug)}>{saved.includes(slug) ? 'Saved' : 'Save for later'}</button>
    </div>
  )
}
