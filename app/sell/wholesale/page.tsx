import type { Metadata } from 'next'
import Link from 'next/link'
import { ApplyForm } from '@/components/ApplyForm'
export const metadata: Metadata = { title: 'Apply as a Wholesale Merchant' }
export default function Page() { return <><p style={{ marginBottom: 12 }}><Link href="/sell">← Sell on QuickShelf</Link></p><ApplyForm kind="wholesale" /></> }
