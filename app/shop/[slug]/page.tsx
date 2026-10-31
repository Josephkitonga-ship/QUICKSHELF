import { notFound } from 'next/navigation'
import { ProductCard } from '@/components/ProductCard'
import { ShareTools } from '@/components/ShareTools'
import { getShop, listProducts } from '@/lib/db'
export const dynamic = 'force-dynamic'
import { waLink } from '@/lib/whatsapp'
export default async function ShopPage({ params }: { params: { slug: string } }) {
  const shop = await getShop(params.slug); if (!shop) notFound()
  const list = await listProducts({ shop: shop.slug })
  return (
    <>
      <div className="row2" style={{ alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}><span className="avatar">{shop.name[0]}</span><div><h1>{shop.name}</h1><p className="mu">{shop.town} · {shop.category}</p></div></div>
        <a className="btn out" href={waLink(shop.whatsapp, `Hi ${shop.name}`)} target="_blank" rel="noopener noreferrer">Chat</a>
      </div>
      <ShareTools path={`/shop/${shop.slug}`} name={shop.slug} />
      <div className="grid">{list.map((p) => <ProductCard key={p.slug} p={p} />)}</div>
    </>
  )
}
