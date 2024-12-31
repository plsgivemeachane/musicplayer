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
  nextSong: (changeIndex?: boolean) => Song | null;
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
  const [shuffledQueue, setShuffledQueue] = useState<Song[]>([]);
  const [shuffleIndex, setShuffleIndex] = useState(-1);

  // Fisher-Yates shuffle algorithm
  const shuffleArray = useCallback((array: Song[]) => {
    const shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
  }, []);

  const addToQueue = useCallback((songs: Song[]) => {
    // Clear the existing queue before adding new songs
    setQueue([]);
    setCurrentIndex(-1);
    setShuffledQueue([]);
    setShuffleIndex(-1);

    // Add unique songs
    const uniqueSongs = songs.filter(
      (song, index, self) => 
        self.findIndex(s => s.id === song.id) === index
    );

    setQueue(uniqueSongs);

    // If songs exist, start playing from the first song
    if (uniqueSongs.length > 0) {
      setCurrentIndex(0);
    }
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setQueue(prevQueue => prevQueue.filter((_, i) => i !== index));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setCurrentIndex(-1);
  }, []);

  const nextSong = useCallback((changeIndex: boolean = true) => {
    if (queue.length === 0) return null;

    let nextIndex = currentIndex;
    if (changeIndex) {
      if (isShuffling) {
        // Managed shuffle mode
        if (shuffledQueue.length === 0) {
          // First time shuffling, create shuffled queue
          const newShuffledQueue = shuffleArray(queue);
          setShuffledQueue(newShuffledQueue);
          setShuffleIndex(0);
          nextIndex = 0;
        } else {
          // Move to next index in shuffled queue
          let newShuffleIndex = shuffleIndex + 1;
          
          // Reset or loop if we've gone through all songs
          if (newShuffleIndex >= shuffledQueue.length) {
            if (isLooping) {
              newShuffleIndex = 0;
            } else {
              return null;
            }
          }
          
          setShuffleIndex(newShuffleIndex);
          nextIndex = queue.findIndex(song => 
            song.id === shuffledQueue[newShuffleIndex].id
          );
        }
      } else {
        // Linear progression
        nextIndex = (currentIndex + 1) % queue.length;
      }

      // Handle looping for non-shuffle mode
      if (!isShuffling && nextIndex >= queue.length) {
        if (isLooping) {
          nextIndex = 0;
        } else {
          return null;
        }
      }

      // Update current index only if changeIndex is true
      setCurrentIndex(nextIndex);
    }

    return isShuffling ? shuffledQueue[shuffleIndex] : queue[nextIndex];
  }, [queue, currentIndex, isLooping, isShuffling, shuffledQueue, shuffleIndex, shuffleArray]);

  const prevSong = useCallback(() => {
    if (queue.length === 0) return null;

    let prevIndex = currentIndex - 1;
    if (isShuffling) {
      // For shuffle mode, go back in the shuffled queue
      let newShuffleIndex = shuffleIndex - 1;
      
      if (newShuffleIndex < 0) {
        if (isLooping) {
          newShuffleIndex = shuffledQueue.length - 1;
        } else {
          return null;
        }
      }
      
      setShuffleIndex(newShuffleIndex);
      prevIndex = queue.findIndex(song => 
        song.id === shuffledQueue[newShuffleIndex].id
      );
    } else {
      // Regular previous song logic
      if (prevIndex < 0) {
        prevIndex = isLooping ? queue.length - 1 : 0;
      }
    }

    setCurrentIndex(prevIndex);
    return isShuffling ? shuffledQueue[shuffleIndex] : queue[prevIndex];
  }, [queue, currentIndex, isLooping, isShuffling, shuffledQueue, shuffleIndex]);

  const setLooping = useCallback((loop: boolean) => {
    setIsLooping(loop);
  }, []);

  const setShuffling = useCallback((shuffle: boolean) => {
    setIsShuffling(shuffle);
    
    // Reset shuffle state when toggling
    if (shuffle) {
      const newShuffledQueue = shuffleArray(queue);
      setShuffledQueue(newShuffledQueue);
      setShuffleIndex(0);
    } else {
      // Clear shuffled queue when turning off shuffle
      setShuffledQueue([]);
      setShuffleIndex(-1);
    }
  }, [queue, shuffleArray]);

  return (
    <QueueContext.Provider 
      value={{ 
        queue, 
        currentIndex,
        isLooping,
        isShuffling,
        addToQueue, 
        removeFromQueue, 
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
