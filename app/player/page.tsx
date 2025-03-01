'use client'

import React, { useEffect, useState, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useQueue } from '../context/QueueContext';
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaPlay, FaPause, FaStepBackward, FaStepForward, FaRandom, FaRetweet, FaBars, FaTrash, FaHeart, FaRegHeart, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Song } from '../types/song';
import { useFavorites } from '../hooks/useFavorites';
import { useUser } from '@clerk/nextjs';

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
  const [volume, setVolume] = useState(1);
  const [previousVolume, setPreviousVolume] = useState(1);
  const { isLoaded, isSignedIn, user } = useUser();
  const queueRef = useRef<HTMLDivElement>(null);
  
  // Use the audio from MediaPlayer component if possible
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize volume from localStorage, default to 1 if not set
    const savedVolume = localStorage.getItem('musicPlayerVolume');
    setVolume(savedVolume ? parseFloat(savedVolume) : 1);
  }, [])

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

  useEffect(() => {
    // Sync volume with localStorage whenever it changes
    localStorage.setItem('musicPlayerVolume', volume.toString());
    
    // Also sync with audio element
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setPreviousVolume(newVolume);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (audioRef.current.muted) {
        // Unmute and restore previous volume
        audioRef.current.muted = false;
        const restoreVolume = previousVolume > 0 ? previousVolume : 1;
        setVolume(restoreVolume);
      } else {
        // Mute and save current volume
        audioRef.current.muted = true;
        setPreviousVolume(volume);
        setVolume(0);
      }
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // If no current song, return null to prevent rendering
  if (!currentSong) {
    // Return home
    router.push('/');
    return
    // return null;
  }

  if(!isLoaded) {
    return null
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black z-50 flex flex-col"
    >
      {/* Blurry Background */}
      {currentSong?.albumArt && (
        <div 
          className="absolute inset-0 bg-cover bg-center filter blur-2xl opacity-30" 
          style={{ 
            backgroundImage: `url(${currentSong.albumArt})`,
            transform: 'scale(1.1)'
          }}
        />
      )}

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
          {isSignedIn && <button 
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
          </button>}
          
          <button 
            onClick={() => setShowQueue(!showQueue)}
            className="text-white text-2xl"
          >
            <FaBars />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex flex-col z-20 overflow-y-auto
                      [&::-webkit-scrollbar]:w-2
                    [&::-webkit-scrollbar-track]:bg-gray-100
                    [&::-webkit-scrollbar-thumb]:bg-gray-300
                    dark:[&::-webkit-scrollbar-track]:bg-neutral-700
                    dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
        {/* Album Art */}
        <div className="flex items-center justify-center mt-20">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md aspect-square"
          >
            <img 
              src={currentSong.albumArt || '/placeholder-album.png'} 
              alt={currentSong.title}
              width={500}
              height={500}
              className="rounded-2xl shadow-xl shadow-black border-none"
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

        {/* Volume Control */}
        <div className="px-8 mb-4 lg:flex items-center space-x-4 hidden">
          <button 
            onClick={toggleMute}
            className="text-white"
          >
            {volume > 0 ? <FaVolumeUp size={24} /> : <FaVolumeMute size={24} />}
          </button>
          <div className="relative flex-grow h-1 bg-neutral-700 rounded-full">
            <div 
              className="absolute left-0 top-0 bottom-0 bg-white rounded-full" 
              style={{ 
                width: `${volume * 100}%` 
              }}
            />
            <input 
              type="range" 
              min={0} 
              max={1} 
              step={0.01} 
              value={volume} 
              onChange={handleVolumeChange} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
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
                    <img 
                      src={song.albumArt || '/placeholder-album.png'}
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
                  {/* <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromQueue(index);
                    }}
                    className="text-neutral-400 hover:text-white"
                  >
                    <FaTrash />
                  </button> */}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
