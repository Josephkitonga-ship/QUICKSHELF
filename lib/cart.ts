import type { Product, Shop } from './data'
export type Line = { slug: string; qty: number }
export type Group = { shop: Shop; lines: { p: Product; qty: number }[]; subtotal: number }
export function groupCart(cart: Line[], products: Product[], shops: Shop[]): Group[] {
  const m = new Map<string, Group>()
  for (const l of cart) {
    const p = products.find((x) => x.slug === l.slug); const shop = p && shops.find((s) => s.slug === p.shop)
    if (!p || !shop) continue
    const g = m.get(p.shop) ?? { shop, lines: [], subtotal: 0 }
    g.lines.push({ p, qty: l.qty }); g.subtotal += p.price * l.qty; m.set(p.shop, g)
  }
  return [...m.values()]
}
