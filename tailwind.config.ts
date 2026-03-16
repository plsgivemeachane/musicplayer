import type { Config } from 'tailwindcss';

export default {
	content: [
		'./pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./components/**/*.{js,ts,jsx,tsx,mdx}',
		'./app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			colors: {
				// Deep forest background layers
				abyss: '#020806',
				forest: '#051a0f',
				jungle: '#0d2818',
				moss: '#1a3d2a',
				fern: '#2a5240',
				
				// Surface layers with green tint
				surface: {
					DEFAULT: '#0a1f14',
					elevated: '#0f2a1c',
					overlay: '#142f22',
					modal: '#183828',
				},
				
				// Text hierarchy
				text: {
					primary: '#e8f5e9',
					secondary: '#a5d6a7',
					muted: '#66bb6a',
					subtle: '#4caf50',
				},
				
				// Vibrant green accent system
				accent: {
					bright: '#00ff88',
					main: '#00e676',
					dim: '#00c853',
					glow: '#69f0ae',
					neon: '#b9f6ca',
				},
				
				// Secondary accent - warm amber
				warm: {
					bright: '#ffab00',
					main: '#ff8f00',
					dim: '#ff6f00',
				},
				
				// Card/background variants
				card: {
					dark: '#061510',
					base: '#0c2419',
					light: '#123320',
				},
				
				// Border colors
				border: {
					dim: '#1a4030',
					main: '#2a6045',
					bright: '#3d8060',
					glow: '#00ff88',
				},
			},
			fontFamily: {
				serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
				sans: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
				mono: ['var(--font-fira-code)', 'Consolas', 'monospace'],
				display: ['var(--font-bebas)', 'Impact', 'sans-serif'],
			},
			backgroundImage: {
				// Radial gradients for depth
				'radial-forest': 'radial-gradient(ellipse at 50% 0%, #1a3d2a 0%, #0d2818 50%, #051a0f 100%)',
				'radial-glow': 'radial-gradient(circle at 50% 50%, rgba(0, 255, 136, 0.15) 0%, transparent 60%)',
				'radial-card': 'radial-gradient(ellipse at 50% 0%, #1a4030 0%, #0f2a1c 100%)',
				
				// Linear gradients
				'gradient-accent': 'linear-gradient(135deg, #00ff88 0%, #00e676 50%, #00c853 100%)',
				'gradient-accent-vertical': 'linear-gradient(180deg, #00ff88 0%, #00c853 100%)',
				'gradient-warm': 'linear-gradient(135deg, #ffab00 0%, #ff6f00 100%)',
				'gradient-shine': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
				
				// Mesh gradients
				'mesh-bg': `
					radial-gradient(at 20% 80%, rgba(0, 255, 136, 0.12) 0px, transparent 50%),
					radial-gradient(at 80% 20%, rgba(0, 230, 118, 0.08) 0px, transparent 50%),
					radial-gradient(at 50% 50%, rgba(0, 200, 83, 0.05) 0px, transparent 70%),
					radial-gradient(at 100% 100%, rgba(105, 240, 174, 0.06) 0px, transparent 50%)
				`,
				
				// Noise overlay pattern
				'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
			},
			boxShadow: {
				// Glow shadows
				'glow-xs': '0 0 10px rgba(0, 255, 136, 0.3)',
				'glow-sm': '0 0 20px rgba(0, 255, 136, 0.4)',
				'glow-md': '0 0 30px rgba(0, 255, 136, 0.5)',
				'glow-lg': '0 0 50px rgba(0, 255, 136, 0.6)',
				'glow-xl': '0 0 80px rgba(0, 255, 136, 0.7)',
				
				// Inner glows
				'glow-inner': 'inset 0 0 30px rgba(0, 255, 136, 0.1)',
				'glow-inner-bright': 'inset 0 0 50px rgba(0, 255, 136, 0.2)',
				
				// Card shadows
				'card': '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(0, 255, 136, 0.1)',
				'card-hover': '0 12px 48px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(0, 255, 136, 0.2)',
				'card-elevated': '0 16px 64px rgba(0, 0, 0, 0.6), 0 0 40px rgba(0, 255, 136, 0.15)',
				
				// Text shadows
				'text-glow': '0 0 20px rgba(0, 255, 136, 0.5)',
				'text-glow-strong': '0 0 30px rgba(0, 255, 136, 0.8)',
				
				// Ambient shadows
				'ambient': '0 0 100px rgba(0, 255, 136, 0.1)',
				'ambient-bright': '0 0 150px rgba(0, 255, 136, 0.15)',
			},
			animation: {
				// Pulse animations
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
				'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
				
				// Float animations
				'float': 'float 6s ease-in-out infinite',
				'float-slow': 'float 10s ease-in-out infinite',
				
				// Glow animations
				'glow-pulse': 'glow-pulse 1.5s ease-in-out infinite',
				'glow-breathe': 'glow-breathe 4s ease-in-out infinite',
				
				// Shimmer
				'shimmer': 'shimmer 2s linear infinite',
				'shimmer-slow': 'shimmer 3s linear infinite',
				
				// Ripple
				'ripple': 'ripple 1s ease-out',
				
				// Slide
				'slide-up': 'slide-up 0.3s ease-out',
				'slide-down': 'slide-down 0.3s ease-out',
				
				// Rotate
				'spin-slow': 'spin 8s linear infinite',
				'spin-slower': 'spin 15s linear infinite',
				
				// Bounce
				'bounce-soft': 'bounce-soft 2s ease-in-out infinite',
				
				// Wave
				'wave': 'wave 1.5s ease-in-out infinite',
				
				// Equalizer bars
				'equalizer': 'equalizer 0.8s ease-in-out infinite',
				
				// Marquee
				'marquee': 'marquee 15s linear infinite',
			},
			keyframes: {
				'pulse-glow': {
					'0%, 100%': { 
						boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)',
						opacity: '1',
					},
					'50%': { 
						boxShadow: '0 0 40px rgba(0, 255, 136, 0.6)',
						opacity: '0.9',
					},
				},
				'pulse-soft': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.7' },
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-15px)' },
				},
				'glow-pulse': {
					'0%, 100%': { 
						filter: 'drop-shadow(0 0 5px rgba(0, 255, 136, 0.5))',
					},
					'50%': { 
						filter: 'drop-shadow(0 0 20px rgba(0, 255, 136, 0.9))',
					},
				},
				'glow-breathe': {
					'0%, 100%': { opacity: '0.5' },
					'50%': { opacity: '1' },
				},
				'shimmer': {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' },
				},
				'ripple': {
					'0%': { transform: 'scale(0)', opacity: '1' },
					'100%': { transform: 'scale(4)', opacity: '0' },
				},
				'slide-up': {
					'0%': { transform: 'translateY(20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
				'slide-down': {
					'0%': { transform: 'translateY(-20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
				'bounce-soft': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' },
				},
				'wave': {
					'0%, 100%': { transform: 'scaleY(1)' },
					'50%': { transform: 'scaleY(0.5)' },
				},
				'equalizer': {
					'0%, 100%': { height: '10%' },
					'50%': { height: '100%' },
				},
				'marquee': {
					'0%': { transform: 'translateX(0%)' },
					'100%': { transform: 'translateX(-100%)' },
				},
			},
			transitionDuration: {
				'150': '150ms',
				'250': '250ms',
				'350': '350ms',
				'500': '500ms',
			},
			transitionTimingFunction: {
				'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'smooth-out': 'cubic-bezier(0.22, 1, 0.36, 1)',
			},
			backdropBlur: {
				xs: '2px',
			},
		},
	},
	plugins: [],
} satisfies Config;
