import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '../providers'
import '@rainbow-me/rainbowkit/styles.css'
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'The Hub',
  description: 'A Hackathon Project',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} gradient-bg`}>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  )
}
