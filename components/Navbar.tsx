'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { MenuDrawer } from './MenuDrawer'
import { useStore } from './Providers'
const Icon = ({ d }: { d: string }) => <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
const SEARCH = 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3'
const CART = 'M3 4h2l2.4 10.5a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20 8H6.2M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm9 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z'
const MENU = 'M4 6h16M4 12h16M4 18h16'
const btn = 'relative inline-flex h-11 w-11 items-center justify-center rounded-xl text-ink transition-transform duration-150 active:scale-95'
// Compact top bar. It hides when you scroll down and comes back when you scroll up.
export function Navbar() {
  const [hidden, setHidden] = useState(false); const [open, setOpen] = useState(false); const [search, setSearch] = useState(false)
  const last = useRef(0); const menuBtn = useRef<HTMLButtonElement>(null)
  const { cart } = useStore(); const n = cart.reduce((a, l) => a + l.qty, 0)
  useEffect(() => {
    let raf = 0
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { const y = window.scrollY; if (y > last.current + 8 && y > 80) setHidden(true); else if (y < last.current - 8 || y <= 80) setHidden(false); last.current = y }) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf) }
  }, [])
  const hide = hidden && !open && !search
  return (
    <>
      <header className={`sticky top-0 z-40 border-b border-line bg-bg transition-all duration-300 motion-reduce:transition-none ${hide ? '-translate-y-full' : 'translate-y-0'}`}>
        <div className="wrap flex h-14 items-center justify-between">
          <Link href="/" className="logo"><img src="/mark.svg" alt="" width="32" height="32" /><span>QuickShelf</span></Link>
          <div className="flex items-center gap-1">
            <button className={btn} aria-label="Search products and shops" aria-expanded={search} onClick={() => setSearch((s) => !s)}><Icon d={SEARCH} /></button>
            <Link href="/cart" className={btn} aria-label={n > 0 ? `Cart ${n}` : 'Cart'}><Icon d={CART} />{n > 0 && <span className="absolute right-0.5 top-0.5 min-w-[18px] rounded-full bg-accent px-1 text-center text-[11px] font-semibold leading-[18px] text-white">{n}</span>}</Link>
            <button ref={menuBtn} className={btn} aria-label="Menu" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}><Icon d={MENU} /></button>
          </div>
        </div>
        {search && (
          <form action="/products" role="search" className="wrap flex gap-2 pb-3" onSubmit={() => setSearch(false)}>
            <label htmlFor="q" className="sr">Search products and shops</label>
            <input id="q" name="q" type="search" autoFocus placeholder="Search products and shops" className="flex-1" />
            <button className="btn" type="submit">Search</button>
          </form>)}
      </header>
      <MenuDrawer open={open} onClose={() => { setOpen(false); menuBtn.current?.focus() }} />
    </>
  )
}
