import { redirect } from 'next/navigation'
// Old address. Everyone who supplies products now starts at /sell.
export default function Apply() { redirect('/sell') }
