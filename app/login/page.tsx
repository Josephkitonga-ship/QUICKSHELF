'use client'
import { FormEvent, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase/browser'
const ON = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)
// Passwordless login: we email a sign-in link. Only approved vendors have an account.
export default function Login() {
  const [email, setEmail] = useState(''); const [state, setState] = useState<'idle' | 'busy' | 'sent'>('idle')
  async function submit(e: FormEvent) {
    e.preventDefault(); setState('busy')
    await supabaseBrowser().auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: `${window.location.origin}/auth/callback`, shouldCreateUser: false } })
    setState('sent') // Same message whether or not the email is registered.
  }
  if (!ON) return <><h1>Vendor Login</h1><p style={{ marginTop: 12 }}>Login opens once the backend is connected.</p></>
  if (state === 'sent') return <><h1>Check your email</h1><p style={{ marginTop: 12 }}>If {email} belongs to an approved vendor, we sent a sign-in link. It works once.</p></>
  return (
    <form className="form" onSubmit={submit}>
      <h1>Vendor Login</h1>
      <label>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
      <button className="btn" type="submit" disabled={state === 'busy'}>{state === 'busy' ? 'Sending…' : 'Send sign-in link'}</button>
      <p className="mu">Not a vendor yet? Apply at Sell on QuickShelf.</p>
    </form>
  )
}
