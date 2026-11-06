import { createClient } from '@supabase/supabase-js'
// Service-role client. Server only, used only to create a vendor's login when the owner approves an application.
// SUPABASE_SERVICE_ROLE_KEY must never be a NEXT_PUBLIC_ variable.
export const supabaseAdmin = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })
