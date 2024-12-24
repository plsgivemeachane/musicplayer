'use client'

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaPlay, FaPause, FaPlus, FaHeart, FaMusic, FaTrash } from 'react-icons/fa';
import { useUser } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import { usePlayer } from '../context/PlayerContext';
import { useQueue } from '../context/QueueContext';
import { useFavorites } from '../hooks/useFavorites';

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
  const { isLoaded, isSignedIn, user } = useUser();
  const searchParams = useSearchParams();
  const playlistId = searchParams.get('playlistId');
  const { playSong } = usePlayer();
  const { addToQueue, clearQueue } = useQueue();
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
      // Clear existing queue and add all songs from the playlist
      clearQueue();
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

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  if (!playlist) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <p>Loading playlist...</p>
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
              <span>Play All</span>
            </button>
          )}
        </div>

        {/* Playlist Songs */}
        {playlist.songs.length > 0 ? (
          <div className="space-y-4">
            {playlist.songs.map((song) => (
              <div 
                key={song.id} 
                className="flex items-center justify-between bg-neutral-800 p-4 rounded-lg hover:bg-neutral-700 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {song.albumArt ? (
                    <Image 
                      src={song.albumArt} 
                      alt={song.title} 
                      width={64} 
                      height={64} 
                      className="rounded-md"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-neutral-700 rounded-md flex items-center justify-center">
                      <FaMusic className="text-neutral-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">{song.title}</h3>
                    <p className="text-neutral-400 text-sm">{song.artist}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className="text-neutral-400 text-sm">
                    {formatDuration(song.duration)}
                  </span>
                  <button 
                    className="text-neutral-400 hover:text-green-500"
                    onClick={() => handleAddToQueue(song)}
                    title="Add to Queue"
                  >
                    <FaPlus />
                  </button>
                  <button 
                    className="text-neutral-400 hover:text-green-500"
                    onClick={() => playSong(song)}
                    title="Play"
                  >
                    <FaPlay />
                  </button>
                  <button 
                    className={`${isFavorite(song.id) ? 'text-red-500' : 'text-neutral-400'} hover:text-red-500`}
                    onClick={() => handleFavoriteToggle(song)}
                    title="Favorite"
                  >
                    {isFavorite(song.id) ? <FaHeart /> : <FaHeart />}
                  </button>
                  <button 
                    className="text-neutral-400 hover:text-red-500"
                    onClick={() => handleRemoveSongFromPlaylist(song.id)}
                    title="Remove from Playlist"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Start adding songs to this playlist by clicking the "Add to Playlist" button when searching.</p>
        )}
      </div>
    </div>
  );
}