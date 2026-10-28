import type { Metadata } from 'next'
import { ProductCard } from '@/components/ProductCard'
import { categories } from '@/lib/data'
import { listProducts } from '@/lib/db'
export const metadata: Metadata = { title: 'All products' }
export const dynamic = 'force-dynamic'
type SP = { q?: string; category?: string; sort?: string; deals?: string }
export default async function Products({ searchParams }: { searchParams: SP }) {
  const list = await listProducts({ q: searchParams.q, category: searchParams.category, sort: searchParams.sort, deals: Boolean(searchParams.deals) })
  return (
    <>
      <h1>All products</h1>
      <form className="filters" action="/products" style={{ marginTop: 12 }}>
        <label className="sr" htmlFor="fq">Search</label><input id="fq" name="q" defaultValue={searchParams.q} placeholder="Search" />
        <label className="sr" htmlFor="fc">Category</label>
        <select id="fc" name="category" defaultValue={searchParams.category ?? ''}><option value="">All categories</option>{categories.map((c) => <option key={c}>{c}</option>)}</select>
        <label className="sr" htmlFor="fs">Sort</label>
        <select id="fs" name="sort" defaultValue={searchParams.sort ?? ''}><option value="">Sort: Featured</option><option value="new">Newest</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select>
        <button className="btn" type="submit">Apply</button>
      </form>
      <p className="mu" style={{ marginBottom: 12 }}>{list.length} {list.length === 1 ? 'product' : 'products'}</p>
      {list.length ? <div className="grid">{list.map((p) => <ProductCard key={p.slug} p={p} />)}</div> : <p>No products match. Try a different search.</p>}
    </>
  )
}
