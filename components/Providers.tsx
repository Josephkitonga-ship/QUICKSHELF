'use client'
import { MotionConfig } from 'framer-motion'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import type { Line } from '@/lib/cart'
type Store = { cart: Line[]; saved: string[]; ready: boolean; add: (s: string, q?: number) => void; setQty: (s: string, q: number) => void; remove: (s: string) => void; clear: () => void; toggleSave: (s: string) => void }
const Ctx = createContext<Store | null>(null)
function load<T>(k: string, d: T): T { try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : d } catch { return d } }
export function Providers({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Line[]>([]); const [saved, setSaved] = useState<string[]>([]); const [ready, setReady] = useState(false); const [toast, setToast] = useState('')
  useEffect(() => { setCart(load('qs.cart', [])); setSaved(load('qs.saved', [])); setReady(true) }, [])
  useEffect(() => { if (ready) { localStorage.setItem('qs.cart', JSON.stringify(cart)); localStorage.setItem('qs.saved', JSON.stringify(saved)) } }, [cart, saved, ready])
  const store: Store = {
    cart, saved, ready,
    add: (s, q = 1) => { setToast('Added to cart'); setTimeout(() => setToast(''), 2000); setCart((c) => (c.some((l) => l.slug === s) ? c.map((l) => (l.slug === s ? { ...l, qty: l.qty + q } : l)) : [...c, { slug: s, qty: q }])) },
    setQty: (s, q) => setCart((c) => c.map((l) => (l.slug === s ? { ...l, qty: Math.max(1, q) } : l))),
    remove: (s) => setCart((c) => c.filter((l) => l.slug !== s)),
    clear: () => setCart([]),
    toggleSave: (s) => setSaved((v) => (v.includes(s) ? v.filter((x) => x !== s) : [...v, s])),
  }
  return <Ctx.Provider value={store}><MotionConfig reducedMotion="user">{children}</MotionConfig>{toast && <div className="toast" role="status">{toast}</div>}</Ctx.Provider>
}
export const useStore = () => { const c = useContext(Ctx); if (!c) throw new Error('Providers missing'); return c }
