'use client'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { categories } from '@/lib/data'
type Item = { label: string; href: string }
const GROUPS: { title: string; items: Item[] }[] = [
  { title: 'BROWSE', items: [{ label: 'Home', href: '/' }, { label: 'All products', href: '/products' }, { label: 'Hot Deals', href: '/products?deals=1' }, { label: 'Vendors', href: '/shops' }, { label: 'Saved items', href: '/saved' }] },
  { title: 'ALL CATEGORIES', items: categories.map((c) => ({ label: c, href: `/products?category=${encodeURIComponent(c)}` })) },
  { title: 'FOR MERCHANTS & SUPPLIERS', items: [{ label: 'Sell on QuickShelf', href: '/sell' }, { label: 'Wholesale Refill Catalog', href: '/wholesale' }, { label: 'Vendor Onboarding Portal', href: '/apply' }] },
]
const WA = `https://wa.me/${process.env.NEXT_PUBLIC_QUICKSHELF_WHATSAPP ?? ''}?text=${encodeURIComponent('Hello QuickShelf')}`
export function MenuDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const reduce = useReducedMotion(); const pathname = usePathname(); const [qs, setQs] = useState(''); const [dark, setDark] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null); const panelRef = useRef<HTMLElement>(null); const onCloseRef = useRef(onClose); onCloseRef.current = onClose
  useEffect(() => {
    if (!open) return
    setQs(window.location.search); setDark(document.documentElement.dataset.theme === 'dark')
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden'; closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current()
      if (e.key === 'Tab' && panelRef.current) {
        const f = panelRef.current.querySelectorAll<HTMLElement>('a[href],button'); if (!f.length) return
        const first = f[0]; const last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', onKey) }
  }, [open])
  const isActive = (href: string) => { const [p, q] = href.split('?'); return pathname === p && (q ? qs.includes(q) : p !== '/products' || qs === '') }
  function toggleTheme() { const next = dark ? 'light' : 'dark'; document.documentElement.dataset.theme = next; try { localStorage.setItem('qs.theme', next) } catch {} setDark(next === 'dark') }
  const d = reduce ? 0 : 0.3
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="backdrop" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: d }} onClick={onClose} aria-hidden="true" />
          <motion.aside key="panel" ref={panelRef} role="dialog" aria-modal="true" aria-label="Menu" className="fixed inset-y-0 right-0 z-50 flex w-[88%] max-w-sm flex-col bg-neutral-950 text-white shadow-2xl" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', ease: 'easeOut', duration: d }}>
            <div className="flex items-center justify-between px-4 py-3">
              <Link href="/" onClick={onClose} className="flex items-center gap-2 font-bold text-white hover:no-underline"><img src="/mark.svg" alt="" width="32" height="32" /><span>QuickShelf</span></Link>
              <button ref={closeRef} onClick={onClose} aria-label="Close menu" className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-white transition-transform duration-150 active:scale-95"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg></button>
            </div>
            <motion.nav aria-label="Main menu" className="flex-1 overflow-y-auto px-4 pb-4" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: reduce ? 0 : 0.015, delayChildren: reduce ? 0 : 0.1 } } }}>
              {GROUPS.map((g) => (
                <div key={g.title}>
                  <p className="px-3 pb-1 pt-5 text-xs font-semibold tracking-widest text-neutral-400">{g.title}</p>
                  {g.items.map((it) => { const on = isActive(it.href); return (
                    <motion.div key={it.href} variants={{ hidden: { opacity: 0, x: 16 }, show: { opacity: 1, x: 0 } }}>
                      <Link href={it.href} onClick={onClose} aria-current={on ? 'page' : undefined} className={`flex min-h-[44px] items-center rounded-full px-4 text-[15px] transition-transform duration-150 hover:no-underline active:scale-95 ${on ? 'bg-white font-semibold text-neutral-950' : 'text-neutral-100 hover:bg-white/10'}`}>{it.label}</Link>
                    </motion.div>) })}
                </div>))}
            </motion.nav>
            <div className="border-t border-white/10 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span id="theme-label" className="text-sm font-medium">Dark Theme</span>
                <button role="switch" aria-checked={dark} aria-labelledby="theme-label" onClick={toggleTheme} className="flex h-11 w-16 items-center justify-center">
                  <span className={`relative h-7 w-12 rounded-full transition-colors duration-200 ${dark ? 'bg-amber-400' : 'bg-neutral-700'}`}><span className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-transform duration-200 ${dark ? 'translate-x-5' : ''}`} /></span>
                </button>
              </div>
              <a href={WA} target="_blank" rel="noopener noreferrer" className="flex min-h-[52px] w-full items-center justify-center rounded-xl bg-amber-400 text-sm font-bold tracking-wider text-neutral-950 transition-transform duration-150 hover:no-underline active:scale-95">ORDER ON WHATSAPP</a>
            </div>
          </motion.aside>
        </>)}
    </AnimatePresence>
  )
}
