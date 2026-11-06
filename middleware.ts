import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
// Keeps the login fresh and sends signed-out visitors from /dashboard and /owner to /login.
export async function middleware(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return NextResponse.next()
  let res = NextResponse.next({ request: req })
  const supabase = createServerClient(url, key, { cookies: {
    getAll: () => req.cookies.getAll(),
    setAll: (list) => { list.forEach(({ name, value }) => req.cookies.set(name, value)); res = NextResponse.next({ request: req }); list.forEach(({ name, value, options }) => res.cookies.set(name, value, options)) },
  } })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { const u = req.nextUrl.clone(); u.pathname = '/login'; u.search = ''; return NextResponse.redirect(u) }
  return res
}
export const config = { matcher: ['/dashboard/:path*', '/owner/:path*'] }
