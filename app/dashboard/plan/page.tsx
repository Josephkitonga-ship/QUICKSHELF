import type { Metadata } from 'next'
import { requireShop } from '@/lib/auth'
import { plans } from '@/lib/data'
import { kes } from '@/lib/format'
import { submitPayment } from '../actions'
export const metadata: Metadata = { title: 'Plan and billing' }
export const dynamic = 'force-dynamic'
const ERR: Record<string, string> = { invalid: 'Please enter the M-Pesa code.', duplicate: 'That M-Pesa code has already been used.' }
export default async function Plan({ searchParams }: { searchParams: { e?: string } }) {
  const { sb, shop } = await requireShop(); const cur = plans.find((p) => p.id === shop!.plan_id)
  const { data } = await sb.from('subscription_payments').select('id,plan_id,amount_kes,mpesa_code,status,created_at').eq('shop_id', shop!.id).order('created_at', { ascending: false }).limit(20)
  const pays = (data ?? []) as { id: string; plan_id: string; amount_kes: number; mpesa_code: string; status: string }[]
  return (
    <>
      <div className="panel"><p className="mu">Current plan</p><p className="price" style={{ fontSize: 24 }}>{cur?.name} · {kes(cur?.price ?? 0)} per month</p><p>Up to {cur?.products} products{shop!.plan_expires_at ? ` · ends ${new Date(shop!.plan_expires_at).toLocaleDateString('en-KE')}` : ''}</p></div>
      <form action={submitPayment} className="form panel"><b>Pay or renew by M-Pesa</b>
        <p className="mu">Send the amount to Till number {process.env.NEXT_PUBLIC_MPESA_TILL ?? '[TILL NUMBER]'}, then enter the code. We confirm it and extend your plan by 30 days.</p>
        <label>Plan<select name="plan" defaultValue={shop!.plan_id}>{plans.map((p) => <option key={p.id} value={p.id}>{p.name} · up to {p.products} products · {kes(p.price)}</option>)}</select></label>
        <label>M-Pesa code<input name="code" required /></label>
        {searchParams.e && <p role="alert" style={{ color: '#8A1C14' }}>{ERR[searchParams.e] ?? 'Something went wrong. Please try again.'}</p>}
        <button className="btn" type="submit">Submit code</button>
      </form>
      <div className="list">{pays.map((p) => <div key={p.id} className="panel row2" style={{ marginBottom: 0 }}><span>{plans.find((x) => x.id === p.plan_id)?.name} · {kes(p.amount_kes)} · {p.mpesa_code}</span><span className="tag">{p.status}</span></div>)}</div>
    </>
  )
}
