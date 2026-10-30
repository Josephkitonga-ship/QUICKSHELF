export type Section = { h: string; p: string[] }
// Plain reading layout for policy pages.
export function Policy({ title, intro, sections }: { title: string; intro: string; sections: Section[] }) {
  return (
    <article style={{ maxWidth: 720 }}>
      <h1>{title}</h1>
      <p style={{ margin: '8px 0' }}><span className="tag warn">Draft for legal review</span></p>
      <p className="mu" style={{ margin: '4px 0 16px' }}>{intro}</p>
      {sections.map((s, i) => (
        <section key={s.h} style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, marginBottom: 6 }}>{i + 1}. {s.h}</h2>
          {s.p.map((t) => <p key={t} style={{ margin: '0 0 8px' }}>{t}</p>)}
        </section>))}
    </article>
  )
}
