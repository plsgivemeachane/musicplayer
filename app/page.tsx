'use client'
import Image from "next/image";
import { useState, useRef, useEffect } from 'react';
import { Search, Plus, Play, ChevronRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser } from "@clerk/nextjs";
import { usePlayer } from './context/PlayerContext';
import { useQueue } from './context/QueueContext';
import { PrefetchKind } from "next/dist/client/components/router-reducer/router-reducer-types";
import { motion, AnimatePresence } from 'framer-motion';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL + "/7860";

interface Song {
  id: string;
  title: string;
  artist: string;
  duration: number;
  url: string;
  albumArt?: string;
}

interface Playlist {
  id: string;
  name: string;
  songs: Song[];
}

class PlaylistManager {
  private storageKey = 'playlists';

  getPlaylists(): Playlist[] {
    const storedPlaylists = localStorage.getItem(this.storageKey);
    return storedPlaylists ? JSON.parse(storedPlaylists) : [];
  }

  createPlaylist(name: string, id?: string): Playlist {
    const newPlaylist: Playlist = {
      id: id || Math.random().toString(36).substr(2, 9),
      name,
      songs: []
    };
    const playlists = this.getPlaylists();
    playlists.push(newPlaylist);
    localStorage.setItem(this.storageKey, JSON.stringify(playlists));
    return newPlaylist;
  }

  addSongToPlaylist(playlistId: string, song: Song) {
    const playlists = this.getPlaylists();
    const playlistIndex = playlists.findIndex(p => p.id === playlistId);
    
    if (playlistIndex !== -1) {
      playlists[playlistIndex].songs.push(song);
      localStorage.setItem(this.storageKey, JSON.stringify(playlists));
    }
  }
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const playlistManager = new PlaylistManager();
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser()
  const { playSong, currentSong, isPlaying } = usePlayer();
  const { addToQueue } = useQueue();

  useEffect(() => {
    const storedPlaylists = playlistManager.getPlaylists();
    setPlaylists(storedPlaylists);

    if (storedPlaylists.length === 0) {
      const favoritesPlaylist = {
        id: 'favorites',
        name: 'Yêu thích',
        songs: []
      };
      
      const currentPlaylists = JSON.parse(localStorage.getItem('playlists') || '[]');
      const updatedPlaylists = [...currentPlaylists, favoritesPlaylist];
      localStorage.setItem('playlists', JSON.stringify(updatedPlaylists));

      setPlaylists([...updatedPlaylists]);
    }
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full"
        />
      </div>
    )
  }

