'use client'

import { useState, useEffect } from 'react';
import { Song } from '../types/song';
import { pb } from '@/lib/pocketbase';
import { useUser } from '@clerk/nextjs';

interface Playlist {
  id: string;
  name: string;
  songs: Song[];
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Song[]>([]);
  const { user, isSignedIn } = useUser();

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

  const syncPlaylistsToServer = async (updatedPlaylists: Playlist[]) => {
    if (!isSignedIn || !user) return;

    try {
      const query = `userID="${user.id}"`;
      const userPlaylists = await pb.collection('playlists').getFirstListItem(query);

      const data = {
        userID: user.id,
        Storages: JSON.stringify(updatedPlaylists)
      };

      await pb.collection('playlists').update(userPlaylists.id, data);
    } catch (error) {
      console.error('Error syncing playlists to server:', error);
    }
  };

  const addToFavorites = async (song: Song) => {
    // Load current playlists
    const storedPlaylists = localStorage.getItem('playlists');
    const parsedPlaylists: Playlist[] = storedPlaylists ? JSON.parse(storedPlaylists) : [];

    // Find favorites playlist
    let favoritesIndex = parsedPlaylists.findIndex(p => p.id === 'favorites');

    // Create favorites playlist if not exists
    if (favoritesIndex === -1) {
      parsedPlaylists.push({
        id: 'favorites',
        name: 'Favorites',
        songs: []
      });
      favoritesIndex = parsedPlaylists.length - 1;
    }

    // Check if song already exists in favorites
    const isAlreadyFavorite = parsedPlaylists[favoritesIndex].songs.some(s => s.id === song.id);
    
    if (!isAlreadyFavorite) {
      // Add song to favorites playlist
      parsedPlaylists[favoritesIndex].songs.push(song);
      
      // Save to localStorage
      localStorage.setItem('playlists', JSON.stringify(parsedPlaylists));
      
      // Update local state
      setFavorites(parsedPlaylists[favoritesIndex].songs);

      // Sync to server if user is signed in
      if (isSignedIn) {
        await syncPlaylistsToServer(parsedPlaylists);
      }
    }
  };

  const removeFromFavorites = async (songId: string) => {
    // Load current playlists
    const storedPlaylists = localStorage.getItem('playlists');
    const parsedPlaylists: Playlist[] = storedPlaylists ? JSON.parse(storedPlaylists) : [];

    // Find favorites playlist
    const favoritesIndex = parsedPlaylists.findIndex(p => p.id === 'favorites');

    if (favoritesIndex !== -1) {
      // Remove song from favorites
      parsedPlaylists[favoritesIndex].songs = parsedPlaylists[favoritesIndex].songs.filter(s => s.id !== songId);
      
      // Save to localStorage
      localStorage.setItem('playlists', JSON.stringify(parsedPlaylists));
      
      // Update local state
      setFavorites(parsedPlaylists[favoritesIndex].songs);

      // Sync to server if user is signed in
      if (isSignedIn) {
        await syncPlaylistsToServer(parsedPlaylists);
      }
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
