import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
// Signed-in client for server pages and actions. It acts as the logged-in user, so row-level security applies.
export function supabaseServer() {
  const store = cookies()
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { getAll: () => store.getAll(), setAll: (list) => { try { list.forEach(({ name, value, options }) => store.set(name, value, options)) } catch {} } },
  })
}
