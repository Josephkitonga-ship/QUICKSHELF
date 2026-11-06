import type { Metadata } from 'next'
import { requireShop } from '@/lib/auth'
import { kes } from '@/lib/format'
import { addArea, removeArea, setPickup } from '../actions'
export const metadata: Metadata = { title: 'Delivery areas' }
export const dynamic = 'force-dynamic'
export default async function Delivery() {
  const { sb, shop } = await requireShop()
  const { data } = await sb.from('delivery_areas').select('id,name,fee_kes').eq('shop_id', shop!.id).order('name')
  const areas = (data ?? []) as { id: string; name: string; fee_kes: number }[]
  return (
    <>
      <form action={setPickup} className="panel"><label style={{ flexDirection: 'row', alignItems: 'center', minHeight: 44, display: 'flex', gap: 10 }}><input type="checkbox" name="pickup" defaultChecked={shop!.pickup} /> Offer free pickup at the shop</label><button className="btn out" type="submit">Save</button></form>
      <form action={addArea} className="form panel"><b>Add delivery area</b><label>Area<input name="name" required /></label><label>Fee (KSh)<input name="fee" type="number" min={0} required /></label><button className="btn" type="submit">Add area</button></form>
      <div className="list">{areas.map((a) => <div key={a.id} className="panel row2" style={{ alignItems: 'center', marginBottom: 0 }}><span><b>{a.name}</b> · {kes(a.fee_kes)}</span><form action={removeArea}><input type="hidden" name="id" value={a.id} /><button className="btn out" type="submit">Remove</button></form></div>)}</div>
      <p className="mu" style={{ marginTop: 12 }}>Shoppers choose one of these areas at checkout. An area that is not listed means no delivery there.</p>
    </>
  )
}
