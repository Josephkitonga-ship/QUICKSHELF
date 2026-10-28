'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'
import type { Product } from '@/lib/data'
import { kes } from '@/lib/format'
import { useStore } from './Providers'
const Heart = ({ on }: { on: boolean }) => <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M12 21s-7-4.6-9.3-9A5.4 5.4 0 0 1 12 6.4 5.4 5.4 0 0 1 21.3 12C19 16.4 12 21 12 21z" /></svg>
export function ProductCard({ p }: { p: Product }) {
  const { add, saved, toggleSave } = useStore(); const isSaved = saved.includes(p.slug); const [burst, setBurst] = useState(0)
  return (
    <article className="rounded-2xl border border-line bg-surface p-2.5 transition-transform duration-150 active:scale-[0.98] md:hover:-translate-y-0.5">
      <Link href={`/products/${p.slug}`} aria-label={p.name} className="relative flex h-[120px] items-center justify-center rounded-xl bg-tint text-xs text-mute hover:no-underline md:h-[150px]">
        {p.badge && <span className="tag absolute left-2 top-2">{p.badge}</span>}<span>Photo</span>
      </Link>
      <h3><Link href={`/products/${p.slug}`}>{p.name}</Link></h3>
      <p className="price">{kes(p.price)}</p>
      <p className="mu">{p.shopName} · {p.town}</p>
      {p.stock > 0 && p.stock <= 3 && <p className="low">Only {p.stock} left</p>}
      <div className="acts">
        <button className="btn transition-transform duration-150 active:scale-95" onClick={() => add(p.slug)} disabled={p.stock === 0}>{p.stock === 0 ? 'Sold out' : 'Add to cart'}</button>
        <button className="btn out gap-1 transition-transform duration-150 active:scale-95" aria-pressed={isSaved} onClick={() => { if (!isSaved) setBurst((b) => b + 1); toggleSave(p.slug) }}>
          <span className="relative inline-flex">
            <motion.span key={burst} className="inline-flex" animate={isSaved && burst ? { scale: [1, 1.5, 0.9, 1] } : { scale: 1 }} transition={{ duration: 0.4 }}><Heart on={isSaved} /></motion.span>
            {isSaved && burst > 0 && <motion.span key={`ring-${burst}`} aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-full border-2 border-accent" initial={{ scale: 0.6, opacity: 0.9 }} animate={{ scale: 2.2, opacity: 0 }} transition={{ duration: 0.45 }} />}
          </span>
          {isSaved ? 'Saved' : 'Save'}
        </button>
      </div>
    </article>
  )
}
