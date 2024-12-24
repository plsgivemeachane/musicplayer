'use client'

import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { Song } from '../types/song';

interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  playSong: (song: Song) => void;
  togglePlayPause: () => void;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
}

// Create the context
const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playSong = useCallback((song: Song) => {
    // If the same song is clicked, toggle play/pause
    if (currentSong?.id === song.id) {
      setIsPlaying(prev => !prev);
      return;
    }

    // Set new song and start playing
    setCurrentSong(song);
    setIsPlaying(true);
  }, [currentSong]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  return (
    <PlayerContext.Provider 
      value={{ 
        currentSong, 
        isPlaying, 
        playSong, 
        togglePlayPause, 
        setIsPlaying 
      }}
    >
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
