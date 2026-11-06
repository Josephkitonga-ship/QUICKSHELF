import type { Metadata } from 'next'
import { requireShop } from '@/lib/auth'
import { categories, plans } from '@/lib/data'
import { addProduct, saveProduct } from '../actions'
export const metadata: Metadata = { title: 'Products' }
export const dynamic = 'force-dynamic'
type P = { id: string; name: string; price_kes: number; stock_on_hand: number; reserved: number; category: string; badge: string | null; archived: boolean }
const ERR: Record<string, string> = { plan_limit: 'You have reached your plan’s product limit. Upgrade to add more.', plan_lapsed: 'Your plan has lapsed. Renew to add products.', invalid: 'Please enter a product name.', stock: 'Stock cannot go below the amount already reserved.' }
const Cat = ({ v }: { v?: string }) => <select name="category" defaultValue={v ?? categories[0]}>{categories.map((c) => <option key={c}>{c}</option>)}</select>
const Badge = ({ v }: { v?: string | null }) => <select name="badge" defaultValue={v ?? ''}><option value="">No badge</option><option>New</option><option>Offer</option></select>
export default async function Products({ searchParams }: { searchParams: { e?: string } }) {
  const { sb, shop } = await requireShop()
  const { data } = await sb.from('products').select('id,name,price_kes,stock_on_hand,reserved,category,badge,archived').eq('shop_id', shop!.id).order('created_at', { ascending: false })
  const list = (data ?? []) as P[]; const live = list.filter((p) => !p.archived).length; const limit = plans.find((p) => p.id === shop!.plan_id)?.products ?? 0
  return (
    <>
      <p className="mu" style={{ marginBottom: 12 }}>{live} of {limit} products used</p>
      {searchParams.e && <p role="alert" style={{ color: '#8A1C14', marginBottom: 12 }}>{ERR[searchParams.e] ?? 'Something went wrong. Please try again.'}</p>}
      <form action={addProduct} className="form panel"><b>Add product</b>
        <label>Name<input name="name" required /></label>
        <label>Price (KSh)<input name="price" type="number" min={1} required /></label>
        <label>Stock<input name="stock" type="number" min={0} defaultValue={0} /></label>
        <label>Category<Cat /></label><label>Badge<Badge /></label>
        <label>Description<textarea name="description" /></label>
        <button className="btn" type="submit">Add product</button>
      </form>
      <div className="list">
        {list.map((p) => (
          <form key={p.id} action={saveProduct} className="form panel" style={{ marginBottom: 0, opacity: p.archived ? 0.6 : 1 }}>
            <input type="hidden" name="id" value={p.id} />
            <label>Name<input name="name" defaultValue={p.name} required /></label>
            <label>Price (KSh)<input name="price" type="number" min={1} defaultValue={p.price_kes} /></label>
            <label>Stock on hand ({p.reserved} reserved)<input name="stock" type="number" min={p.reserved} defaultValue={p.stock_on_hand} /></label>
            <label>Category<Cat v={p.category} /></label><label>Badge<Badge v={p.badge} /></label>
            <div className="acts"><button className="btn" type="submit" name="archive" value="no">Save</button><button className="btn out" type="submit" name="archive" value={p.archived ? 'no' : 'yes'}>{p.archived ? 'Restore' : 'Archive'}</button></div>
          </form>))}
      </div>
    </>
  )
}
