import type { Metadata } from 'next'
import { Instrument_Serif, Outfit, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { PlayerProvider } from './context/PlayerContext'
import { QueueProvider } from './context/QueueContext'
import { ClerkProvider } from '@clerk/nextjs'
import LayoutContent from './components/LayoutContent'
import { Analytics } from "@vercel/analytics/react"
import type { Viewport } from "next";

// Instrument Serif - Editorial display font for headings
const instrumentSerif = Instrument_Serif({
	subsets: ['latin'],
	variable: '--font-instrument-serif',
	display: 'swap',
	weight: '400',
	style: ['normal', 'italic'],
})

// Outfit - Modern geometric sans-serif for body text
const outfit = Outfit({
	subsets: ['latin'],
	variable: '--font-outfit',
	display: 'swap',
	weight: ['300', '400', '500', '600', '700'],
})

// JetBrains Mono - Monospace for timestamps and metadata
const jetbrainsMono = JetBrains_Mono({
	subsets: ['latin'],
	variable: '--font-jetbrains-mono',
	display: 'swap',
	weight: ['400', '500'],
})

const APP_NAME = "Looped";
const APP_DEFAULT_TITLE = "Looped";
const APP_TITLE_TEMPLATE = "%s | Looped";
const APP_DESCRIPTION = "Your personal music streaming experience";

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
	themeColor: "#22C55E",
	width: "device-width",
	initialScale: 1,
	viewportFit: "cover",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<ClerkProvider>
			<html lang="vi" className={`${instrumentSerif.variable} ${outfit.variable} ${jetbrainsMono.variable}`}>
				<body className="bg-carbon text-snow antialiased">
					<PlayerProvider>
						<QueueProvider>
							<LayoutContent>{children}</LayoutContent>
						</QueueProvider>
					</PlayerProvider>
					<Analytics />
				</body>
			</html>
		</ClerkProvider>
	)
}
