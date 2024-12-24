import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { PlayerProvider } from './context/PlayerContext'
import { QueueProvider } from './context/QueueContext'
import { ClerkProvider } from '@clerk/nextjs'
import LayoutContent from './components/LayoutContent'

const inter = Inter({ subsets: ['latin'] })
import type { Viewport } from "next";

const APP_NAME = "QMusic";
const APP_DEFAULT_TITLE = "Quanvn Music App";
const APP_TITLE_TEMPLATE = "%s - App";
const APP_DESCRIPTION = "Quanvn Music App";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#00FFFF",
};export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="vi">
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
