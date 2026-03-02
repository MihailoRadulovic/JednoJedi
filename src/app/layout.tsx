import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'JednoJedi – Planiraj obroke, kontroliši troškove',
  description: 'Personalizovani nedeljni plan ishrane sa realnim cenama za srpsko tržište.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sr">
      <body className={`${geist.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
