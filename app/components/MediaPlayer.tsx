'use client'
import { openDB } from 'idb';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FaPlay, FaPause, FaStepBackward, FaStepForward, FaHeart, FaRegHeart } from 'react-icons/fa';
import { usePlayer } from '../context/PlayerContext';
import { useQueue } from '../context/QueueContext';
import { useFavorites } from '../hooks/useFavorites';
import { motion } from "framer-motion"
import { useUser } from '@clerk/nextjs';
import { pb } from '@/lib/pocketbase';

// IndexedDB storage management
const BLOB_STORE_NAME = 'songBlobStore';
const BLOB_DB_NAME = 'MusicPlayerBlobCache';
const BLOB_DB_VERSION = 1;
const BLOB_EXPIRATION_DURATION = 60 * 60 * 1000; // 1 hour

const initializeBlobDB = async () => {
  if (typeof window === 'undefined') return null;
  
  return await openDB(BLOB_DB_NAME, BLOB_DB_VERSION, {
    upgrade(db) {
      // Create an object store for song blobs
      if (!db.objectStoreNames.contains(BLOB_STORE_NAME)) {
        const store = db.createObjectStore(BLOB_STORE_NAME, { 
          keyPath: 'songId'
        });

        // Create indexes for efficient querying
        store.createIndex('expiresAt', 'expiresAt', { unique: false });
      }
    },
  });
};

const saveBlobToIndexedDB = async (songId: string, blob: Blob, expiresAt: number) => {
  if (typeof window === 'undefined') return;

  try {
    const db = await initializeBlobDB();
    if (!db) return;

    const tx = db.transaction(BLOB_STORE_NAME, 'readwrite');
    const store = tx.objectStore(BLOB_STORE_NAME);
    
    await store.put({
      songId,
      blob,
      expiresAt,
      createdAt: Date.now()
    });

    await tx.done;
    console.log(`[IndexedDB] Saved blob for song ${songId}`);
  } catch (error) {
    console.error('[IndexedDB] Error saving blob:', error);
  }
};

const getBlobFromIndexedDB = async (songId: string) => {
  if (typeof window === 'undefined') return null;

  try {
    const db = await initializeBlobDB();
    if (!db) return null;

    const tx = db.transaction(BLOB_STORE_NAME, 'readonly');
    const store = tx.objectStore(BLOB_STORE_NAME);
    
    const item = await store.get(songId);
    
    if (item && item.expiresAt > Date.now()) {
      console.log(`[IndexedDB] Retrieved blob for song ${songId}`);
      return item.blob;
    }
    
    // If expired or not found, return null
    return null;
  } catch (error) {
    console.error('[IndexedDB] Error retrieving blob:', error);
    return null;
  }
};

const cleanupExpiredBlobs = async () => {
  if (typeof window === 'undefined') return;

  try {
    const db = await initializeBlobDB();
    if (!db) return;

    const tx = db.transaction(BLOB_STORE_NAME, 'readwrite');
    const store = tx.objectStore(BLOB_STORE_NAME);
    
    const index = store.index('expiresAt');
    const expiredRange = IDBKeyRange.upperBound(Date.now());
    
    let cursor = await index.openCursor(expiredRange);
    
    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }

    await tx.done;
    console.log('[IndexedDB] Cleaned up expired blobs');
  } catch (error) {
    console.error('[IndexedDB] Error cleaning up blobs:', error);
  }
};

interface Song {
  id: string;
  title: string;
  artist: string;
  duration: number;
  url: string;
  albumArt?: string;
}

