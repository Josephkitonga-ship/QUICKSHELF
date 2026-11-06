'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
const back = (e?: string): never => redirect(e ? `/owner?e=${encodeURIComponent(e)}` : '/owner')
const id = (fd: FormData) => String(fd.get('id'))
// Approving creates the vendor's login (no email is sent; they sign in with a link from the login page), then the shop.
export async function approveApplication(fd: FormData) {
  const { sb } = await requireAdmin()
  const { data: app } = await sb.from('applications').select('email').eq('id', id(fd)).single()
  const email = String(app?.email ?? '').trim().toLowerCase(); if (!email) back('no_email')
  const admin = supabaseAdmin(); let userId: string | undefined
  const made = await admin.auth.admin.createUser({ email, email_confirm: true })
  if (made.data.user) userId = made.data.user.id
  else userId = (await admin.auth.admin.listUsers({ perPage: 1000 })).data.users.find((u) => u.email?.toLowerCase() === email)?.id
  if (!userId) back('no_user')
  const { error } = await sb.rpc('approve_application', { p_app: id(fd), p_owner: userId })
  revalidatePath('/owner'); if (error) back(error.message.split(':')[0])
}
export async function rejectApplication(fd: FormData) { const { sb } = await requireAdmin(); await sb.rpc('reject_application', { p_app: id(fd) }); revalidatePath('/owner') }
export async function reviewPayment(fd: FormData) { const { sb } = await requireAdmin(); await sb.rpc(fd.get('ok') === 'yes' ? 'confirm_subscription' : 'reject_subscription', { p_pay: id(fd) }); revalidatePath('/owner') }
export async function reviewAd(fd: FormData) { const { sb } = await requireAdmin(); await sb.rpc('review_ad', { p_ad: id(fd), p_ok: fd.get('ok') === 'yes' }); revalidatePath('/owner') }
export async function setStatus(fd: FormData) { const { sb } = await requireAdmin(); await sb.rpc('set_shop_status', { p_shop: id(fd), p_status: String(fd.get('status')) }); revalidatePath('/owner/shops') }
