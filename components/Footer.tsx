import Link from 'next/link'
export function Footer() {
  return (
    <footer className="ftr"><div className="wrap">
      <div className="cols">
        <div><b>Shop</b><Link href="/products">Browse products</Link><Link href="/products?deals=1">Deals</Link><Link href="/shops">Shops</Link><Link href="/saved">Saved items</Link></div>
        <div><b>Sell</b><Link href="/sell">Open your shop</Link><Link href="/apply">Apply now</Link></div>
        <div><b>Help</b><Link href="/terms">Terms</Link><Link href="/privacy">Privacy</Link></div>
      </div>
      <p className="mu">© QuickShelf</p>
    </div></footer>
  )
}
