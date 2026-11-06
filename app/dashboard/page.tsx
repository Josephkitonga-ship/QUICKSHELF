import type { Metadata } from 'next'
import { requireShop } from '@/lib/auth'
import { kes } from '@/lib/format'
import { waPhone } from '@/lib/whatsapp'
import { orderAction } from './actions'
export const metadata: Metadata = { title: 'Orders' }
export const dynamic = 'force-dynamic'
type Item = { name: string; qty: number; price_kes: number }
type Row = { id: string; ref: string; status: string; customer_name: string; customer_phone: string; delivery_type: string; delivery_area: string | null; delivery_fee_kes: number; total_kes: number; hold_expires_at: string; created_at: string; order_items: Item[] }
const TABS: [string, string][] = [['pending', 'Pending'], ['paid', 'Paid'], ['delivered', 'Delivered'], ['closed', 'Cancelled and expired']]
const ERR: Record<string, string> = { not_allowed: 'You cannot change this order.', bad_status: 'This order has already changed. Refresh the page.', out_of_stock: 'Not enough stock to bring this order back.' }
const ACTIONS: Record<string, [string, string, boolean][]> = { pending: [['paid', 'Mark as paid', true], ['cancel', 'Cancel', false]], paid: [['delivered', 'Mark delivered', true]], expired: [['revive', 'Revive', true]], delivered: [], cancelled: [] }
export default async function Orders({ searchParams }: { searchParams: { s?: string; e?: string } }) {
  const { sb, shop } = await requireShop(); const s = searchParams.s ?? 'pending'
  const { data } = await sb.from('orders').select('id,ref,status,customer_name,customer_phone,delivery_type,delivery_area,delivery_fee_kes,total_kes,hold_expires_at,created_at,order_items(name,qty,price_kes)').eq('shop_id', shop!.id).in('status', s === 'closed' ? ['cancelled', 'expired'] : [s]).order('created_at', { ascending: false }).limit(100)
  const rows = (data ?? []) as unknown as Row[]
  return (
    <>
      <nav aria-label="Order status" className="filters">{TABS.map(([k, l]) => <a key={k} className="chip" href={`/dashboard?s=${k}`} style={s === k ? { background: 'var(--tint2)', fontWeight: 600 } : undefined}>{l}</a>)}</nav>
      {searchParams.e && <p role="alert" style={{ color: '#8A1C14', marginBottom: 12 }}>{ERR[searchParams.e] ?? 'Something went wrong. Please try again.'}</p>}
      {!rows.length && <p>No orders here.</p>}
      <div className="list">
        {rows.map((o) => {
          const mins = Math.max(0, Math.round((new Date(o.hold_expires_at).getTime() - Date.now()) / 60000))
          return (
            <section className="panel" key={o.id} style={{ marginBottom: 0 }}>
              <div className="row2"><b>{o.ref}</b><span className={`tag${o.status === 'pending' ? ' warn' : ''}`}>{o.status === 'pending' ? `Held ${Math.floor(mins / 60)}h ${mins % 60}m more` : o.status}</span></div>
              <p>{o.customer_name} · <a href={`tel:${o.customer_phone}`}>{o.customer_phone}</a></p>
              <ul style={{ paddingLeft: 18 }}>{o.order_items.map((i) => <li key={i.name}>{i.name} × {i.qty}</li>)}</ul>
              <p className="mu">{o.delivery_type === 'pickup' ? 'Pickup' : `Delivery · ${o.delivery_area} (${kes(o.delivery_fee_kes)})`}</p>
              <p className="row2"><b>Total</b><b>{kes(o.total_kes)}</b></p>
              <div className="acts" style={{ flexWrap: 'wrap' }}>
                <a className="btn out" target="_blank" rel="noopener noreferrer" href={`https://wa.me/${waPhone(o.customer_phone)}?text=${encodeURIComponent(`Hello ${o.customer_name}, this is ${shop!.name} about order ${o.ref}.`)}`}>Chat</a>
                {(ACTIONS[o.status] ?? []).map(([act, label, primary]) => <form key={act} action={orderAction} style={{ display: 'contents' }}><input type="hidden" name="id" value={o.id} /><button className={`btn${primary ? '' : ' out'}`} name="act" value={act} type="submit">{label}</button></form>)}
              </div>
            </section>)
        })}
      </div>
    </>
  )
}
