'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
export type Pill = { label: string; href: string }
// Horizontal category pills. The highlight slides to the selected pill, and the selected pill scrolls into view.
export function CategoryPillBar({ items, active }: { items: Pill[]; active?: string }) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => { ref.current?.querySelector('[aria-current="true"]')?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' }) }, [active])
  return (
    <nav ref={ref} aria-label="Categories" className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-3 pt-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none]">
      {items.map((it) => { const on = it.href === active; return (
        <Link key={it.href} href={it.href} aria-current={on ? 'true' : undefined} className="relative inline-flex min-h-[44px] flex-none snap-start items-center whitespace-nowrap rounded-full border border-line px-4 text-sm text-ink transition-transform duration-150 hover:no-underline active:scale-95">
          {on && <motion.span layoutId="pill-highlight" className="absolute inset-0 rounded-full bg-tint2" transition={{ type: 'tween', duration: 0.25 }} />}
          <span className="relative">{it.label}</span>
        </Link>) })}
    </nav>
  )
}
