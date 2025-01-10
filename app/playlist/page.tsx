'use client'

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { FaPlay, FaPause, FaPlus, FaHeart, FaMusic, FaTrash, FaRegHeart } from 'react-icons/fa';
import { SignedIn, useUser } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import { usePlayer } from '../context/PlayerContext';
import { useQueue } from '../context/QueueContext';
import { useFavorites } from '../hooks/useFavorites';
import { SongItem } from '../components/SongItem';

import { motion } from 'motion/react' 

// Assuming you have a similar structure in your existing types
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

export default function PlaylistPage() {
  return (
    <Suspense fallback={<div>Chờ...</div>}>
      <Playlist />
    </Suspense>
  );
}

function Playlist() {
  const { isLoaded, isSignedIn, user } = useUser();
  const searchParams = useSearchParams();
  const playlistId = searchParams.get('playlistId');
  const { playSong } = usePlayer();
  const { addToQueue } = useQueue();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

  const [playlist, setPlaylist] = useState<Playlist | null>(null);

  useEffect(() => {
    if (!playlistId) return;

    // Fetch playlist logic - replace with your actual data fetching method
    const fetchPlaylist = async () => {
      try {
        // This is a mock implementation. Replace with actual data fetching
        const storedPlaylists = JSON.parse(localStorage.getItem('playlists') || '[]');
        const foundPlaylist = storedPlaylists.find((p: Playlist) => p.id === playlistId);
        
        if (foundPlaylist) {
          console.log(foundPlaylist)
          setPlaylist(foundPlaylist);
        } else {
          console.error('Playlist not found');
        }
      } catch (error) {
        console.error('Error fetching playlist:', error);
      }
    };

    fetchPlaylist();
  }, [playlistId]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handlePlayAll = () => {
    if (playlist && playlist.songs.length > 0) {
      // Add all songs from the playlist
      addToQueue(playlist.songs);
      
      // Play the first song
      playSong(playlist.songs[0]);
    }
  };

  const handleAddToQueue = (song: Song) => {
    addToQueue([song]);
  };

  const handleFavoriteToggle = (song: Song) => {
    if (isFavorite(song.id)) {
      removeFromFavorites(song.id);
    } else {
      addToFavorites(song);
    }
  };

  const handleRemoveSongFromPlaylist = (songId: string) => {
    if (!playlist) return;

    // Remove song from the playlist
    const updatedSongs = playlist.songs.filter(song => song.id !== songId);
    const updatedPlaylist = { ...playlist, songs: updatedSongs };

    // Update localStorage
    const storedPlaylists = JSON.parse(localStorage.getItem('playlists') || '[]');
    const playlistIndex = storedPlaylists.findIndex((p: Playlist) => p.id === playlistId);
    
    if (playlistIndex !== -1) {
      storedPlaylists[playlistIndex] = updatedPlaylist;
      localStorage.setItem('playlists', JSON.stringify(storedPlaylists));
    }

    // Update state
    setPlaylist(updatedPlaylist);
  };

  const handlePlaySongFromPlaylist = (song: Song) => {
    if (playlist && playlist.songs.length > 0) {
      // Add all songs from the playlist
      addToQueue(playlist.songs);
      
      // Play the selected song
      playSong(song);
    } else {
      // If no playlist, just play the song
      playSong(song);
    }
  };

  if (!isLoaded) {
    return null;
  }

  if(!isSignedIn) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <p>Đăng nhập để sử dụng tính năng này</p>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <p>Tải playlist...</p>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">{playlist.name}</h1>
          {playlist.songs.length > 0 && (
            <button 
              onClick={handlePlayAll}
              className="bg-green-500 text-black p-2 rounded-full hover:bg-green-600 flex items-center space-x-2"
            >
              <FaPlay />
              <span>Phát</span>
            </button>
          )}
        </div>

        {/* Playlist Songs */}
        {playlist.songs.length > 0 ? (
          <div className="space-y-4">
            {playlist.songs.map((song) => (
              <SongItem 
                key={song.id}
                result={{
                  videoId: song.id,
                  thumbnails: [{ url: song.albumArt || '/placeholder-album.png' }],
                  name: song.title,
                  artist: { name: song.artist }
                }}
                isSignedIn={isSignedIn}
                isFavorite={(id) => isFavorite(id)}
                handleFavoriteToggle={handleFavoriteToggle}
                handlePlaySong={handlePlaySongFromPlaylist}
              />
            ))}
          </div>
        ) : (
          <p>Bắt đầu thêm bài hắt bằng cách tìm kiếm</p>
        )}
      </div>
    </div>
  );
}