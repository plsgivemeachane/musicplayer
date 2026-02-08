'use client'

import type { ReactNode } from 'react';
import { Roboto, Roboto_Mono } from "next/font/google";
import { usePlayer } from "../context/PlayerContext";
import { MediaPlayer } from "./MediaPlayer";
import { Navigation } from "./Navigation";

const roboto = Roboto({
  weight: ['400', '500', '700'],
  style: ['normal'],
  subsets: ['latin'],
  variable: '--font-roboto'
});

const robotoMono = Roboto_Mono({
  weight: ['400', '500', '700'],
  style: ['normal'],
  subsets: ['latin'],
  variable: '--font-roboto-mono'
});

function LayoutContent({ children }: { children: ReactNode }) {
  const { currentSong } = usePlayer();

  return (
    <div 
      className={`
        ${roboto.variable} ${robotoMono.variable} 
        font-sans flex flex-col min-h-screen 
        bg-surface-darkest
        bg-gradient-to-br from-surface-dark via-surface-darker to-surface-darkest
        relative overflow-x-hidden
      `}
    >
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Top Left Gradient Orb */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse" />
        {/* Bottom Right Gradient Orb */}
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        {/* Center Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-3xl" />
      </div>

      {/* Main Content */}
      <main className="flex-grow relative z-10 pb-32">
        {children}
      </main>

      {/* Navigation */}
      <Navigation />

      {/* Mini Player */}
      {currentSong && <MediaPlayer />}
    </div>
  );
}

export default LayoutContent;
