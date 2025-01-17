'use client'
import { openDB } from 'idb';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FaPlay, FaPause, FaStepBackward, FaStepForward, FaHeart, FaRegHeart, FaVolumeUp, FaVolumeDown, FaVolumeMute, FaVolumeOff } from 'react-icons/fa';
import { usePlayer } from '../context/PlayerContext';
import { useQueue } from '../context/QueueContext';
import { useFavorites } from '../hooks/useFavorites';
import { motion } from "framer-motion"
import { useUser } from '@clerk/nextjs';
import { pb } from '@/lib/pocketbase';
import { songBlobProcessor } from '../utils/songBlobProcessor';
import { PiKeyReturnBold } from 'react-icons/pi';

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
    return songBlobProcessor.getSongBlobUrl(song, {
      processingUrls,
      setProcessingUrls,
      nextSong,
      prefetchNext
    });
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
      await audio.load();
      if (retryCount < MAX_RETRIES) {
        setTimeout(() => {
          attemptPlay(audio, retryCount + 1);
        }, RETRY_DELAY);
      } else {
        console.error('Max retries reached. Unable to play song.');
      }
    }
  };

  const [volume, setVolume] = useState(() => {
    // Initialize volume from localStorage, default to 1 if not set
    const savedVolume = localStorage.getItem('musicPlayerVolume');
    return savedVolume ? parseFloat(savedVolume) : 1;
  });

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    // Save volume to localStorage
    localStorage.setItem('musicPlayerVolume', newVolume.toString());
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      const newVolume = audioRef.current.muted ? 0 : 1;
      setVolume(newVolume);
      // Save volume to localStorage
      localStorage.setItem('musicPlayerVolume', newVolume.toString());
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.onpause = () => {
      if(!isPlaying) return;
      console.error('Error loading audio:', audio.error);
      attemptPlay(audio)
    };

  }, [audioRef, isPlaying])

  useEffect(() => {
    const audio = audioRef.current;
    if (audio && currentSong) {
      const setupAudio = async () => {
        console.log("Resetup audio")
        try {
          // Get blob URL, and prefetch next song
          const blobUrl = await getSongBlobUrl(currentSong, true);
          
          // Set the audio source to blob URL
          audio.src = blobUrl;
          // audio.load();

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
  }, [currentSong?.id, playSong]);

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
    if (audio) {
      audio.volume = volume;
    }
  }, [volume]);

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
  }, [currentSong, prevSong, nextSong, isPlaying]);

  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      // blobStorage.cleanupExpiredBlobs();
    }, 24 * 60 * 60 * 1000); // Daily cleanup

    return () => clearInterval(cleanupInterval);
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
      // whileHover={{ scale: 1.05 }}
      onMouseEnter={() => router.prefetch('/player')}
      onClick={() => router.push('/player')}
    >
      <audio ref={audioRef} />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img 
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
