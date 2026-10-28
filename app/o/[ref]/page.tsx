'use client'
import { Skeleton } from '@/components/Skeleton'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { kes } from '@/lib/format'
import { Order, orderMessage, waLink } from '@/lib/whatsapp'
const STATUS: Record<string, string> = { pending: 'Waiting for payment', paid: 'Paid', delivered: 'Delivered', cancelled: 'Cancelled', expired: 'Hold expired' }
export default function OrderPage({ params }: { params: { ref: string } }) {
  const [orders, setOrders] = useState<Order[] | null>(null)
  useEffect(() => {
    const local = () => { const all: Order[] = JSON.parse(localStorage.getItem('qs.orders') ?? '[]'); setOrders(all.filter((o) => o.cart === params.ref)) }
    fetch(`/api/orders/${params.ref}`).then(async (r) => (r.ok ? setOrders(await r.json()) : r.status === 404 || r.status === 501 ? local() : setOrders([]))).catch(local)
  }, [params.ref])
  if (!orders) return <Skeleton />
  if (!orders.length) return <><h1>Order not found</h1><p style={{ margin: '12px 0' }}>We could not find this order.</p><Link className="btn" href="/">Back to home</Link></>
  const all = orders.reduce((a, o) => a + o.total, 0)
  return (
    <div style={{ maxWidth: 640 }}>
      <h1>Your order is in {orders.length} {orders.length === 1 ? 'part' : 'parts'}</h1>
      <p className="mu" style={{ margin: '4px 0 12px' }}>One part for each shop. Total {kes(all)}.</p>
      {orders.map((o) => (
        <section className="panel" key={o.ref}>
          <div className="row2"><h2 style={{ fontSize: 18 }}>{o.shopName}</h2><span className={`tag${o.status === 'pending' || !o.status ? ' warn' : ''}`}>{STATUS[o.status ?? 'pending']}</span></div>
          <p className="mu">Order {o.ref}</p>
          <ul style={{ paddingLeft: 18 }}>{o.lines.map((l) => <li key={l.name}>{l.name} × {l.qty}</li>)}</ul>
          <p className="mu">{o.delivery.type === 'pickup' ? 'Pickup, free' : `Delivery · ${o.delivery.area} ${kes(o.delivery.fee)}`}</p>
          <p className="row2"><b>Subtotal</b><b>{kes(o.total)}</b></p>
          {(!o.status || o.status === 'pending') && <a className="btn block" style={{ marginTop: 10 }} target="_blank" rel="noopener noreferrer" href={waLink(o.whatsapp, orderMessage(o, window.location.origin))}>Message {o.shopName} on WhatsApp</a>}
        </section>))}
      <p className="mu">Keep this page to track your order. Each shop updates its own part. Items are held for 3 hours while you arrange payment.</p>
    </div>
  )
}
