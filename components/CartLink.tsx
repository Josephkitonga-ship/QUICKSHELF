'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useStore } from './Providers'
export function CartLink({ className }: { className?: string }) {
  const { cart, ready } = useStore(); const n = cart.reduce((a, l) => a + l.qty, 0)
  const prev = useRef(0); const started = useRef(false); const [bump, setBump] = useState(false)
  useEffect(() => {
    if (!ready) return
    if (!started.current) { started.current = true; prev.current = n; return }
    if (n > prev.current) { setBump(true); const t = setTimeout(() => setBump(false), 400); prev.current = n; return () => clearTimeout(t) }
    prev.current = n
  }, [n, ready])
  return <Link href="/cart" className={[className, bump ? 'bump' : ''].filter(Boolean).join(' ')}>{n > 0 ? `Cart ${n}` : 'Cart'}</Link>
}
