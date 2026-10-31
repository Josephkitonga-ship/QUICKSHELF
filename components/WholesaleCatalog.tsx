'use client'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { unitPrice, type WholesaleItem } from '@/lib/data'
import { kes } from '@/lib/format'
import { batchMessage, quoteMessage, waLink } from '@/lib/whatsapp'
type Line = { slug: string; qty: number }
type Mode = 'visitor' | 'vendor'
const QS_WA = process.env.NEXT_PUBLIC_QUICKSHELF_WHATSAPP ?? ''
const label = (x: WholesaleItem, i: number) => { const n = x.breaks[i + 1]; return n ? `${x.breaks[i].from}–${n.from - 1} units` : `${x.breaks[i].from}+ units` }
function useWide() {
  const [w, setW] = useState(false)
  useEffect(() => { const m = window.matchMedia('(min-width: 768px)'); const f = () => setW(m.matches); f(); m.addEventListener('change', f); return () => m.removeEventListener('change', f) }, [])
  return w
}
// A panel that slides in from the right on desktop and up from the bottom on mobile.
function Sheet({ open, onClose, title, wide, children }: { open: boolean; onClose: () => void; title: string; wide: boolean; children: ReactNode }) {
  useEffect(() => { if (!open) return; const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k) }, [open, onClose])
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="bd" className="fixed inset-0 z-50 bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} aria-hidden="true" />
          <motion.div key="panel" role="dialog" aria-modal="true" aria-label={title} className={`fixed z-50 overflow-y-auto bg-surface text-ink shadow-2xl ${wide ? 'inset-y-0 right-0 w-[420px] max-w-full' : 'inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl'}`}
            initial={wide ? { x: '100%' } : { y: '100%' }} animate={wide ? { x: 0 } : { y: 0 }} exit={wide ? { x: '100%' } : { y: '100%' }} transition={{ type: 'tween', ease: 'easeOut', duration: 0.25 }}>
            <div className="sticky top-0 flex items-center justify-between border-b border-line bg-surface p-4"><b>{title}</b><button className="btn out" onClick={onClose} aria-label="Close">✕</button></div>
            <div className="p-4">{children}</div>
          </motion.div>
        </>)}
    </AnimatePresence>
  )
}
const Verified = ({ on }: { on: boolean }) => on ? <span className="tag" style={{ background: 'var(--tint2)' }}>Verified Supplier</span> : null
// Wholesale catalogue. Visitors see the products and MOQ but not the prices. Approved vendors see prices and build a batch order.
export function WholesaleCatalog({ items, sample }: { items: WholesaleItem[]; sample: boolean }) {
  const wide = useWide()
  const [mode, setMode] = useState<Mode>('visitor'); const [open, setOpen] = useState<WholesaleItem | null>(null); const [batchOpen, setBatchOpen] = useState(false)
  const [batch, setBatch] = useState<Line[]>([]); const [buyer, setBuyer] = useState({ shop: '', loc: '' }); const [qty, setQty] = useState(0); const [ready, setReady] = useState(false)
  useEffect(() => { try { setBatch(JSON.parse(localStorage.getItem('qs.batch') ?? '[]')); setBuyer(JSON.parse(localStorage.getItem('qs.buyer') ?? '{"shop":"","loc":""}')) } catch {} setReady(true) }, [])
  useEffect(() => { if (ready) try { localStorage.setItem('qs.batch', JSON.stringify(batch)); localStorage.setItem('qs.buyer', JSON.stringify(buyer)) } catch {} }, [batch, buyer, ready])
  const vendor = mode === 'vendor'
  const inspect = (x: WholesaleItem) => { setOpen(x); setQty(x.moq) }
  const add = (x: WholesaleItem, q: number) => { setBatch((b) => (b.some((l) => l.slug === x.slug) ? b.map((l) => (l.slug === x.slug ? { ...l, qty: l.qty + q } : l)) : [...b, { slug: x.slug, qty: q }])); setOpen(null) }
  const groups = useMemo(() => {
    type G = { supplier: string; whatsapp: string; lines: { x: WholesaleItem; qty: number }[] }
    const m = new Map<string, G>()
    for (const l of batch) { const x = items.find((i) => i.slug === l.slug); if (!x) continue; const g: G = m.get(x.supplier) ?? { supplier: x.supplier, whatsapp: x.whatsapp, lines: [] }; g.lines.push({ x, qty: l.qty }); m.set(x.supplier, g) }
    return [...m.values()]
  }, [batch, items])
  const sum = (ls: { x: WholesaleItem; qty: number }[]) => ls.reduce((a, { x, qty: q }) => a + unitPrice(x, q) * q, 0)
  const total = groups.reduce((a, g) => a + sum(g.lines), 0); const count = batch.length
  const detail = (x: WholesaleItem) => {
    const q = Math.max(x.moq, qty); const price = unitPrice(x, q)
    return (
      <div className="form">
        <p className="mu">{x.specs}</p>
        <p>{x.supplier} · {x.town} <Verified on={x.verified} /></p>
        <p className="mu">Dispatch {x.dispatch}.</p>
        <span className="tag">MOQ: {x.moq} Units</span>
        {vendor ? (
          <>
            <ul style={{ paddingLeft: 18 }}>{x.breaks.map((b, i) => <li key={b.from}>{label(x, i)}: <b>{kes(b.price)}</b> / unit</li>)}</ul>
            <label>Quantity (units)<span style={{ display: 'flex', gap: 8 }}><button className="btn out" onClick={() => setQty(Math.max(x.moq, q - 1))} aria-label="Less">−</button><input type="number" min={x.moq} value={q} onChange={(e) => setQty(Math.max(x.moq, Number(e.target.value) || x.moq))} /><button className="btn out" onClick={() => setQty(q + 1)} aria-label="More">+</button></span></label>
            <p className="row2"><span>{kes(price)} / unit</span><b className="total">{kes(price * q)}</b></p>
            <button className="btn" onClick={() => add(x, q)}>Add to Wholesale Order Batch</button>
          </>
        ) : (
          <>
            <p className="mu">Sign in as a vendor to see prices.</p>
            <Link className="btn" href={`/products?q=${encodeURIComponent(x.name)}`}>Buy Single Unit from Retail Store</Link>
            <a className="btn out" target="_blank" rel="noopener noreferrer" href={waLink(QS_WA, quoteMessage(x.name, x.moq))}>Request Bulk Quote</a>
          </>)}
      </div>
    )
  }
  return (
    <>
      {sample && (
        <div className="panel"><p className="mu" style={{ marginBottom: 8 }}>Sample catalogue. Preview as:</p>
          <div className="filters" style={{ marginBottom: 0 }}>
            <button className={`btn ${vendor ? 'out' : ''}`} aria-pressed={!vendor} onClick={() => setMode('visitor')}>Visitor</button>
            <button className={`btn ${vendor ? '' : 'out'}`} aria-pressed={vendor} onClick={() => setMode('vendor')}>Approved vendor</button>
          </div></div>)}
      {/* Desktop: a dense table. Click a row to inspect it. */}
      <div className="hidden md:block">
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead><tr className="mu" style={{ textAlign: 'left' }}>{['Product', 'MOQ', 'Price brackets', 'Supplier', ''].map((h) => <th key={h} style={{ padding: '12px 16px', fontWeight: 500 }}>{h}</th>)}</tr></thead>
            <tbody>{items.map((x) => (
              <tr key={x.slug} style={{ borderTop: '1px solid var(--line)' }}>
                <td style={{ padding: '12px 16px' }}><b>{x.name}</b><br /><span className="mu">{x.specs}</span></td>
                <td style={{ padding: '12px 16px' }}><span className="tag">MOQ: {x.moq} Units</span></td>
                <td style={{ padding: '12px 16px' }}>{vendor ? x.breaks.map((b, i) => <div key={b.from}>{label(x, i)}: <b>{kes(b.price)}</b></div>) : <span className="mu">Vendors only</span>}</td>
                <td style={{ padding: '12px 16px' }}>{x.supplier}<br /><span className="mu">{x.town}</span> <Verified on={x.verified} /></td>
                <td style={{ padding: '12px 16px' }}><button className="btn out" onClick={() => inspect(x)}>Inspect</button></td>
              </tr>))}</tbody>
          </table>
        </div>
      </div>
      {/* Mobile: two-column cards. Tap one to open its quantity sheet. */}
      <div className="grid md:hidden">
        {items.map((x) => (
          <article className="card" key={x.slug}>
            <button className="w-full text-left" style={{ background: 'none', border: 0, padding: 0, color: 'inherit', font: 'inherit' }} onClick={() => inspect(x)}>
              <h3>{x.name}</h3>
              <p className="price">{vendor ? `${kes(x.breaks[0].price)} / unit` : 'Vendors only'}</p>
              <p style={{ margin: '6px 0' }}><span className="tag">MOQ: {x.moq} Units</span></p>
              <p className="mu">{x.supplier} · {x.town}</p><Verified on={x.verified} />
            </button>
          </article>))}
      </div>
      <Sheet open={!!open} onClose={() => setOpen(null)} title={open?.name ?? ''} wide={wide}>{open && detail(open)}</Sheet>
      {vendor && count > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface p-3">
          <button className="btn block" onClick={() => setBatchOpen(true)}>Wholesale Order Batch · {count} {count === 1 ? 'item' : 'items'} · {kes(total)}</button>
        </div>)}
      <Sheet open={batchOpen} onClose={() => setBatchOpen(false)} title="Wholesale Order Batch" wide={wide}>
        <div className="form">
          <label>Your shop name<input value={buyer.shop} onChange={(e) => setBuyer({ ...buyer, shop: e.target.value })} /></label>
          <label>County or town<input value={buyer.loc} onChange={(e) => setBuyer({ ...buyer, loc: e.target.value })} /></label>
          {groups.map((g) => {
            const sub = sum(g.lines); const ok = buyer.shop.trim() && buyer.loc.trim()
            return (
              <section className="panel" key={g.supplier}>
                <b>{g.supplier}</b>
                {g.lines.map(({ x, qty: q }) => (
                  <div key={x.slug} className="row2" style={{ alignItems: 'center', marginTop: 8 }}>
                    <span>{x.name}<br /><span className="mu">{kes(unitPrice(x, q))} / unit</span></span>
                    <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input aria-label={`Units of ${x.name}`} type="number" min={x.moq} value={q} style={{ width: 72 }} onChange={(e) => setBatch((b) => b.map((l) => (l.slug === x.slug ? { ...l, qty: Math.max(x.moq, Number(e.target.value) || x.moq) } : l)))} />
                      <button className="btn out" onClick={() => setBatch((b) => b.filter((l) => l.slug !== x.slug))} aria-label={`Remove ${x.name}`}>✕</button>
                    </span>
                  </div>))}
                <p className="row2" style={{ margin: '10px 0' }}><b>Total estimate</b><b>{kes(sub)}</b></p>
                {ok
                  ? <a className="btn block" target="_blank" rel="noopener noreferrer" href={waLink(g.whatsapp, batchMessage(g.supplier, g.lines.map(({ x, qty: q }) => ({ name: x.name, qty: q, price: unitPrice(x, q) })), sub, buyer.shop.trim(), buyer.loc.trim()))}>Send to {g.supplier} on WhatsApp</a>
                  : <button className="btn block" disabled>Enter your shop name and county or town</button>}
              </section>)
          })}
          {!groups.length && <p className="mu">Your batch is empty.</p>}
        </div>
      </Sheet>
    </>
  )
}
