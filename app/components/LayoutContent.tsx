'use client'

import type { ReactNode } from 'react';
import localFont from 'next/font/local';
import { usePlayer } from "../context/PlayerContext";
import MediaPlayer from "./MediaPlayer";
import Navigation from "./Navigation";

const geistSans = localFont({
  src: '../../public/fonts/GeistVF.woff2',
  variable: '--font-geist-sans'
});

const geistMono = localFont({
  src: '../../public/fonts/GeistMonoVF.woff2',
  variable: '--font-geist-mono'
});

function LayoutContent({ children }: { children: ReactNode }) {
  const { currentSong } = usePlayer();

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} font-sans flex flex-col min-h-screen pb-32`}>
      <main className="flex-grow">
        {children}
      </main>

      {/* Conditionally render Media Player */}
      {currentSong && <MediaPlayer />}

      {/* Navigation */}
      <Navigation />
    </div>
  );
}

export default LayoutContent;
