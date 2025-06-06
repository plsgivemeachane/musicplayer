import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';

const withPWA = require('@ducanh2912/next-pwa').default({
	dest: 'public',
});

const nextConfig: NextConfig = withPWA({
	dest: 'public',
	register: true,
	skipWaiting: true,
	reactStrictMode: false,
	/* config options here */
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '**',
			},
		],
	},
	experimental: {
		missingSuspenseWithCSRBailout: false,
	},
	webpack: (config: any, { isServer }: any) => {
		if (!isServer) {
			config.resolve.fallback = {
				...config.resolve.fallback,
				fs: false,
				net: false,
				tls: false,
			};
		}
		return config;
	},
	async rewrites() {
		return [
			{
				source: '/blob-processor-sw.js',
				destination: '/blob-processor-sw.js',
			},
		];
	},
});

export default withSentryConfig(nextConfig, {
	// For all available options, see:
	// https://github.com/getsentry/sentry-webpack-plugin#options

	org: 'quanvndzai-8d19b92c7',
	project: 'looped',

	// Only print logs for uploading source maps in CI
	silent: !process.env.CI,

	// For all available options, see:
	// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

	// Upload a larger set of source maps for prettier stack traces (increases build time)
	widenClientFileUpload: true,

	// Automatically annotate React components to show their full name in breadcrumbs and session replay
	reactComponentAnnotation: {
		enabled: true,
	},

	// Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
	// This can increase your server load as well as your hosting bill.
	// Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
	// side errors will fail.
	tunnelRoute: '/monitoring',

	// Hides source maps from generated client bundles
	hideSourceMaps: true,

	// Automatically tree-shake Sentry logger statements to reduce bundle size
	disableLogger: true,

	// Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
	// See the following for more information:
	// https://docs.sentry.io/product/crons/
	// https://vercel.com/docs/cron-jobs
	automaticVercelMonitors: true,
});
