export function Skeleton() {
  const bar = (w: string, h = 14) => <div className="skeleton" style={{ height: h, width: w, background: 'var(--tint)', borderRadius: 6, margin: '10px 0 6px' }} />
  return (
    <div role="status" aria-label="Loading">
      {bar('180px', 28)}
      <div className="grid" style={{ marginTop: 16 }}>{[0, 1, 2, 3].map((i) => <div className="card" key={i}><div className="photo skeleton" />{bar('90%')}{bar('50%')}</div>)}</div>
    </div>
  )
}
