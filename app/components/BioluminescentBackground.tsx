'use client'

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface BioluminescentBackgroundProps {
	orbCount?: number;
	intensity?: 'low' | 'medium' | 'high';
}

export const BioluminescentBackground: React.FC<BioluminescentBackgroundProps> = ({ 
	orbCount = 3,
	intensity = 'medium'
}) => {
	const opacityMap = {
		low: 0.03,
		medium: 0.06,
		high: 0.1
	};

	const sizeMap = {
		low: { min: 200, max: 400 },
		medium: { min: 300, max: 500 },
		high: { min: 400, max: 600 }
	};

	const orbs = useMemo(() => {
		return Array.from({ length: orbCount }, (_, i) => ({
			id: i,
			size: Math.random() * (sizeMap[intensity].max - sizeMap[intensity].min) + sizeMap[intensity].min,
			x: Math.random() * 100,
			y: Math.random() * 100,
			duration: 15 + Math.random() * 10,
			delay: Math.random() * 5,
		}));
	}, [orbCount, intensity]);

	return (
		<div 
			className="fixed inset-0 pointer-events-none overflow-hidden z-0"
			aria-hidden="true"
		>
			{/* Gradient orbs */}
			{orbs.map((orb) => (
				<motion.div
					key={orb.id}
					className="absolute rounded-full"
					style={{
						width: orb.size,
						height: orb.size,
						left: `${orb.x}%`,
						top: `${orb.y}%`,
						background: `radial-gradient(circle, rgba(74, 222, 128, ${opacityMap[intensity]}) 0%, transparent 70%)`,
						filter: 'blur(40px)',
					}}
					animate={{
						x: [0, 30, -20, 0],
						y: [0, -20, 30, 0],
						scale: [1, 1.1, 0.95, 1],
						opacity: [0.6, 1, 0.8, 0.6],
					}}
					transition={{
						duration: orb.duration,
						delay: orb.delay,
						repeat: Infinity,
						ease: 'easeInOut',
					}}
				/>
			))}
			
			{/* Subtle vignette overlay */}
			<div 
				className="absolute inset-0"
				style={{
					background: 'radial-gradient(ellipse at center, transparent 0%, rgba(8, 8, 10, 0.4) 100%)',
				}}
			/>
		</div>
	);
};

export default BioluminescentBackground;
