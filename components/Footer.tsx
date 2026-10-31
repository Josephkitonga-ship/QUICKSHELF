import Link from 'next/link'
export function Footer() {
  return (
    <footer className="ftr"><div className="wrap">
      <div className="cols">
        <div><b>Shop</b><Link href="/products">Browse products</Link><Link href="/products?deals=1">Hot Deals</Link><Link href="/shops">Vendors</Link><Link href="/saved">Saved items</Link></div>
        <div><b>Sell</b><Link href="/sell">Sell on QuickShelf</Link><Link href="/wholesale">Wholesale Refill Catalog</Link></div>
        <div><b>Help</b><Link href="/terms">Terms</Link><Link href="/privacy">Privacy</Link></div>
      </div>
      <p className="mu">© QuickShelf</p>
    </div></footer>
  )
}
