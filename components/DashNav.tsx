'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
export type Tab = [string, string]
// Tabs for the vendor dashboard and the owner area, plus the account row.
export function DashNav({ title, note, tabs, viewHref }: { title: string; note?: string; tabs: Tab[]; viewHref?: string }) {
  const path = usePathname()
  return (
    <div style={{ marginBottom: 16 }}>
      <div className="row2" style={{ alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
        <div><b style={{ fontSize: 18 }}>{title}</b>{note && <span className="tag" style={{ marginLeft: 8 }}>{note}</span>}</div>
        <span style={{ display: 'flex', gap: 8 }}>
          {viewHref && <Link className="btn out" href={viewHref}>View my page</Link>}
          <form action="/auth/signout" method="post"><button className="btn out" type="submit">Log out</button></form>
        </span>
      </div>
      <nav aria-label="Dashboard" className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {tabs.map(([label, href]) => <Link key={href} href={href} className="chip" aria-current={path === href ? 'page' : undefined} style={path === href ? { background: 'var(--tint2)', fontWeight: 600 } : undefined}>{label}</Link>)}
      </nav>
    </div>
  )
}
