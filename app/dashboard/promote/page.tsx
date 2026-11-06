import type { Metadata } from 'next'
import { requireShop } from '@/lib/auth'
import { addAd } from '../actions'
export const metadata: Metadata = { title: 'Promote' }
export const dynamic = 'force-dynamic'
export default async function Promote({ searchParams }: { searchParams: { e?: string } }) {
  const { sb, shop } = await requireShop()
  const { data } = await sb.from('ads').select('id,placement,headline,starts_at,ends_at,status').eq('shop_id', shop!.id).order('created_at', { ascending: false })
  const ads = (data ?? []) as { id: string; placement: string; headline: string; starts_at: string; ends_at: string; status: string }[]
  return (
    <>
      <form action={addAd} className="form panel"><b>Promote your shop</b>
        <label>Where<select name="placement"><option value="banner">Top banner</option><option value="sponsored_product">Sponsored product</option><option value="featured_shop">Featured vendor</option></select></label>
        <label>Headline<input name="headline" required /></label><label>Line under it<input name="line" /></label>
        <label>Start date<input name="start" type="date" required /></label>
        <label>Weeks<select name="weeks"><option>1</option><option>2</option><option>4</option></select></label>
        <label>M-Pesa code for the ad fee<input name="code" /></label>
        {searchParams.e && <p role="alert" style={{ color: '#8A1C14' }}>Please check the headline and start date.</p>}
        <p className="mu">We review every ad. It always shows a “Sponsored” label.</p>
        <button className="btn" type="submit">Submit for approval</button>
      </form>
      <div className="list">{ads.map((a) => <div key={a.id} className="panel row2" style={{ marginBottom: 0 }}><span><b>{a.headline}</b><br /><span className="mu">{a.placement} · {new Date(a.starts_at).toLocaleDateString('en-KE')} to {new Date(a.ends_at).toLocaleDateString('en-KE')}</span></span><span className="tag">{a.status}</span></div>)}</div>
    </>
  )
}
