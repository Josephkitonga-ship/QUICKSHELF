import { getProduct, getShop, Product, Shop } from './data'
export type Line = { slug: string; qty: number }
export type Group = { shop: Shop; lines: { p: Product; qty: number }[]; subtotal: number }
export function groupCart(cart: Line[]): Group[] {
  const m = new Map<string, Group>()
  for (const l of cart) {
    const p = getProduct(l.slug); if (!p) continue
    const g = m.get(p.shop) ?? { shop: getShop(p.shop)!, lines: [], subtotal: 0 }
    g.lines.push({ p, qty: l.qty }); g.subtotal += p.price * l.qty; m.set(p.shop, g)
  }
  return [...m.values()]
}
