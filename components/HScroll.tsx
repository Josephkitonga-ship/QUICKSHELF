import { Children, ReactNode } from 'react'
// A row of cards that scrolls sideways and snaps to each card. The scrollbar is hidden in all browsers.
// Two cards show on a phone (with a peek of the next), and three on a laptop to match the 3-column grid.
export function HScroll({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="region" aria-label={label} tabIndex={0} className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-2 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {Children.map(children, (c) => <div className="w-[46%] shrink-0 snap-start md:w-[31%] lg:w-[calc((100%-1.5rem)/3)]">{c}</div>)}
    </div>
  )
}
