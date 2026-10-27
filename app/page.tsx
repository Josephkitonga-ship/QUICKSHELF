import Link from 'next/link'
import { ProductCard } from '@/components/ProductCard'
import { ads, categories, products, shops } from '@/lib/data'
function Head({ t, href }: { t: string; href: string }) { return <div className="sec"><h2>{t}</h2><Link href={href}>See all</Link></div> }
export default function Home() {
  const ad = ads[0]
  return (
    <>
      <div className="rail" aria-label="Quick links">
        {['Deals', 'New arrivals'].map((t, i) => <Link key={t} className="chip" href={i ? '/products?sort=new' : '/products?deals=1'}>{t}</Link>)}
        {categories.slice(0, 6).map((c) => <Link key={c} className="chip" href={`/products?category=${encodeURIComponent(c)}`}>{c}</Link>)}
        <Link className="chip" href="/shops">All shops</Link>
      </div>
      <section className="banners" aria-label="Promotions">
        <div className="banner tinted"><span className="tag warn">Sponsored</span><h2>{ad.headline}</h2><p className="mu">{ad.line}</p><Link className="btn" href={`/shop/${ad.shop}`}>Visit shop</Link></div>
        <div className="banner"><h2>Open your shop on QuickShelf</h2><p className="mu">One product list for your shop, Jumia and Kilimall.</p><Link className="btn out" href="/sell">Learn more</Link></div>
      </section>
      <div className="sec"><h2>Shop by category</h2></div>
      <ul className="cats">{categories.map((c) => <li key={c}><Link href={`/products?category=${encodeURIComponent(c)}`}><span aria-hidden>{c[0]}</span>{c}</Link></li>)}</ul>
      <ul className="trust">
        <li><b>Approved shops</b>Every shop is reviewed first</li><li><b>Order by chat</b>Pay and agree delivery on WhatsApp</li>
        <li><b>One cart, any shop</b>One checkout, one chat per shop</li><li><b>Save favourites</b>Kept on your phone</li>
      </ul>
      <Head t="Popular this week" href="/products" />
      <div className="grid">{products.slice(0, 8).map((p) => <ProductCard key={p.slug} p={p} />)}</div>
      <Head t="Featured shops" href="/shops" />
      <ul className="list two">{shops.map((s) => <li key={s.slug}><Link className="shop" href={`/shop/${s.slug}`}><span className="avatar">{s.name[0]}</span><span><b>{s.name}</b><br /><span className="mu">{s.town} · {products.filter((p) => p.shop === s.slug).length} products</span></span></Link></li>)}</ul>
      <Head t="New arrivals" href="/products?sort=new" />
      <div className="grid">{products.filter((p) => p.badge === 'New').map((p) => <ProductCard key={p.slug} p={p} />)}</div>
      <div className="banner tinted" style={{ marginTop: 32 }}><h2>Sell on QuickShelf</h2><p className="mu">Post your products once and share one link. Orders arrive on your WhatsApp.</p><Link className="btn" href="/apply">Apply to open your shop</Link></div>
    </>
  )
}
