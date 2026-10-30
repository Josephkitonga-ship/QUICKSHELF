import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AddToCart } from '@/components/AddToCart'
import { getProduct } from '@/lib/db'
export const dynamic = 'force-dynamic'
import { kes } from '@/lib/format'
import { waLink } from '@/lib/whatsapp'
export default async function ProductPage({ params }: { params: { slug: string } }) {
  const p = await getProduct(params.slug); if (!p) notFound()
  const ask = waLink(p.shopWhatsapp, `Hi ${p.shopName}, I’m interested in “${p.name}”. Is it still available?`)
  return (
    <div style={{ display: 'grid', gap: 24, maxWidth: 900 }}>
      <div className="photo" style={{ height: 280 }}>{p.badge && <span className="tag">{p.badge}</span>}<span>Photo</span></div>
      <div className="form">
        <h1>{p.name}</h1><p className="price" style={{ fontSize: 26 }}>{kes(p.price)}</p>
        {p.stock > 0 && p.stock <= 3 && <p className="low">Only {p.stock} left</p>}
        <p>{p.description}</p>
        <p className="mu">Delivery fee is set by area at checkout.</p>
        <AddToCart slug={p.slug} stock={p.stock} name={p.name} price={p.price} vendor={p.shopName} whatsapp={p.shopWhatsapp} />
        <a className="btn out" href={ask} target="_blank" rel="noopener noreferrer">Ask the vendor on WhatsApp</a>
        <p>Sold by <Link href={`/shop/${p.shop}`}>{p.shopName}</Link> · {p.town}</p>
      </div>
    </div>
  )
}
