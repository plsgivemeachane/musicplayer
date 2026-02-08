'use client'
import { useState, useEffect } from 'react';
import { Play, Pause, Plus, MoreHorizontal, Clock, ChevronLeft, Trash2, Edit2, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Song } from '../types/song';
import { usePlayer } from '../context/PlayerContext';
import { useQueue } from '../context/QueueContext';
import { SongItem } from '../components/SongItem';

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

  getPlaylist(id: string): Playlist | undefined {
    const playlists = this.getPlaylists();
    return playlists.find(p => p.id === id);
  }

  createPlaylist(name: string): Playlist {
    const newPlaylist: Playlist = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      songs: []
    };
    const playlists = this.getPlaylists();
    playlists.push(newPlaylist);
    localStorage.setItem(this.storageKey, JSON.stringify(playlists));
    return newPlaylist;
  }

  deletePlaylist(id: string) {
    const playlists = this.getPlaylists();
    const filteredPlaylists = playlists.filter(p => p.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(filteredPlaylists));
  }

  addSongToPlaylist(playlistId: string, song: Song) {
    const playlists = this.getPlaylists();
    const playlistIndex = playlists.findIndex(p => p.id === playlistId);
    
    if (playlistIndex !== -1) {
      playlists[playlistIndex].songs.push(song);
      localStorage.setItem(this.storageKey, JSON.stringify(playlists));
    }
  }

  removeSongFromPlaylist(playlistId: string, songId: string) {
    const playlists = this.getPlaylists();
    const playlistIndex = playlists.findIndex(p => p.id === playlistId);
    
    if (playlistIndex !== -1) {
      playlists[playlistIndex].songs = playlists[playlistIndex].songs.filter(s => s.id !== songId);
      localStorage.setItem(this.storageKey, JSON.stringify(playlists));
    }
  }
}

export default function PlaylistPage() {
  const router = useRouter();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [playlistManager] = useState(() => new PlaylistManager());
  const { playSong, currentSong } = usePlayer();
  const { addToQueue } = useQueue();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const playlistId = params.get('playlistId');

    if (playlistId) {
      const storedPlaylists = playlistManager.getPlaylists();
      const foundPlaylist = storedPlaylists.find(p => p.id === playlistId);
      
      if (foundPlaylist) {
        setPlaylist(foundPlaylist);
        setNewPlaylistName(foundPlaylist.name);
      } else {
        router.push('/');
      }
    } else {
      router.push('/');
    }
  }, [router, playlistManager]);

  useEffect(() => {
    if (currentSong && playlist?.songs.some(s => s.id === currentSong.id)) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [currentSong, playlist]);

  const handlePlayPlaylist = () => {
    if (playlist && playlist.songs.length > 0) {
      if (isPlaying) {
        // Logic to pause will be handled by PlayerContext
      } else {
        addToQueue(playlist.songs);
        playSong(playlist.songs[0]);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleDeletePlaylist = () => {
    if (playlist) {
      playlistManager.deletePlaylist(playlist.id);
      router.push('/');
    }
  };

  const handleSaveName = () => {
    if (playlist && newPlaylistName.trim()) {
      const playlists = playlistManager.getPlaylists();
      const playlistIndex = playlists.findIndex(p => p.id === playlist.id);
      
      if (playlistIndex !== -1) {
        playlists[playlistIndex].name = newPlaylistName.trim();
        localStorage.setItem('playlists', JSON.stringify(playlists));
        setPlaylist({ ...playlists[playlistIndex] });
      }
      
      setEditingName(false);
    }
  };

  const handleRemoveSong = (songId: string) => {
    if (playlist) {
      playlistManager.removeSongFromPlaylist(playlist.id, songId);
      const updatedPlaylist = playlistManager.getPlaylist(playlist.id);
      if (updatedPlaylist) {
        setPlaylist(updatedPlaylist);
      }
    }
  };

  const getCoverImage = () => {
    if (!playlist) return '/placeholder-album.png';
    if (playlist.songs.length === 0) return '/placeholder-album.png';
    return playlist.songs[0].albumArt || '/placeholder-album.png';
  };

  const formatTotalDuration = () => {
    if (!playlist) return '0 phút';
    const totalSeconds = playlist.songs.reduce((acc, song) => acc + (song.duration || 0), 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} giờ ${minutes} phút`;
    }
    return `${minutes} phút`;
  };

  if (!playlist) {
    return (
      <div className="fixed inset-0 bg-gray-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 pb-32">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-6"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.back()}
          className="icon-btn"
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>

        {editingName ? (
          <div className="flex items-center gap-2 flex-grow">
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="bg-gray-800 text-white px-3 py-2 rounded-lg flex-grow focus:outline-none focus:ring-2 focus:ring-primary-500"
              autoFocus
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSaveName}
              className="btn-primary text-sm py-2 px-4"
            >
              Lưu
            </motion.button>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold text-white flex-grow truncate">
              {playlist.name}
            </h1>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setEditingName(true)}
              className="icon-btn"
            >
              <Edit2 className="w-4 h-4" />
            </motion.button>
          </>
        )}
      </motion.div>

      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row gap-6 mb-8"
        >
          <div className="relative w-full md:w-56 h-56 shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/30 to-accent-500/30 rounded-xl blur-xl" />
            <img
              src={getCoverImage()}
              alt={playlist.name}
              className="relative w-full h-full object-cover rounded-xl shadow-2xl"
            />
          </div>

          <div className="flex flex-col justify-end">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">
              Playlist
            </h2>
            
            {editingName ? null : (
              <motion.h1 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-4xl md:text-5xl font-bold text-white mb-4"
              >
                {playlist.name}
              </motion.h1>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>{playlist.songs.length} bài hát</span>
              <span className="w-1 h-1 bg-gray-600 rounded-full" />
              <span>{formatTotalDuration()}</span>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePlayPlaylist}
                disabled={playlist.songs.length === 0}
                className="btn-glow flex items-center gap-2 px-6 py-3"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-5 h-5" />
                    Tạm dừng
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Phát ngay
                  </>
                )}
              </motion.button>

              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowMenu(!showMenu)}
                  className="icon-btn"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </motion.button>

                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-full right-0 mb-2 bg-gray-800 rounded-xl shadow-xl overflow-hidden min-w-[160px]"
                  >
                    <button
                      onClick={handleDeletePlaylist}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-gray-700/50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Xóa playlist
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {playlist.songs.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            {playlist.songs.map((song, index) => (
              <SongItem
                key={song.id}
                song={song}
                index={index}
                onRemove={() => handleRemoveSong(song.id)}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
              <Plus className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Chưa có bài hát nào
            </h3>
            <p className="text-gray-400 mb-6">
              Thêm bài hát vào playlist để bắt đầu nghe
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/search')}
              className="btn-primary"
            >
              <Search className="w-4 h-4 mr-2 inline" />
              Tìm bài hát
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
