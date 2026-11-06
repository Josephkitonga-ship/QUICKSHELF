'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase/browser'
// Live alert when a new order arrives while the dashboard is open: a banner, a short beep, a vibration and a notification.
export function OrderAlerts({ shopId }: { shopId: string }) {
  const router = useRouter(); const audio = useRef<AudioContext | null>(null)
  const [msg, setMsg] = useState(''); const [armed, setArmed] = useState(false)
  useEffect(() => {
    const sb = supabaseBrowser()
    const ch = sb.channel(`orders-${shopId}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders', filter: `shop_id=eq.${shopId}` }, (p) => {
      const o = p.new as { ref: string }
      setMsg(`New order ${o.ref}`); setTimeout(() => setMsg(''), 8000); router.refresh()
      try { navigator.vibrate?.(250) } catch {}
      try { const c = audio.current; if (c) { const osc = c.createOscillator(); osc.frequency.value = 880; osc.connect(c.destination); osc.start(); osc.stop(c.currentTime + 0.25) } } catch {}
      try { if (typeof Notification !== 'undefined' && Notification.permission === 'granted') new Notification('New order', { body: o.ref }) } catch {}
    }).subscribe()
    return () => { sb.removeChannel(ch) }
  }, [shopId, router])
  async function arm() { try { audio.current = new AudioContext(); await audio.current.resume(); if (typeof Notification !== 'undefined') await Notification.requestPermission() } catch {} setArmed(true) }
  return (
    <>
      {msg && <div role="status" className="panel" style={{ background: 'var(--warn-bg)', color: 'var(--warn)', fontWeight: 600 }}>{msg}</div>}
      {!armed && <button className="btn out" style={{ marginBottom: 12 }} onClick={arm}>Turn on order alerts</button>}
    </>
  )
}
