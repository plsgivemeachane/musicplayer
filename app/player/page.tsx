'use client'

import React, { useEffect, useState, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useQueue } from '../context/QueueContext';
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, Play, Pause, SkipBack, SkipForward, 
  Shuffle, Repeat, Heart, Volume2, VolumeX, 
  ListMusic
} from 'lucide-react';
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
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const savedVolume = localStorage.getItem('musicPlayerVolume');
    setVolume(savedVolume ? parseFloat(savedVolume) : 1);
  }, [])

  useEffect(() => {
    const existingAudio = document.querySelector('audio') as HTMLAudioElement;
    
    if (existingAudio) {
      audioRef.current = existingAudio;
      
      const handleTimeUpdate = () => {
        setCurrentTime(existingAudio.currentTime);
        setDuration(existingAudio.duration);
      };

      const handleLoadedMetadata = () => {
        setDuration(existingAudio.duration);
      };

      existingAudio.addEventListener('timeupdate', handleTimeUpdate);
      existingAudio.addEventListener('loadedmetadata', handleLoadedMetadata);

      return () => {
        existingAudio.removeEventListener('timeupdate', handleTimeUpdate);
        existingAudio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [currentSong]);

  useEffect(() => {
    localStorage.setItem('musicPlayerVolume', volume.toString());
    
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
        audioRef.current.muted = false;
        const restoreVolume = previousVolume > 0 ? previousVolume : 1;
        setVolume(restoreVolume);
      } else {
        audioRef.current.muted = true;
        setPreviousVolume(volume);
        setVolume(0);
      }
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percent * duration;
  };

  if (!currentSong) {
    router.push('/');
    return null;
  }

  if(!isLoaded) {
    return (
      <div className="fixed inset-0 bg-gray-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full"
        />
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gray-950 z-50 flex flex-col overflow-hidden"
    >
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${currentSong.albumArt || '/placeholder-album.png'})`,
            filter: 'blur(80px) brightness(0.4)',
            transform: 'scale(1.2)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/30 via-gray-900/50 to-gray-950" />
        
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-accent-500/20"
        />
      </div>

      <AnimatePresence>
        {showQueue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xl z-30"
            onClick={() => setShowQueue(false)}
          />
        )}
      </AnimatePresence>

      <div className="relative z-40 flex items-center justify-between px-6 py-6">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.back()} 
          className="icon-btn"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.button>

        <div className="text-sm font-medium text-gray-400 uppercase tracking-wider">
          Đang phát
        </div>

        <div className="flex items-center gap-3">
          {isSignedIn && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (currentSong) {
                  if (isFavorite(currentSong.id)) {
                    removeFromFavorites(currentSong.id);
                  } else {
                    addToFavorites(currentSong);
                  }
                }
              }}
              className={`icon-btn ${isFavorite(currentSong?.id ?? '') ? 'text-rose-500' : ''}`}
            >
              {currentSong && isFavorite(currentSong.id) ? (
                <Heart className="w-5 h-5 fill-current" />
              ) : (
                <Heart className="w-5 h-5" />
              )}
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowQueue(!showQueue)}
            className={`icon-btn ${showQueue ? 'active' : ''}`}
          >
            <ListMusic className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      <div className="relative z-20 flex-grow flex flex-col items-center px-6 overflow-y-auto no-scrollbar">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="mt-4 md:mt-8"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{ 
                duration: isPlaying ? 20 : 0.5, 
                repeat: isPlaying ? Infinity : 0,
                ease: "linear"
              }}
              className="w-[280px] h-[280px] md:w-[340px] md:h-[340px] rounded-2xl overflow-hidden shadow-2xl"
              style={{ boxShadow: '0 0 30px rgba(16, 185, 129, 0.3)' }}
            >
              <img 
                src={currentSong.albumArt || '/placeholder-album.png'} 
                alt={currentSong.title}
                width={340}
                height={340}
                className="w-full h-full object-cover"
              />
            </motion.div>
            
            {isPlaying && (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full text-xs font-medium text-white"
                style={{ boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)' }}
              >
                ♪ Now Playing
              </motion.div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-center max-w-md"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-white truncate">
            {currentSong.title}
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            {currentSong.artist}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-md mt-8"
        >
          <div 
            className="relative h-2 bg-gray-700/50 rounded-full cursor-pointer overflow-hidden group"
            onClick={handleSeek}
          >
            <motion.div 
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
            
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{ left: `calc(${duration > 0 ? (currentTime / duration) * 100 : 0}% - 8px)` }}
            />
          </div>

          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-6 md:gap-8 mt-8 mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShuffling(!isShuffling)}
            className={`icon-btn w-10 h-10 ${isShuffling ? 'active' : ''}`}
          >
            <Shuffle className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const prevTrack = prevSong();
              if (prevTrack) {
                playSong(prevTrack);
              }
            }}
            className="icon-btn w-12 h-12"
          >
            <SkipBack className="w-6 h-6" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={togglePlayPause}
            className="w-16 h-16 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center"
            style={{ boxShadow: '0 0 30px rgba(16, 185, 129, 0.4)' }}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 text-white" />
            ) : (
              <Play className="w-7 h-7 text-white ml-1" />
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const nextTrack = nextSong();
              if (nextTrack) {
                playSong(nextTrack);
              }
            }}
            className="icon-btn w-12 h-12"
          >
            <SkipForward className="w-6 h-6" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setLooping(!isLooping)}
            className={`icon-btn w-10 h-10 ${isLooping ? 'active' : ''}`}
          >
            <Repeat className="w-5 h-5" />
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-4 mb-8"
        >
          <button 
            onClick={toggleMute}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          
          <div className="w-32 h-1.5 bg-gray-700/50 rounded-full overflow-hidden cursor-pointer group">
            <div 
              className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-100"
              style={{ width: `${volume * 100}%` }}
            />
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={volume} 
              onChange={handleVolumeChange} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showQueue && (
          <motion.div
            ref={queueRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl rounded-t-3xl h-[60%] md:h-[50%] z-40 flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-t border-white/5">
              <h2 className="text-xl font-bold text-white">Hàng đợi</h2>
              <span className="text-sm text-gray-400">{queue.length} bài hát</span>
            </div>

            <div className="flex-grow overflow-y-auto p-4 space-y-2">
              {queue.map((song, index) => (
                <motion.div
                  key={song.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`
                    flex items-center gap-4 p-3 rounded-xl cursor-pointer
                    transition-all duration-200
                    ${currentSong.id === song.id 
                      ? 'bg-primary-500/20 border border-primary-500/30' 
                      : 'hover:bg-gray-800/50'
                    }
                  `}
                  onClick={() => {
                    addToQueue([song], index);
                    playSong(song);
                    setShowQueue(false);
                  }}
                >
                  <img 
                    src={song.albumArt || '/placeholder-album.png'}
                    alt={song.title}
                    className={`w-12 h-12 rounded-lg object-cover ${currentSong.id === song.id ? 'ring-2 ring-primary-500' : ''}`}
                  />
                  
                  <div className="flex-grow min-w-0">
                    <p className={`font-medium truncate ${currentSong.id === song.id ? 'text-primary-400' : 'text-white'}`}>
                      {song.title}
                    </p>
                    <p className="text-sm text-gray-400 truncate">{song.artist}</p>
                  </div>

                  {currentSong.id === song.id && (
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="flex gap-0.5 items-end h-4"
                    >
                      {[0.4, 0.7, 0.5, 0.9, 0.6].map((h, i) => (
                        <motion.div
                          key={i}
                          className="w-1 bg-primary-500 rounded-full"
                          animate={{ height: [4, h * 10 + 4, 4] }}
                          transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.08 }}
                        />
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