  const createNewPlaylist = () => {
    const newPlaylist = playlistManager.createPlaylist(`Playlist mới ${playlists.length + 1}`, `playlist-${playlists.length + 1}`);
    setPlaylists([...playlists, newPlaylist]);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) {
      return 'Chào buổi sáng';
    } else if (hour < 18) {
      return 'Chào buổi chiều';
    } else {
      return 'Chào buổi tối';
    }
  }

  const getImageForPlaylist = (playlist: Playlist) => {
    if (playlist.songs.length === 0) {
      return `https://picsum.photos/seed/${playlist.id}/200/200`;
    }
    return playlist.songs[0].albumArt ?? "";
  }

  const handlePlayPlaylist = (playlist: Playlist) => {
    if (playlist.songs.length > 0) {
      addToQueue(playlist.songs);
      playSong(playlist.songs[0]);
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-6 pb-32">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {getGreeting()}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">
              {user?.firstName || 'bạn'}
            </span>
          </h1>
          <p className="text-gray-400">Hôm nay bạn muốn nghe gì?</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full blur-lg opacity-0 group-focus-within:opacity-30 transition-opacity duration-300" />
            <div className="relative">
              <input 
                type="text" 
                placeholder="Tìm kiếm bài hát..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onMouseEnter={() => router.prefetch(`/search`)}
                className="input-search pl-12 pr-16 py-4 text-base"
              />
              <Search 
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-400 transition-colors"
                onClick={handleSearch}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-14 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {!user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/80 backdrop-blur-sm"
          >
            <div className="glass-card p-8 text-center max-w-md mx-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center">
                <Sparkles className="text-white w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Đăng nhập để tiếp tục
              </h2>
              <p className="text-gray-400 mb-6">
                Tạo playlist, lưu yêu thích và nghe nhạc không gián đoạn
              </p>
            </div>
          </motion.div>
        )}

        <div className={user ? "" : "blur-sm opacity-50 pointer-events-none"}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between mb-6"
          >
            <h2 className="text-xl font-bold text-white">Playlist của bạn</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={createNewPlaylist}
              className="btn-glow text-sm py-2 px-4"
            >
              <Plus className="inline mr-2 w-4 h-4" />
              Tạo mới
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            {playlists.map((playlist, index) => (
              <motion.div
                key={playlist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
                whileHover={{ y: -4 }}
                className="playlist-card group"
                onClick={() => router.push(`/playlist?playlistId=${playlist.id}`)}
                onMouseEnter={() => {
                  router.prefetch(`/playlist?playlistId=${playlist.id}`, {
                    kind: PrefetchKind.FULL
                  })
                }}
              >
                <div className="relative aspect-square overflow-hidden">
                  <img 
                    src={getImageForPlaylist(playlist)} 
                    alt={playlist.name}
                    className="w-full h-full object-cover transition-transform duration-500"
                    style={{ aspectRatio: '1/1' }}
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60" />
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayPlaylist(playlist);
                    }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-14 h-14 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center shadow-glow"
                    >
                      <Play className="text-white w-6 h-6 ml-1" />
                    </motion.button>
                  </motion.div>
                </div>

                <div className="p-3">
                  <h3 className="font-semibold text-white truncate group-hover:text-primary-400 transition-colors">
                    {playlist.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {playlist.songs.length} bài hát
                  </p>
                </div>
              </motion.div>
            ))}

            {playlists.length < 4 && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (playlists.length + 1) }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={createNewPlaylist}
                className="aspect-square rounded-xl bg-gray-800/50 border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3 hover:border-primary-500/50 hover:bg-gray-700/50 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center">
                  <Plus className="text-primary-400 w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-gray-400">Tạo playlist mới</span>
              </motion.button>
            )}
          </motion.div>

          {currentSong && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-10"
            >
              <div className="flex items-center gap-2 mb-4">
                <Play className="text-primary-400" />
                <h2 className="text-xl font-bold text-white">Đang phát</h2>
              </div>
              
              <div className="glass-card p-4 flex items-center gap-4">
                <img 
                  src={currentSong.albumArt || '/placeholder-album.png'}
                  alt={currentSong.title}
                  className="w-16 h-16 rounded-lg object-cover shadow-lg"
                />
                <div className="flex-grow">
                  <h3 className="font-semibold text-white truncate">{currentSong.title}</h3>
                  <p className="text-sm text-gray-400">{currentSong.artist}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isPlaying 
                    ? 'bg-primary-500/20 text-primary-400' 
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {isPlaying ? '▶ Đang phát' : '⏸ Tạm dừng'}
                </div>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 grid grid-cols-2 gap-3"
          >
            <button
              onClick={() => router.push('/search')}
              className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary-500/10 to-transparent border border-primary-500/20 hover:border-primary-500/40 transition-all duration-300"
            >
              <span className="text-sm font-medium text-white">Tìm bài hát</span>
              <ChevronRight className="text-primary-400 w-4 h-4" />
            </button>
            <button
              onClick={() => router.push('/playlist?playlistId=favorites')}
              className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-accent-500/10 to-transparent border border-accent-500/20 hover:border-accent-500/40 transition-all duration-300"
            >
              <span className="text-sm font-medium text-white">Yêu thích</span>
              <ChevronRight className="text-accent-400 w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
