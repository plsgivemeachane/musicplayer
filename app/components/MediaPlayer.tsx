'use client'

import { usePlayer } from '../context/PlayerContext';
import { useQueue } from '../context/QueueContext';
import { motion } from 'framer-motion';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, 
  Repeat, Shuffle, ListMusic, Heart, VolumeX
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useFavorites } from '../hooks/useFavorites';

export function MediaPlayer() {
  const { 
    currentSong, 
    isPlaying, 
    togglePlayPause,
    playSong 
  } = usePlayer();
  const { 
    nextSong, 
    prevSong, 
    isLooping, 
    isShufflings, 
    setLooping, 
    setShuffling,
    queue 
  } = useQueue();
  const router = useRouter();
  const { isSignedIn } = useUser();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const [volume, setVolume] = useState(1);
  const [previousVolume, setPreviousVolume] = useState(1);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const existingAudio = document.querySelector('audio') as HTMLAudioElement;
      if (existingAudio) {
        setAudioElement(existingAudio);
        audioRef.current = existingAudio;
      }
    }
  }, [currentSong]);

  useEffect(() => {
    if (audioElement) {
      audioElement.volume = volume;
    }
  }, [volume, audioElement]);

  useEffect(() => {
    if (audioElement) {
      if (isPlaying) {
        audioElement.play().catch(console.error);
      } else {
        audioElement.pause();
      }
    }
  }, [isPlaying, audioElement]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setPreviousVolume(newVolume);
    localStorage.setItem('musicPlayerVolume', newVolume.toString());
  };

  const toggleMute = () => {
    if (audioElement) {
      if (audioElement.muted) {
        audioElement.muted = false;
        setVolume(previousVolume > 0 ? previousVolume : 1);
      } else {
        audioElement.muted = true;
        setPreviousVolume(volume);
        setVolume(0);
      }
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentSong) {
    return null;
  }

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t border-white/5 z-40"
    >
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <img 
              src={currentSong.albumArt || '/placeholder-album.png'} 
              alt={currentSong.title}
              className="w-14 h-14 rounded-lg object-cover shadow-lg cursor-pointer"
              onClick={() => router.push('/player')}
            />
            
            <div className="min-w-0 flex-grow hidden md:block">
              <h4 
                className="font-semibold text-white truncate cursor-pointer hover:text-primary-400 transition-colors"
                onClick={() => router.push('/player')}
              >
                {currentSong.title}
              </h4>
              <p className="text-sm text-gray-400 truncate">{currentSong.artist}</p>
            </div>

            {isSignedIn && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (isFavorite(currentSong.id)) {
                    removeFromFavorites(currentSong.id);
                  } else {
                    addToFavorites(currentSong);
                  }
                }}
                className={`hidden sm:block transition-colors ${isFavorite(currentSong.id) ? 'text-rose-500' : 'text-gray-400 hover:text-white'}`}
              >
                <Heart className={`w-5 h-5 ${isFavorite(currentSong.id) ? 'fill-current' : ''}`} />
              </motion.button>
            )}
          </div>

          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShuffling(!isShufflings)}
                className={`hidden sm:block icon-btn ${isShufflings ? 'active' : ''}`}
              >
                <Shuffle className="w-4 h-4" />
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
                className="icon-btn text-gray-400 hover:text-white"
              >
                <SkipBack className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={togglePlayPause}
                className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center shadow-glow"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-white" />
                ) : (
                  <Play className="w-5 h-5 text-white ml-0.5" />
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
                className="icon-btn text-gray-400 hover:text-white"
              >
                <SkipForward className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setLooping(!isLooping)}
                className={`hidden sm:block icon-btn ${isLooping ? 'active' : ''}`}
              >
                <Repeat className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3 flex-1 justify-end">
            <button 
              onClick={toggleMute}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            
            <div className="w-24 h-1.5 bg-gray-700/50 rounded-full overflow-hidden cursor-pointer group">
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
          </div>
        </div>

        <div 
          className="h-1 bg-gray-800 cursor-pointer group"
          onClick={(e) => {
            if (audioElement) {
              const rect = e.currentTarget.getBoundingClientRect();
              const percent = (e.clientX - rect.left) / rect.width;
              audioElement.currentTime = percent * (audioElement.duration || 0);
            }
          }}
        >
          <div 
            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full relative"
            style={{ 
              width: audioElement 
                ? `${(audioElement.currentTime / (audioElement.duration || 1)) * 100}%` 
                : '0%'
            }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
