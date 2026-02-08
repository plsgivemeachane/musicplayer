import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { PlayerProvider } from './context/PlayerContext';
import { QueueProvider } from './context/QueueContext';
import { ClerkProvider } from '@clerk/nextjs';
import LayoutContent from './components/LayoutContent';
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
});

const APP_NAME = "Looped";
const APP_DEFAULT_TITLE = "Looped App";
const APP_TITLE_TEMPLATE = "%s - App";
const APP_DESCRIPTION = "Looped App - Nghe nhạc không gián đoạn";

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
    statusBarStyle: "black-translucent",
    title: APP_DEFAULT_TITLE,
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
  themeColor: "#8b5cf6",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="vi" className="dark">
        <body className={`${inter.variable} font-sans antialiased`}>
          <PlayerProvider>
            <QueueProvider>
              <LayoutContent>{children}</LayoutContent>
            </QueueProvider>
          </PlayerProvider>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
