import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
const font = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'], display: 'swap' })
export const metadata: Metadata = { title: { default: 'QuickShelf | Shop approved vendors across Kenya', template: '%s | QuickShelf' }, description: 'Shop products from approved Kenyan vendors and order on WhatsApp.' }
// Applies a saved theme before the page paints, so there is no flash.
const THEME = "try{var t=localStorage.getItem('qs.theme');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t}catch(e){}"
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-KE" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: THEME }} /></head>
      <body className={font.className}>
        <Providers>
          <a href="#main" className="skip">Skip to content</a>
          <Navbar />
          <main id="main" className="wrap main">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
