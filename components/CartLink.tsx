'use client'
import Link from 'next/link'
import { useStore } from './Providers'
export function CartLink({ className }: { className?: string }) {
  const { cart } = useStore(); const n = cart.reduce((a, l) => a + l.qty, 0)
  return <Link href="/cart" className={className}>{n > 0 ? `Cart ${n}` : 'Cart'}</Link>
}
