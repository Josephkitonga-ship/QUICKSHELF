import type { Metadata } from 'next'
import Link from 'next/link'
import { listShops } from '@/lib/db'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Shops' }
export default async function Shops() {
  const shops = await listShops()
  return (
    <>
      <h1>Shops</h1>
      <ul className="list two" style={{ marginTop: 16 }}>{shops.map((s) => <li key={s.slug}><Link className="shop" href={`/shop/${s.slug}`}><span className="avatar">{s.name[0]}</span><span><b>{s.name}</b><br /><span className="mu">{s.town} · {s.category} · {s.count} products</span></span></Link></li>)}</ul>
    </>
  )
}
