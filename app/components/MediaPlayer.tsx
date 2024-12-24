'use client'
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FaPlay, FaPause, FaStepBackward, FaStepForward, FaHeart, FaRegHeart } from 'react-icons/fa';
import { usePlayer } from '../context/PlayerContext';
import { useQueue } from '../context/QueueContext';
import { useFavorites } from '../hooks/useFavorites';
import { motion } from "framer-motion"

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
    togglePlayPause 
  } = usePlayer();
  const { 
    nextSong, 
    prevSong
  } = useQueue();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio && currentSong) {
      // Reset audio state
      audio.pause();
      audio.currentTime = 0;

      // Set the audio source
      audio.src = currentSong.url;
      audio.load();

      // Attempt to play if isPlaying is true
      if (isPlaying) {
        const playPromise = audio.play();

        playPromise
          .then(() => {
            // Successful play
          })
          .catch((error) => {
            console.error('Playback error:', error);
          });
      }
    }
  }, [currentSong, isPlaying]);

  const handleFavoriteToggle = () => {
    if (!currentSong) return;

    if (isFavorite(currentSong.id)) {
      removeFromFavorites(currentSong.id);
    } else {
      addToFavorites(currentSong);
    }
  };

  if (!currentSong) return null;

  return (
    <motion.div 
      initial={{ scale: 0 }} 
      animate={{ scale: 1 }} 
      className="fixed bottom-20 left-10 right-10 bg-black/80 backdrop-blur-md rounded-xl p-4 z-40"
      onClick={() => router.push('/player')}
    >
      <audio ref={audioRef} />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Image 
            src={currentSong.albumArt || '/placeholder-album.jpg'} 
            alt={currentSong.title} 
            width={48} 
            height={48} 
            className="rounded-md"
          />
          <div>
            <p className="text-sm font-semibold truncate max-w-[150px]">{currentSong.title}</p>
            <p className="text-xs text-neutral-400 truncate max-w-[150px]">{currentSong.artist}</p>
          </div>
          <button 
            onClick={handleFavoriteToggle}
            className="text-red-500 hover:text-red-400 transition-colors"
          >
            {isFavorite(currentSong.id) ? <FaHeart size={20} /> : <FaRegHeart size={20} />}
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              prevSong();
            }}
            className="text-neutral-400 hover:text-white"
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
            className="text-neutral-400 hover:text-white"
          >
            <FaStepForward size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
