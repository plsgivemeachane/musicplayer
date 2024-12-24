'use client'

import React, { useEffect, useState, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useQueue } from '../context/QueueContext';
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaPlay, FaPause, FaStepBackward, FaStepForward, FaRandom, FaRetweet, FaBars, FaTrash, FaHeart, FaRegHeart } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Song } from '../types/song';
import { useFavorites } from '../hooks/useFavorites';

export default function FullScreenPlayer() {
  const router = useRouter();
  const { 
    currentSong, 
    isPlaying, 
    togglePlayPause, 
    playSong 
  } = usePlayer();
  const { 
    queue, 
    nextSong, 
    prevSong, 
    isLooping, 
    isShuffling, 
    setLooping, 
    setShuffling,
    removeFromQueue,
    addToQueue
  } = useQueue();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

  const [showQueue, setShowQueue] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const queueRef = useRef<HTMLDivElement>(null);
  
  // Use the audio from MediaPlayer component if possible
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Find the audio element from MediaPlayer if it exists
    const existingAudio = document.querySelector('audio') as HTMLAudioElement;
    
    if (existingAudio) {
      audioRef.current = existingAudio;
      
      // Set up event listeners
      const handleTimeUpdate = () => {
        setCurrentTime(existingAudio.currentTime);
        setDuration(existingAudio.duration);
      };

      existingAudio.addEventListener('timeupdate', handleTimeUpdate);
      
      // Cleanup
      return () => {
        existingAudio.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }
  }, [currentSong]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // If no current song, return null to prevent rendering
  if (!currentSong) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black z-50 flex flex-col"
    >
      {/* Blur Overlay when Queue is Open */}
      {showQueue && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
        />
      )}

      {/* Close and Queue Toggle Buttons */}
      <div className="absolute top-10 left-6 right-6 flex justify-between items-center z-40">
        <button 
          onClick={() => router.back()} 
          className="text-white text-2xl"
        >
          <FaChevronDown />
        </button>
        <div className="flex items-center space-x-4">
          {/* Favorite Button */}
          <button 
            onClick={() => {
              if (currentSong) {
                if (isFavorite(currentSong.id)) {
                  removeFromFavorites(currentSong.id);
                } else {
                  addToFavorites(currentSong);
                }
              }
            }}
            className="text-red-500 hover:text-red-400 transition-colors"
          >
            {currentSong && isFavorite(currentSong.id) ? (
              <FaHeart size={24} />
            ) : (
              <FaRegHeart size={24} />
            )}
          </button>
          
          <button 
            onClick={() => setShowQueue(!showQueue)}
            className="text-white text-2xl"
          >
            <FaBars />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex flex-col z-20 overflow-scroll">
        {/* Album Art */}
        <div className="flex items-center justify-center mt-20">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md aspect-square"
          >
            <Image 
              src={currentSong.albumArt || '/placeholder-album.jpg'} 
              alt={currentSong.title}
              layout="responsive"
              width={500}
              height={500}
              className="rounded-2xl shadow-2xl"
            />
          </motion.div>
        </div>

        {/* Song Info */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-white">{currentSong.title}</h1>
          <p className="text-neutral-400">{currentSong.artist}</p>
        </div>

        {/* Progress Bar */}
        <div className="px-8 mb-4">
          <div className="flex items-center space-x-4">
            <span className="text-neutral-400 text-sm w-12 text-right">
              {formatTime(currentTime)}
            </span>
            <div className="flex-grow bg-neutral-700 h-1 rounded-full relative">
              <div 
                className="absolute left-0 top-0 bottom-0 bg-white rounded-full" 
                style={{ 
                  width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` 
                }}
              />
            </div>
            <span className="text-neutral-400 text-sm w-12">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex justify-center items-center space-x-8 mb-24">
          <button 
            onClick={() => setShuffling(!isShuffling)}
            className={`text-${isShuffling ? 'white' : 'neutral-400'} hover:text-white`}
          >
            <FaRandom size={24} />
          </button>
          <button 
            onClick={() => {
              const prevTrack = prevSong();
              if (prevTrack) {
                playSong(prevTrack);
              }
            }}
            className="text-white"
          >
            <FaStepBackward size={32} />
          </button>
          <button 
            onClick={togglePlayPause}
            className="bg-white text-black p-4 rounded-full hover:bg-neutral-200"
          >
            {isPlaying ? <FaPause size={32} /> : <FaPlay size={32} />}
          </button>
          <button 
            onClick={() => {
              const nextTrack = nextSong();
              if (nextTrack) {
                playSong(nextTrack);
              }
            }}
            className="text-white"
          >
            <FaStepForward size={32} />
          </button>
          <button 
            onClick={() => setLooping(!isLooping)}
            className={`text-${isLooping ? 'white' : 'neutral-400'} hover:text-white`}
          >
            <FaRetweet size={24} />
          </button>
        </div>
      </div>

      {/* Queue Overlay */}
      <AnimatePresence>
        {showQueue && (
          <motion.div
            ref={queueRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween' }}
            className="fixed bottom-0 left-0 right-0 bg-neutral-900 rounded-t-2xl h-[70%] z-40 overflow-hidden"
          >
            <div className="flex justify-between items-center p-4 border-b border-neutral-800">
              <h2 className="text-xl font-bold text-white">Hàng đợi</h2>
            </div>
            <div className="overflow-y-auto h-[calc(100%-60px)] pb-16">
              {queue.map((song, index) => (
                <motion.div
                  key={song.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`flex items-center justify-between p-4 border-b border-neutral-800 ${
                    currentSong.id === song.id ? 'bg-neutral-800' : ''
                  }`}
                  onClick={() => {
                    addToQueue([song]);
                    playSong(song);
                    setShowQueue(false);
                  }}
                >
                  <div className="flex items-center space-x-4">
                    <Image 
                      src={song.albumArt || '/placeholder-album.jpg'}
                      alt={song.title}
                      width={48}
                      height={48}
                      className="rounded-md"
                    />
                    <div>
                      <p className="text-white font-semibold truncate max-w-[200px]">{song.title}</p>
                      <p className="text-neutral-400 text-sm">{song.artist}</p>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromQueue(index);
                    }}
                    className="text-neutral-400 hover:text-white"
                  >
                    <FaTrash />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
