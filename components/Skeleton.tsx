export function Skeleton() {
  const bar = (w: string, h = 14) => <div className="shimmer" style={{ height: h, width: w, borderRadius: 6, margin: '10px 0 6px' }} />
  return (
    <div role="status" aria-label="Loading">
      {bar('180px', 28)}
      <div className="grid" style={{ marginTop: 16 }}>{[0, 1, 2, 3].map((i) => <div className="card" key={i}><div className="shimmer" style={{ height: 120, borderRadius: 12 }} />{bar('90%')}{bar('50%')}</div>)}</div>
    </div>
  )
}
