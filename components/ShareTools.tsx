'use client'
import qrcode from 'qrcode-generator'
import { useEffect, useMemo, useState } from 'react'
// Copy link and a QR code for a page, so a vendor can share it online or print it for the shop window.
export function ShareTools({ path, name }: { path: string; name: string }) {
  const [url, setUrl] = useState(''); const [copied, setCopied] = useState(false); const [show, setShow] = useState(false)
  useEffect(() => setUrl(window.location.origin + path), [path])
  const svg = useMemo(() => { if (!url) return ''; const q = qrcode(0, 'M'); q.addData(url); q.make(); return q.createSvgTag(6, 2) }, [url])
  async function copy() {
    try { await navigator.clipboard.writeText(url) } catch { const t = document.createElement('textarea'); t.value = url; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove() }
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }
  function download() { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' })); a.download = `${name}-qr.svg`; a.click(); URL.revokeObjectURL(a.href) }
  return (
    <div className="panel" style={{ marginBottom: 16 }}>
      <div className="filters" style={{ marginBottom: 0 }}>
        <button className="btn out" onClick={copy}>{copied ? 'Link copied' : 'Copy link'}</button>
        <button className="btn out" onClick={() => setShow((s) => !s)} aria-expanded={show}>{show ? 'Hide QR code' : 'QR code'}</button>
      </div>
      <span className="sr" role="status">{copied ? 'Link copied' : ''}</span>
      {show && svg && (
        <div style={{ marginTop: 12 }}>
          <div className="[&>svg]:h-44 [&>svg]:w-44 [&>svg]:rounded-lg [&>svg]:bg-white" dangerouslySetInnerHTML={{ __html: svg }} />
          <button className="btn out" style={{ marginTop: 8 }} onClick={download}>Download QR</button>
        </div>)}
    </div>
  )
}
