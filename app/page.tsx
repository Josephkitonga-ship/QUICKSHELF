import Link from 'next/link'
import { CategoryPillBar } from '@/components/CategoryPillBar'
import { Deck, Slide } from '@/components/Deck'
import { HScroll } from '@/components/HScroll'
import { ProductCard } from '@/components/ProductCard'
import { categories } from '@/lib/data'
import { getAd, listProducts, listShops } from '@/lib/db'
export const dynamic = 'force-dynamic'
function Head({ t, href }: { t: string; href: string }) { return <div className="sec"><h2>{t}</h2><Link href={href}>See all</Link></div> }
export default async function Home() {
  const [products, shops, ad] = await Promise.all([listProducts(), listShops(), getAd()])
  const pills = [{ label: 'Hot Deals', href: '/products?deals=1' }, { label: 'New arrivals', href: '/products?sort=new' }, ...categories.slice(0, 6).map((c) => ({ label: c, href: `/products?category=${encodeURIComponent(c)}` })), { label: 'All vendors', href: '/shops' }]
  const fresh = products.filter((p) => p.badge === 'New'); const newest = fresh.length ? fresh : products.slice(0, 8)
  const rest = products.filter((p) => !newest.includes(p)); const popular = (rest.length ? rest : products).slice(0, 8)
  const slides: Slide[] = [
    ...(ad ? [{ tag: 'Sponsored', title: ad.headline, text: ad.line, href: `/shop/${ad.shop}`, cta: 'Visit vendor' }] : []),
    { title: 'Sell on QuickShelf', text: 'Retail and wholesale.', href: '/sell', cta: 'Apply' },
    { title: 'One cart, any vendor', text: 'Chat with each vendor on WhatsApp.', href: '/products', cta: 'Shop now' },
    { title: 'Hot Deals', text: 'Offers from approved vendors.', href: '/products?deals=1', cta: 'View' },
  ]
  return (
    <>
      <CategoryPillBar items={pills} />
      <Deck slides={slides} />
      <Head t="New Arrivals" href="/products?sort=new" />
      <HScroll label="New Arrivals">{newest.map((p) => <ProductCard key={p.slug} p={p} />)}</HScroll>
      <Head t="Popular This Week" href="/products" />
      <HScroll label="Popular This Week">{popular.map((p) => <ProductCard key={p.slug} p={p} />)}</HScroll>
      <Head t="The Shelf" href="/products" />
      <div className="grid">{products.slice(0, 48).map((p) => <ProductCard key={p.slug} p={p} />)}</div>
      {products.length > 48 && <p style={{ marginTop: 16 }}><Link className="btn out" href="/products">See all products</Link></p>}
      <Head t="Featured vendors" href="/shops" />
      <ul className="list two">{shops.map((s) => <li key={s.slug}><Link className="shop" href={`/shop/${s.slug}`}><span className="avatar">{s.name[0]}</span><span><b>{s.name}</b><br /><span className="mu">{s.town} · {s.count} products</span></span></Link></li>)}</ul>
      <div className="sec"><h2>Shop by category</h2></div>
      <ul className="cats">{categories.map((c) => <li key={c}><Link href={`/products?category=${encodeURIComponent(c)}`}><span aria-hidden>{c[0]}</span>{c}</Link></li>)}</ul>
      <ul className="trust"><li><b>Approved vendors</b></li><li><b>Order on WhatsApp</b></li><li><b>One cart, any vendor</b></li><li><b>Save items</b></li></ul>
      <div className="banner tinted" style={{ marginTop: 32 }}><h2>Sell on QuickShelf</h2><p className="mu">Retail and wholesale.</p><Link className="btn" href="/sell">Apply</Link></div>
    </>
  )
}
