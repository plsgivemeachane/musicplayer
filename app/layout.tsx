import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { PlayerProvider } from './context/PlayerContext'
import { QueueProvider } from './context/QueueContext'
import { ClerkProvider } from '@clerk/nextjs'
import LayoutContent from './components/LayoutContent'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Music Player',
  description: 'A modern music streaming application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} bg-black text-white`}>
          <PlayerProvider>
            <QueueProvider>
              <LayoutContent>{children}</LayoutContent>
            </QueueProvider>
          </PlayerProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
