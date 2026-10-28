'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
export type Slide = { tag?: string; title: string; text: string; href: string; cta: string }
// A small set of promotion slides. It moves on its own every 6 seconds, stops when someone hovers or focuses it,
// and never moves by itself for people who ask their device for reduced motion.
export function Deck({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0); const [paused, setPaused] = useState(false); const [still, setStill] = useState(false)
  useEffect(() => { setStill(window.matchMedia('(prefers-reduced-motion: reduce)').matches) }, [])
  useEffect(() => { if (paused || still || slides.length < 2) return; const t = setInterval(() => setI((x) => (x + 1) % slides.length), 6000); return () => clearInterval(t) }, [paused, still, slides.length])
  const go = (n: number) => setI((n + slides.length) % slides.length)
  return (
    <section className="deck" aria-roledescription="carousel" aria-label="Promotions" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className="deck-view">
        <div className="deck-track" style={{ transform: `translateX(-${i * 100}%)` }} aria-live={paused || still ? 'polite' : 'off'}>
          {slides.map((s, n) => (
            <div className="deck-slide" key={s.title} role="group" aria-roledescription="slide" aria-label={`${n + 1} of ${slides.length}`} aria-hidden={n !== i}>
              {s.tag && <span className="tag warn">{s.tag}</span>}<h2>{s.title}</h2><p className="mu">{s.text}</p>
              <Link className="btn" href={s.href} tabIndex={n === i ? 0 : -1}>{s.cta}</Link>
            </div>))}
        </div>
      </div>
      {slides.length > 1 && (
        <div className="deck-ctl">
          <button className="btn out" onClick={() => go(i - 1)} aria-label="Previous slide">‹</button>
          {slides.map((s, n) => <button key={s.title} className="dot" aria-label={`Go to slide ${n + 1}`} aria-current={n === i} onClick={() => setI(n)} />)}
          <button className="btn out" onClick={() => go(i + 1)} aria-label="Next slide">›</button>
        </div>)}
    </section>
  )
}
