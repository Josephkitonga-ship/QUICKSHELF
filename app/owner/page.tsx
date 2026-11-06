import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/auth'
import { plans } from '@/lib/data'
import { kes } from '@/lib/format'
import { approveApplication, rejectApplication, reviewAd, reviewPayment } from './actions'
export const metadata: Metadata = { title: 'Approvals' }
export const dynamic = 'force-dynamic'
const ERR: Record<string, string> = { no_email: 'This application has no email, so a login cannot be created.', no_user: 'Could not create or find the login.', bad_status: 'Already handled. Refresh the page.' }
type App = { id: string; kind: string; shop_name: string; owner_name: string; phone: string; email: string | null; county: string | null; sub_county: string | null; sells: string; plan_id: string; supply_capacity: string | null; corridors: string | null; moq_rules: string | null; registration_no: string | null }
type Pay = { id: string; plan_id: string; amount_kes: number; mpesa_code: string; shops: { name: string } }
type Ad = { id: string; placement: string; headline: string; payment_code: string | null; starts_at: string; ends_at: string; shops: { name: string } }
const Yes = ({ id, ok, act, label, primary }: { id: string; ok?: string; act: (fd: FormData) => Promise<void>; label: string; primary?: boolean }) => <form action={act} style={{ display: 'contents' }}><input type="hidden" name="id" value={id} />{ok && <input type="hidden" name="ok" value={ok} />}<button className={`btn${primary ? '' : ' out'}`} type="submit">{label}</button></form>
export default async function Owner({ searchParams }: { searchParams: { e?: string } }) {
  const { sb } = await requireAdmin()
  const [a, p, d] = await Promise.all([
    sb.from('applications').select('*').eq('status', 'new').order('created_at'),
    sb.from('subscription_payments').select('id,plan_id,amount_kes,mpesa_code,shops(name)').eq('status', 'pending').order('created_at'),
    sb.from('ads').select('id,placement,headline,payment_code,starts_at,ends_at,shops(name)').eq('status', 'pending').order('created_at'),
  ])
  const apps = (a.data ?? []) as App[]; const pays = (p.data ?? []) as unknown as Pay[]; const ads = (d.data ?? []) as unknown as Ad[]
  return (
    <>
      {searchParams.e && <p role="alert" style={{ color: '#8A1C14', marginBottom: 12 }}>{ERR[searchParams.e] ?? 'Something went wrong.'}</p>}
      <h2 style={{ fontSize: 20, margin: '8px 0' }}>Applications ({apps.length})</h2>
      <div className="list">{apps.map((x) => (
        <section className="panel" key={x.id} style={{ marginBottom: 0 }}>
          <div className="row2"><b>{x.shop_name}</b><span className="tag">{x.kind === 'wholesale' ? 'Wholesale Merchant' : 'Retail Vendor'}</span></div>
          <p>{x.owner_name} · {x.phone} · {x.email ?? 'no email'}</p>
          <p className="mu">{x.sub_county}, {x.county} · {x.sells} · {plans.find((q) => q.id === x.plan_id)?.name}</p>
          {x.kind === 'wholesale' && <p className="mu">Capacity: {x.supply_capacity} · Corridors: {x.corridors} · MOQ: {x.moq_rules} · Registration or ID: {x.registration_no}</p>}
          <div className="acts"><Yes id={x.id} act={approveApplication} label="Approve" primary /><Yes id={x.id} act={rejectApplication} label="Reject" /></div>
        </section>))}</div>
      <h2 style={{ fontSize: 20, margin: '20px 0 8px' }}>Plan payments ({pays.length})</h2>
      <div className="list">{pays.map((x) => <section className="panel" key={x.id} style={{ marginBottom: 0 }}><p><b>{x.shops.name}</b> · {plans.find((q) => q.id === x.plan_id)?.name} · {kes(x.amount_kes)}</p><p className="mu">M-Pesa code: {x.mpesa_code}. Check it against your M-Pesa messages first.</p><div className="acts"><Yes id={x.id} ok="yes" act={reviewPayment} label="Confirm" primary /><Yes id={x.id} ok="no" act={reviewPayment} label="Reject" /></div></section>)}</div>
      <h2 style={{ fontSize: 20, margin: '20px 0 8px' }}>Ads ({ads.length})</h2>
      <div className="list">{ads.map((x) => <section className="panel" key={x.id} style={{ marginBottom: 0 }}><p><b>{x.headline}</b> · {x.shops.name}</p><p className="mu">{x.placement} · {new Date(x.starts_at).toLocaleDateString('en-KE')} to {new Date(x.ends_at).toLocaleDateString('en-KE')} · code {x.payment_code ?? 'none'}</p><div className="acts"><Yes id={x.id} ok="yes" act={reviewAd} label="Approve" primary /><Yes id={x.id} ok="no" act={reviewAd} label="Reject" /></div></section>)}</div>
    </>
  )
}
