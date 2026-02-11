'use client'

import type { ReactNode } from 'react';
import { usePlayer } from '../context/PlayerContext';
import MediaPlayer from './MediaPlayer';
import Navigation from './Navigation';

function LayoutContent({ children }: { children: ReactNode }) {
	const { currentSong } = usePlayer();

	return (
		<div className="font-sans flex flex-col min-h-screen bg-carbon">
			<main className="flex-grow">
				{children}
			</main>
			<Navigation />
			{currentSong && <MediaPlayer />}
		</div>
	);
}

export default LayoutContent;
