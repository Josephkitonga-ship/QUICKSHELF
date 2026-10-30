import { kes } from './format'
export type Order = {
  ref: string; cart: string; shop: string; shopName: string; whatsapp: string; name: string
  lines: { name: string; qty: number; price: number }[]
  delivery: { type: 'pickup' | 'delivery'; area?: string; fee: number }; total: number; status?: string
}
export function orderMessage(o: Order, origin: string) {
  const shown = o.lines.slice(0, 6).map((l, i) => `${i + 1}. ${l.name} × ${l.qty}: ${kes(l.price * l.qty)}`)
  const more = o.lines.length > 6 ? [`and ${o.lines.length - 6} more, see the link`] : []
  const del = o.delivery.type === 'pickup' ? 'Pickup' : `Delivery: ${o.delivery.area} (${kes(o.delivery.fee)})`
  return [`Hello ${o.shopName}, I’d like to order on QuickShelf.`, '', `Order: ${o.ref}`, `Name: ${o.name}`, 'Items:', ...shown, ...more, del, `Total: ${kes(o.total)}`, '', `Track: ${origin}/o/${o.cart}`].join('\n')
}
export const waLink = (number: string, text: string) => `https://wa.me/${number}?text=${encodeURIComponent(text)}`

// One item ordered straight from a product page.
export const quickOrderMessage = (vendor: string, item: string, qty: number, total: number) =>
  `Hello ${vendor}, I would like to order from QuickShelf:\n• Item: ${item}\n• Quantity: ${qty} pc(s)\n• Total: ${kes(total)}\nPlease confirm availability for local delivery.`
// A vendor restocking from a supplier.
export const refillMessage = (supplier: string, buyerShop: string, item: string, qty: number, unit: number) =>
  `Hello ${supplier}, ${buyerShop} wants to place a B2B REFILL ORDER via QuickShelf:\n• Item: ${item}\n• Quantity: ${qty} pcs (Bulk Refill)\n• Tier Price: ${kes(unit)} / unit\n• Total: ${kes(unit * qty)}\nPlease confirm stock availability and dispatch time.`
