import Link from 'next/link'
import { categories } from '@/lib/data'
import { CartLink } from './CartLink'
export function Header() {
  return (
    <header className="hdr">
      <div className="strip"><div className="wrap row"><span>Approved shops across Kenya. Order by chat.</span><Link href="/sell">Sell on QuickShelf</Link></div></div>
      <div className="wrap bar">
        <details className="menu">
          <summary>Menu</summary>
          <nav aria-label="Main menu" className="drawer">
            <Link href="/">Home</Link><Link href="/products">All products</Link><Link href="/products?deals=1">Deals</Link><Link href="/shops">Shops</Link><Link href="/saved">Saved items</Link>
            <p className="mu">Categories</p>
            {categories.map((c) => <Link key={c} href={`/products?category=${encodeURIComponent(c)}`}>{c}</Link>)}
            <Link href="/sell" className="btn">Sell on QuickShelf</Link>
          </nav>
        </details>
        <Link href="/" className="logo"><img src="/mark.svg" alt="" width="32" height="32" /><span>QuickShelf</span></Link>
        <form action="/products" role="search" className="search">
          <label htmlFor="q" className="sr">Search products and shops</label>
          <input id="q" name="q" type="search" placeholder="Search products and shops" />
          <button className="btn" type="submit">Search</button>
        </form>
        <nav className="links" aria-label="Quick links"><Link href="/sell">Sell</Link><Link href="/saved">Saved</Link><CartLink className="btn" /></nav>
      </div>
    </header>
  )
}
