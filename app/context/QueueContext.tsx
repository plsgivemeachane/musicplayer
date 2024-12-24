'use client'

import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { Song } from '../types/song';

// Define the queue context type
interface QueueContextType {
  queue: Song[];
  currentIndex: number;
  isLooping: boolean;
  isShuffling: boolean;
  addToQueue: (songs: Song[]) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  nextSong: () => Song | null;
  prevSong: () => Song | null;
  setLooping: (loop: boolean) => void;
  setShuffling: (shuffle: boolean) => void;
}

// Create the context
const QueueContext = createContext<QueueContextType | undefined>(undefined);

// Provider component
export function QueueProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);

  const addToQueue = useCallback((songs: Song[]) => {
    setQueue(prevQueue => {
      // Remove duplicates while preserving order
      const uniqueSongs = songs.filter(
        song => !prevQueue.some(qSong => qSong.id === song.id)
      );
      return [...prevQueue, ...uniqueSongs];
    });

    // If no song is currently playing, start with the first song
    if (currentIndex === -1 && songs.length > 0) {
      setCurrentIndex(0);
    }
  }, [currentIndex]);

  const removeFromQueue = useCallback((index: number) => {
    setQueue(prevQueue => prevQueue.filter((_, i) => i !== index));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setCurrentIndex(-1);
  }, []);

  const nextSong = useCallback(() => {
    if (queue.length === 0) return null;

    let nextIndex;
    if (isShuffling) {
      // Random song selection
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      // Linear progression
      nextIndex = (currentIndex + 1) % queue.length;
    }

    // Handle looping
    if (nextIndex >= queue.length) {
      if (isLooping) {
        nextIndex = 0;
      } else {
        return null;
      }
    }

    setCurrentIndex(nextIndex);
    return queue[nextIndex];
  }, [queue, currentIndex, isLooping, isShuffling]);

  const prevSong = useCallback(() => {
    if (queue.length === 0) return null;

    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = isLooping ? queue.length - 1 : 0;
    }

    setCurrentIndex(prevIndex);
    return queue[prevIndex];
  }, [queue, currentIndex, isLooping]);

  const setLooping = useCallback((loop: boolean) => {
    setIsLooping(loop);
  }, []);

  const setShuffling = useCallback((shuffle: boolean) => {
    setIsShuffling(shuffle);
  }, []);

  return (
    <QueueContext.Provider 
      value={{ 
        queue, 
        currentIndex,
        isLooping,
        isShuffling,
        addToQueue, 
        removeFromQueue, 
        clearQueue,
        nextSong,
        prevSong,
        setLooping,
        setShuffling
      }}
    >
      {children}
    </QueueContext.Provider>
  );
}

// Custom hook to use the queue context
export function useQueue() {
  const context = useContext(QueueContext);
  if (context === undefined) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return context;
}
