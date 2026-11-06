import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/auth'
import { plans } from '@/lib/data'
import { setStatus } from '../actions'
export const metadata: Metadata = { title: 'Vendors' }
export const dynamic = 'force-dynamic'
export default async function Shops() {
  const { sb } = await requireAdmin()
  const { data } = await sb.from('shops').select('id,name,slug,town,status,plan_id,plan_expires_at').order('name')
  const shops = (data ?? []) as { id: string; name: string; slug: string; town: string; status: string; plan_id: string; plan_expires_at: string | null }[]
  return (
    <div className="list">{shops.map((s) => (
      <section className="panel row2" key={s.id} style={{ alignItems: 'center', marginBottom: 0 }}>
        <span><b>{s.name}</b> · {s.town}<br /><span className="mu">{plans.find((p) => p.id === s.plan_id)?.name} · {s.plan_expires_at ? `ends ${new Date(s.plan_expires_at).toLocaleDateString('en-KE')}` : 'no end date'} · {s.status}</span></span>
        <form action={setStatus}><input type="hidden" name="id" value={s.id} /><input type="hidden" name="status" value={s.status === 'active' ? 'suspended' : 'active'} /><button className="btn out" type="submit">{s.status === 'active' ? 'Suspend' : 'Activate'}</button></form>
      </section>))}</div>
  )
}
