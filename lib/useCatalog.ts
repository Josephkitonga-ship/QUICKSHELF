'use client'
import { useEffect, useState } from 'react'
import type { Product, Shop } from './data'
// Loads the products (and their shops) for a list of slugs, for pages that read the cart or saved items from the phone.
export function useCatalog(slugs: string[], enabled = true) {
  const key = slugs.join(','); const [data, setData] = useState<{ products: Product[]; shops: Shop[] } | null>(null)
  useEffect(() => {
    if (!enabled) return
    if (!key) { setData({ products: [], shops: [] }); return }
    let on = true
    fetch('/api/catalog?slugs=' + encodeURIComponent(key)).then((r) => r.json()).then((d) => on && setData(d)).catch(() => on && setData({ products: [], shops: [] }))
    return () => { on = false }
  }, [key, enabled])
  return data
}
