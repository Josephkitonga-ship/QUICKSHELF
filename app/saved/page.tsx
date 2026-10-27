'use client'
import { ProductCard } from '@/components/ProductCard'
import { useStore } from '@/components/Providers'
import { getProduct } from '@/lib/data'
export default function Saved() {
  const { saved } = useStore(); const list = saved.map(getProduct).filter((p) => !!p)
  return (
    <>
      <h1>Saved items</h1>
      <p className="mu" style={{ margin: '4px 0 16px' }}>Saved items are kept on this phone.</p>
      {list.length ? <div className="grid">{list.map((p) => <ProductCard key={p!.slug} p={p!} />)}</div> : <p>You have not saved anything yet.</p>}
    </>
  )
}
