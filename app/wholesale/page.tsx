import type { Metadata } from 'next'
import Link from 'next/link'
import { WholesaleCatalog } from '@/components/WholesaleCatalog'
import { wholesale } from '@/lib/data'
import { hasBackend } from '@/lib/db'
export const metadata: Metadata = { title: 'Wholesale Refill Catalog' }
export const dynamic = 'force-dynamic'
// Sample data only. Once the backend is connected this page shows the approved-vendors notice until vendor sign-in exists,
// so wholesale prices are never shown to shoppers.
export default function Wholesale() {
  return (
    <>
      <h1>Wholesale Refill Catalog</h1>
      <p className="mu" style={{ margin: '4px 0 16px' }}>For approved vendors. Wholesale prices are not shown to shoppers.</p>
      {hasBackend
        ? <div className="panel"><b>Approved vendors only</b><p className="mu" style={{ margin: '6px 0 12px' }}>Vendor sign-in is coming soon. Apply to become a vendor to get access.</p><Link className="btn" href="/apply">Vendor Onboarding Portal</Link></div>
        : <WholesaleCatalog items={wholesale} />}
    </>
  )
}
