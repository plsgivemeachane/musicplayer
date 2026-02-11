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
				// Background Layer
				void: '#08080A',
				carbon: '#0D0D0F',
				concrete: '#16161A',
				slate: '#1E1E24',
				
				// Text Layer
				snow: '#FAFAFA',
				silver: '#A1A1AA',
				ash: '#71717A',
				charcoal: '#3F3F46',
				
				// Green Accent System
				mint: '#4ADE80',
				emerald: '#22C55E',
				forest: '#16A34A',
				moss: '#15803D',
				pine: '#14532D',
				
				// Gray Accent System
				steel: '#64748B',
				zinc: '#475569',
				iron: '#334155',
			},
			fontFamily: {
				serif: ['var(--font-instrument-serif)', 'Georgia', 'serif'],
				sans: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
				mono: ['var(--font-jetbrains-mono)', 'Consolas', 'monospace'],
			},
			backgroundImage: {
				'gradient-glow': 'linear-gradient(135deg, #4ADE80 0%, #22C55E 50%, #16A34A 100%)',
				'gradient-depth': 'linear-gradient(180deg, #08080A 0%, #0D0D0F 50%, #16161A 100%)',
				'gradient-card': 'linear-gradient(145deg, #1E1E24 0%, #16161A 100%)',
				'gradient-text': 'linear-gradient(90deg, #4ADE80 0%, #22C55E 100%)',
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
			},
			boxShadow: {
				'glow-sm': '0 0 8px rgba(74, 222, 128, 0.3)',
				'glow-md': '0 0 16px rgba(74, 222, 128, 0.4)',
				'glow-lg': '0 0 24px rgba(74, 222, 128, 0.5)',
				'glow-ring': '0 0 0 3px rgba(74, 222, 128, 0.3)',
				'lift': '0 4px 12px rgba(0, 0, 0, 0.4)',
				'lift-lg': '0 8px 24px rgba(0, 0, 0, 0.5)',
			},
			animation: {
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
				'float': 'float 6s ease-in-out infinite',
				'shimmer': 'shimmer 2s linear infinite',
				'marquee': 'marquee 10s linear infinite',
			},
			keyframes: {
				'pulse-glow': {
					'0%, 100%': { 
						boxShadow: '0 0 8px rgba(74, 222, 128, 0.3)',
						opacity: '1',
					},
					'50%': { 
						boxShadow: '0 0 16px rgba(74, 222, 128, 0.5)',
						opacity: '0.9',
					},
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' },
				},
				'shimmer': {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' },
				},
				'marquee': {
					'0%': { transform: 'translateX(0%)' },
					'100%': { transform: 'translateX(-100%)' },
				},
			},
			transitionDuration: {
				'250': '250ms',
			},
		},
	},
	plugins: [],
} satisfies Config;
