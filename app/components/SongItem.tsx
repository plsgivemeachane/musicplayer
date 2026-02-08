'use client'

import { Song } from '../types/song';
import { Play, Pause, Plus, Clock, Heart, MoreHorizontal, Trash2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useQueue } from '../context/QueueContext';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useFavorites } from '../hooks/useFavorites';
import { useUser } from '@clerk/nextjs';

interface SongItemProps {
  song: Song;
  index: number;
  onRemove?: () => void;
}

export function SongItem({ song, index, onRemove }: SongItemProps) {
  const { playSong, currentSong, isPlaying, togglePlayPause } = usePlayer();
  const { addToQueue } = useQueue();
  const [showMenu, setShowMenu] = useState(false);
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { isLoaded, isSignedIn } = useUser();

  const isCurrentSong = currentSong?.id === song.id;

  const handlePlay = () => {
    if (isCurrentSong) {
      togglePlayPause();
    } else {
      addToQueue([song], index);
      playSong(song);
    }
  };

  const handleAddToQueue = () => {
    addToQueue([song]);
    setShowMenu(false);
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`
        group flex items-center gap-3 p-3 rounded-xl cursor-pointer
        transition-all duration-200
        ${isCurrentSong 
          ? 'bg-primary-500/10 border border-primary-500/20' 
          : 'hover:bg-gray-800/50'
        }
      `}
      onClick={handlePlay}
      onMouseEnter={() => {
        // Prefetch player page
        const playerUrl = `/player?songId=${song.id}`;
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = playerUrl;
        document.head.appendChild(link);
      }}
    >
      <div className="w-8 text-center">
        {isCurrentSong ? (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex items-center justify-center"
          >
            <div className="flex gap-0.5 items-end h-4">
              {[0.4, 0.7, 0.5, 0.9, 0.6].map((h, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-primary-500 rounded-full"
                  animate={{ height: [4, h * 10 + 4, 4] }}
                  transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.08 }}
                />
              ))}
            </div>
          </motion.div>
        ) : (
          <span className="text-sm text-gray-500 group-hover:hidden">{index + 1}</span>
        )}
        
        {!isCurrentSong && (
          <motion.button
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="hidden group-hover:block"
            onClick={(e) => {
              e.stopPropagation();
              handlePlay();
            }}
          >
            <Play className="w-4 h-4 text-white" />
          </motion.button>
        )}
      </div>

      <img 
        src={song.albumArt || '/placeholder-album.png'} 
        alt={song.title}
        className={`
          w-12 h-12 rounded-lg object-cover transition-all duration-300
          ${isCurrentSong ? 'ring-2 ring-primary-500' : ''}
        `}
      />

      <div className="flex-grow min-w-0">
        <p className={`font-medium truncate ${isCurrentSong ? 'text-primary-400' : 'text-white'}`}>
          {song.title}
        </p>
        <p className="text-sm text-gray-400 truncate">{song.artist}</p>
      </div>

      <div className="hidden md:flex items-center gap-4 text-sm text-gray-400">
        {isSignedIn && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              if (isFavorite(song.id)) {
                removeFromFavorites(song.id);
              } else {
                addToFavorites(song);
              }
            }}
            className={`transition-colors ${isFavorite(song.id) ? 'text-rose-500' : 'hover:text-white'}`}
          >
            <Heart className={`w-4 h-4 ${isFavorite(song.id) ? 'fill-current' : ''}`} />
          </motion.button>
        )}
        
        <span className="w-12 text-right">{formatDuration(song.duration)}</span>
      </div>

      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="icon-btn opacity-0 group-hover:opacity-100"
        >
          <MoreHorizontal className="w-4 h-4" />
        </motion.button>

        {showMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute right-0 bottom-full mb-2 bg-gray-800 rounded-xl shadow-xl overflow-hidden min-w-[140px]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleAddToQueue}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-gray-700/50 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Thêm vào queue
            </button>
            
            {onRemove && (
              <button
                onClick={() => {
                  onRemove();
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-gray-700/50 transition-colors text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Xóa khỏi playlist
              </button>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
