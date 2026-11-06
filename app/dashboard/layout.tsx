import { DashNav } from '@/components/DashNav'
import { OrderAlerts } from '@/components/OrderAlerts'
import { requireShop } from '@/lib/auth'
import { hasBackend } from '@/lib/db'
export const dynamic = 'force-dynamic'
export default async function Layout({ children }: { children: React.ReactNode }) {
  if (!hasBackend) return <div className="panel"><b>Dashboard</b><p className="mu">Available once the backend is connected.</p></div>
  const { shop } = await requireShop()
  if (!shop) return <div className="panel"><b>No vendor account is linked to this login.</b><p className="mu">Apply at Sell on QuickShelf, or log in with the email you applied with.</p></div>
  const days = shop.plan_expires_at ? Math.ceil((new Date(shop.plan_expires_at).getTime() - Date.now()) / 86400000) : null
  const note = shop.status !== 'active' ? 'Suspended' : days === null ? undefined : days >= 0 ? `Plan ends in ${days} days` : 'Plan lapsed'
  return (
    <>
      <DashNav title={shop.name} note={note} viewHref={`/shop/${shop.slug}`} tabs={[['Orders', '/dashboard'], ['Products', '/dashboard/products'], ['Delivery areas', '/dashboard/delivery'], ['Plan and billing', '/dashboard/plan'], ['Promote', '/dashboard/promote']]} />
      <OrderAlerts shopId={shop.id} />
      {children}
    </>
  )
}
