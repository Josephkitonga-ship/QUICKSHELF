import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
const font = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'], display: 'swap' })
export const metadata: Metadata = { title: { default: 'QuickShelf | Shop approved businesses across Kenya', template: '%s | QuickShelf' }, description: 'Shop products from approved Kenyan businesses and order on WhatsApp.' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-KE"><body className={font.className}>
      <Providers><a href="#main" className="skip">Skip to content</a><Header /><main id="main" className="wrap main">{children}</main><Footer /></Providers>
    </body></html>
  )
}
