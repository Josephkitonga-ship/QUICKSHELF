import { DashNav } from '@/components/DashNav'
import { requireAdmin } from '@/lib/auth'
import { hasBackend } from '@/lib/db'
export const dynamic = 'force-dynamic'
export default async function Layout({ children }: { children: React.ReactNode }) {
  if (!hasBackend) return <div className="panel"><b>Owner area</b><p className="mu">Available once the backend is connected.</p></div>
  await requireAdmin()
  return <><DashNav title="Platform owner" tabs={[['Approvals', '/owner'], ['Vendors', '/owner/shops']]} />{children}</>
}
