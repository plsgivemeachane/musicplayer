'use client'

import type { ReactNode } from 'react';
import { Roboto, Roboto_Mono } from "next/font/google";
import { usePlayer } from "../context/PlayerContext";
import MediaPlayer from "./MediaPlayer";
import Navigation from "./Navigation";

const roboto = Roboto({
  weight: ['400', '700'],
  style: ['normal'],
  subsets: ['latin'],
  variable: '--font-roboto'
});

const robotoMono = Roboto_Mono({
  weight: ['400', '700'],
  style: ['normal'],
  subsets: ['latin'],
  variable: '--font-roboto-mono'
});

function LayoutContent({ children }: { children: ReactNode }) {
  const { currentSong } = usePlayer();

  return (
    <div className={`${roboto.variable} ${robotoMono.variable} font-sans flex flex-col min-h-screen pb-32`}>
      <main className="flex-grow">
        {children}
      </main>
      <Navigation />
      {currentSong && <MediaPlayer />}
    </div>
  );
}

export default LayoutContent;
