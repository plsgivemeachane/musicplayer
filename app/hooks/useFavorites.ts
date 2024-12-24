'use client'

import { useState, useEffect } from 'react';
import { Song } from '../types/song';

interface Playlist {
  id: string;
  name: string;
  songs: Song[];
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Song[]>([]);

  useEffect(() => {
    // Load playlists from localStorage
    const storedPlaylists = localStorage.getItem('playlists');
    if (storedPlaylists) {
      const parsedPlaylists: Playlist[] = JSON.parse(storedPlaylists);
      const favoritesPlaylist = parsedPlaylists.find(p => p.id === 'favorites');
      
      if (favoritesPlaylist) {
        setFavorites(favoritesPlaylist.songs);
      }
    }
  }, []);

  const addToFavorites = (song: Song) => {
    // Load current playlists
    const storedPlaylists = localStorage.getItem('playlists');
    const parsedPlaylists: Playlist[] = storedPlaylists ? JSON.parse(storedPlaylists) : [];

    // Find favorites playlist
    const favoritesIndex = parsedPlaylists.findIndex(p => p.id === 'favorites');

    if (favoritesIndex !== -1) {
      // Check if song already exists in favorites
      const isAlreadyFavorite = parsedPlaylists[favoritesIndex].songs.some(s => s.id === song.id);
      
      if (!isAlreadyFavorite) {
        // Add song to favorites playlist
        parsedPlaylists[favoritesIndex].songs.push(song);
        
        // Save updated playlists
        localStorage.setItem('playlists', JSON.stringify(parsedPlaylists));
        
        // Update local state
        setFavorites(parsedPlaylists[favoritesIndex].songs);
      }
    }
  };

  const removeFromFavorites = (songId: string) => {
    // Load current playlists
    const storedPlaylists = localStorage.getItem('playlists');
    const parsedPlaylists: Playlist[] = storedPlaylists ? JSON.parse(storedPlaylists) : [];

    // Find favorites playlist
    const favoritesIndex = parsedPlaylists.findIndex(p => p.id === 'favorites');

    if (favoritesIndex !== -1) {
      // Remove song from favorites
      parsedPlaylists[favoritesIndex].songs = parsedPlaylists[favoritesIndex].songs.filter(s => s.id !== songId);
      
      // Save updated playlists
      localStorage.setItem('playlists', JSON.stringify(parsedPlaylists));
      
      // Update local state
      setFavorites(parsedPlaylists[favoritesIndex].songs);
    }
  };

  const isFavorite = (songId: string) => {
    return favorites.some(song => song.id === songId);
  };

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite
  };
}
