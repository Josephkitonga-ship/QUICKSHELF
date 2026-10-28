'use client'
import { Skeleton } from '@/components/Skeleton'
import { ProductCard } from '@/components/ProductCard'
import { useStore } from '@/components/Providers'
import { useCatalog } from '@/lib/useCatalog'
export default function Saved() {
  const { saved, ready } = useStore(); const data = useCatalog(saved, ready)
  if (!ready || !data) return <Skeleton />
  return (
    <>
      <h1>Saved items</h1>
      <p className="mu" style={{ margin: '4px 0 16px' }}>Saved items are kept on this phone.</p>
      {data.products.length ? <div className="grid">{data.products.map((p) => <ProductCard key={p.slug} p={p} />)}</div> : <p>You have not saved anything yet.</p>}
    </>
  )
}
