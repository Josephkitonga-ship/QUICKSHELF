import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AddToCart } from '@/components/AddToCart'
import { getProduct, getShop } from '@/lib/data'
import { kes } from '@/lib/format'
import { waLink } from '@/lib/whatsapp'
export default function ProductPage({ params }: { params: { slug: string } }) {
  const p = getProduct(params.slug); if (!p) notFound()
  const shop = getShop(p.shop)!
  const ask = waLink(shop.whatsapp, `Hi ${shop.name}, I’m interested in “${p.name}”. Is it still available?`)
  return (
    <div style={{ display: 'grid', gap: 24, maxWidth: 900 }}>
      <div className="photo" style={{ height: 280 }}>{p.badge && <span className="tag">{p.badge}</span>}<span>Photo</span></div>
      <div className="form">
        <h1>{p.name}</h1><p className="price" style={{ fontSize: 26 }}>{kes(p.price)}</p>
        {p.stock > 0 && p.stock <= 3 && <p className="low">Only {p.stock} left</p>}
        <p>{p.description}</p>
        <p className="mu">Delivery fee is set by area at checkout.</p>
        <AddToCart slug={p.slug} stock={p.stock} />
        <a className="btn out" href={ask} target="_blank" rel="noopener noreferrer">Ask the shop on WhatsApp</a>
        <p>Sold by <Link href={`/shop/${shop.slug}`}>{shop.name}</Link> · {shop.town}</p>
      </div>
    </div>
  )
}
