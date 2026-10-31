'use client'
import { areasOf, counties } from '@/lib/kenya'
export type Loc = { county: string; area: string; custom: string }
export const locText = (l: Loc) => (l.area === '__other' ? l.custom.trim() : l.area)
// County first, then the sub-county or commercial hub for that county. "Other" lets people type a place that is not listed.
export function LocationPicker({ value, onChange }: { value: Loc; onChange: (l: Loc) => void }) {
  const areas = value.county ? areasOf(value.county) : []
  return (
    <>
      <label>County
        <select value={value.county} required onChange={(e) => onChange({ county: e.target.value, area: '', custom: '' })}>
          <option value="">Select county</option>{counties.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
      <label>Sub-County / Commercial Hub
        <select value={value.area} required disabled={!value.county} onChange={(e) => onChange({ ...value, area: e.target.value })}>
          <option value="">{value.county ? 'Select area' : 'Select a county first'}</option>
          {areas.map((a) => <option key={a} value={a}>{a}</option>)}<option value="__other">Other (type it in)</option>
        </select>
      </label>
      {value.area === '__other' && <label>Your area<input required value={value.custom} onChange={(e) => onChange({ ...value, custom: e.target.value })} /></label>}
    </>
  )
}
