'use client'
import Link from 'next/link'
import { getShop, Product } from '@/lib/data'
import { kes } from '@/lib/format'
import { useStore } from './Providers'
export function ProductCard({ p }: { p: Product }) {
  const { add, saved, toggleSave } = useStore(); const shop = getShop(p.shop)!; const isSaved = saved.includes(p.slug)
  return (
    <article className="card">
      <Link href={`/products/${p.slug}`} className="photo" aria-label={p.name}>{p.badge && <span className="tag">{p.badge}</span>}<span>Photo</span></Link>
      <h3><Link href={`/products/${p.slug}`}>{p.name}</Link></h3>
      <p className="price">{kes(p.price)}</p>
      <p className="mu">{shop.name} · {shop.town}</p>
      {p.stock > 0 && p.stock <= 3 && <p className="low">Only {p.stock} left</p>}
      <div className="acts">
        <button className="btn" onClick={() => add(p.slug)} disabled={p.stock === 0}>{p.stock === 0 ? 'Sold out' : 'Add to cart'}</button>
        <button className="btn out" aria-pressed={isSaved} onClick={() => toggleSave(p.slug)}>{isSaved ? 'Saved' : 'Save'}</button>
      </div>
    </article>
  )
}