export default function MediaPlayer() {
  const { 
    currentSong, 
    isPlaying, 
    togglePlayPause,
    playSong
  } = usePlayer();
  const { 
    nextSong, 
    prevSong,
    queue
  } = useQueue();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);

  // Prevent duplicate processing
  const [processingUrls, setProcessingUrls] = useState<Set<string>>(new Set());

  // Fetch and cache song URL as blob
  const getSongBlobUrl = useCallback(async (song: Song, prefetchNext: boolean = true) => {
    // Prevent multiple processing for the same song
    if (processingUrls.has(song.id)) {
      console.log(`[getSongBlobUrl] Song ${song.title} is already being processed. Skipping.`);
      return song.url;
    }

    // Check if blob is stored in IndexedDB
    const storedBlob = await getBlobFromIndexedDB(song.id);
    if (storedBlob) {
      console.log(`[getSongBlobUrl] Retrieved blob from IndexedDB for song: ${song.title}`);
      const blobUrl = URL.createObjectURL(storedBlob);
      // Call getSongBlobUrl again with prefetchNext set to false to prefetch next song
      const nextTrack = nextSong(false)
      if(nextTrack && prefetchNext) getSongBlobUrl(nextTrack, false);
      return blobUrl;
    }

    // Immediately return the original URL
    const originalUrl = song.url;

    // Create a background promise for processing
    const processingPromise = new Promise<string>(async (resolve, reject) => {

      try {
        // Add song to processing set
        setProcessingUrls(prev => new Set(prev).add(song.id));
        
        console.log(`[getSongBlobUrl] Starting background process for song: ${song.title} (ID: ${song.id})`);
        
        const response = await fetch(song.url)
        
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        // Save blob to IndexedDB
        const expiresAt = Date.now() + BLOB_EXPIRATION_DURATION; // 1 hour
        await saveBlobToIndexedDB(song.id, blob, expiresAt);

        // Prefetch next song if requested
        if (prefetchNext) {
          // Call getSongBlobUrl again with prefetchNext set to false to prefetch next song
          const nextTrack = nextSong(false)
          if(nextTrack) getSongBlobUrl(nextTrack, false);
        }

        // Clean up processing state
        setProcessingUrls(prev => {
          const updated = new Set(prev);
          updated.delete(song.id);
          return updated;
        });
        resolve(blobUrl);
      } catch (error) {
        // Clean up processing state
        setProcessingUrls(prev => {
          const updated = new Set(prev);
          updated.delete(song.id);
          return updated;
        });
        // Log the error
        console.error('[getSongBlobUrl] Error in URL processing:', error);

        // If it's an abort error, return the original URL
        if (error instanceof DOMException && error.name === 'AbortError') {
          console.warn('[getSongBlobUrl] Fetch was aborted. Returning original URL.');
          resolve(song.url);
        } else {
          // For other errors, reject the promise
          reject(error);
        }
      }
    });

    // Start the processing promise in the background
    processingPromise.catch(error => {
      console.error('[getSongBlobUrl] Background processing error:', error);
    });

    // Immediately return the original URL
    return originalUrl;
  }, [processingUrls, nextSong]);

    // audio.play();
  // Attempt to play with auto-retry
  const MAX_RETRIES = 15;
  const RETRY_DELAY = 1000; // 1 second between retries

  const attemptPlay = async (audio: any, retryCount = 0) => {
    try {
      if (isPlaying) {
        await audio.play();
      }
    } catch (error) {
      console.error(`Playback error (Attempt ${retryCount + 1}):`, error);
      
      if (retryCount < MAX_RETRIES) {
        setTimeout(() => {
          attemptPlay(audio, retryCount + 1);
        }, RETRY_DELAY);
      } else {
        console.error('Max retries reached. Unable to play song.');
      }
    }
  };



  useEffect(() => {
    const audio = audioRef.current;
    if (audio && currentSong) {
      const setupAudio = async () => {
        try {
          // Get blob URL, and prefetch next song
          const blobUrl = await getSongBlobUrl(currentSong, true);
          
          // Set the audio source to blob URL
          audio.src = blobUrl;
          audio.load();

          audio.onended = () => {
            console.log("Ended")
            const nextTrack = nextSong();
            if (nextTrack) {
              playSong(nextTrack);
            }
          };

          attemptPlay(audio);
        } catch (error) {
          console.error('Failed to set up audio:', error);
        }
      };

      setupAudio();
    }
  }, [currentSong?.id, nextSong, playSong]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        attemptPlay(audio);
      } else {
        audio.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if ('mediaSession' in navigator && audio && currentSong) {
      // Update Media Session metadata
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title,
        artist: currentSong.artist,
        artwork: currentSong.albumArt 
          ? [{ src: currentSong.albumArt, sizes: '96x96', type: 'image/png' }]
          : [{ src: '/placeholder-album.png', sizes: '96x96', type: 'image/png' }]
      });

      // Add media session action handlers
      navigator.mediaSession.setActionHandler('play', () => {
        if (audio.paused) togglePlayPause();
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        if (!audio.paused) togglePlayPause();
      });

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        prevSong();
      });

      navigator.mediaSession.setActionHandler('nexttrack', () => {
        nextSong();
      });

      // Update playback state
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }, [currentSong, prevSong, nextSong]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      cleanupExpiredBlobs();
    }, 60 * 60 * 1000); // 1 hour
    
    
    
    // async function databaseWork() {
    //   console.log("DO SOME STUFF")
    //   const records = await pb.collection('playlists').getFullList({});

    //   console.log(records)
    // }

    // databaseWork()
    
    cleanupExpiredBlobs(); // Every page load
    return () => clearInterval(intervalId);
    
  }, []);

  const handleFavoriteToggle = () => {
    if (!currentSong) return;

    if (isFavorite(currentSong.id)) {
      removeFromFavorites(currentSong.id);
    } else {
      addToFavorites(currentSong);
    }
  };

  if (!currentSong) return null;
  if (!isLoaded) return null;

  return (
    <motion.div 
      initial={{ scale: 0 }} 
      animate={{ scale: 1 }} 
      className="fixed bottom-20 left-4 sm:left-12 right-4 sm:right-12 bg-black/80 backdrop-blur-md rounded-xl p-4 z-40"
      whileHover={{ scale: 1.05 }}
      onMouseEnter={() => router.prefetch('/player')}
      onClick={() => router.push('/player')}
    >
      <audio ref={audioRef} />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Image 
            src={currentSong.albumArt || '/placeholder-album.png'} 
            alt={"Loi anh"} 
            width={48} 
            height={48} 
            className="rounded-md"
          />
          <div>
            <p className="text-sm font-semibold truncate max-w-[150px]">{currentSong.title}</p>
            <p className="text-xs text-neutral-400 truncate max-w-[150px]">{currentSong.artist}</p>
          </div>
          {isSignedIn && <button 
            onClick={handleFavoriteToggle}
            className="text-red-500 hover:text-red-400 transition-colors"
          >
            {isFavorite(currentSong.id) ? <FaHeart size={20} /> : <FaRegHeart size={20} />}
          </button>}
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              prevSong();
            }}
            className="text-neutral-400 hover:text-white hidden sm:block"
          >
            <FaStepBackward size={20} />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              togglePlayPause();
            }}
            className="text-white"
          >
            {isPlaying ? <FaPause size={24} /> : <FaPlay size={24} />}
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              nextSong();
            }}
            className="text-neutral-400 hover:text-white  hidden sm:block"
          >
            <FaStepForward size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
