import { redirect } from 'next/navigation'
import { supabaseServer } from './supabase/server'
export async function requireUser() {
  const sb = supabaseServer(); const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/login')
  return { sb, user }
}
export async function requireShop() {
  const { sb, user } = await requireUser()
  const { data: shop } = await sb.from('shops').select('*').eq('owner_id', user.id).maybeSingle()
  return { sb, user, shop }
}
export async function requireAdmin() {
  const { sb, user } = await requireUser()
  const { data } = await sb.from('profiles').select('is_admin').eq('user_id', user.id).maybeSingle()
  if (!data?.is_admin) redirect('/dashboard')
  return { sb, user }
}
