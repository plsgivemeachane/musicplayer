'use client'
import Image from "next/image";
import { useState, useRef, useEffect } from 'react';
import { FaSearch, FaPlus } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useUser } from "@clerk/nextjs";
import { usePlayer } from './context/PlayerContext';
import MediaPlayer from "./components/MediaPlayer";
import Navigation from "./components/Navigation";
import { PrefetchKind } from "next/dist/client/components/router-reducer/router-reducer-types";

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
  const audioRef = useRef<HTMLAudioElement>(null);
  const playlistManager = new PlaylistManager();
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser()
  const { playSong } = usePlayer();

  useEffect(() => {
    // Load playlists from local storage on component mount
    const storedPlaylists = playlistManager.getPlaylists();
    console.log(storedPlaylists)
    setPlaylists(storedPlaylists);

    // If no playlists exist, create default playlists
    if (storedPlaylists.length === 0) {
      const defaultPlaylists = [
        // playlistManager.createPlaylist('Liked Songs'),
        playlistManager.createPlaylist('Daily Mix'),
        playlistManager.createPlaylist('Discover Weekly')
      ];
      
      // Ensure Favorites playlist exists with a predictable ID
      const favoritesPlaylist = {
        id: 'favorites',
        name: 'Favorites',
        songs: []
      };
      
      // Save favorites playlist to localStorage
      const currentPlaylists = JSON.parse(localStorage.getItem('playlists') || '[]');
      const updatedPlaylists = [...currentPlaylists, favoritesPlaylist];
      localStorage.setItem('playlists', JSON.stringify(updatedPlaylists));

      setPlaylists([...defaultPlaylists, favoritesPlaylist]);
    }
  }, []);

  if (!isLoaded) {
    return (
      <div>
        <h1>Loading</h1>
      </div>
    )
  }

  const createNewPlaylist = () => {
    const newPlaylist = playlistManager.createPlaylist(`New Playlist ${playlists.length + 1}`, `playlist-${playlists.length + 1}`);
    setPlaylists([...playlists, newPlaylist]);
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
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

    if (playlist.songs.length == 0) {
      // return example image 
      return "https://picsum.photos/64/64?random=" + playlist.id
    }

    // Get random image from playlist'songs art
    // const randomIndex = Math.floor(Math.random() * playlist.songs.length);
    return playlist.songs[0].albumArt??"";
  }

  return (
    <div className="bg-black text-white min-h-screen p-4">
      {/* Main Content */}
      <div className="max-w-md mx-auto">
        {/* Top Bar */}
        <div className="flex flex-col justify-between items-center mb-8">
          <div className="flex flex-col space-y-4 items-center w-full">
            {/* Search Input */}
            <div className="relative w-full">
              <input 
                type="text" 
                placeholder="Tìm kiếm" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onMouseEnter={() => router.prefetch(`/search`)}
                className="bg-neutral-800 text-white px-4 py-2 pl-10 rounded-full w-full focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <FaSearch 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
                onClick={handleSearch}
              />
            </div>
          </div>
        </div>
        {!user && <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center space-x-4 mt-24">
            <h1 className="md:text-4xl text-xl font-bold">Đăng nhập để sử dụng playlists</h1>
        </div>}
        <div className={user ? "" : "blur-md"}>
          {!user && <div className="fixed top-0 left-0 right-0 bottom-0 pointer-events-auto cursor-not-allowed"></div>}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{getGreeting()} {user?user.firstName : "Anonymous"}</h2>
            <button 
              // onClick={createNewPlaylist}
              onClick={() => alert("You just found a underdeveloped feature!")}
              className="bg-green-500 text-black p-2 rounded-full hover:bg-green-600"
            >
              <FaPlus />
            </button>
          </div>

          {/* Playlists List */}
          <div className="space-y-4">
            {playlists.map((playlist, index) => (
              <div 
                key={playlist.id} 
                className="bg-neutral-800 p-4 rounded-lg flex items-center space-x-4 hover:bg-neutral-700 cursor-pointer"
                onClick={() => router.push(`/playlist?playlistId=${playlist.id}`)}
                onMouseEnter={() => {
                  router.prefetch(`/playlist?playlistId=${playlist.id}`, {
                    kind: PrefetchKind.FULL
                  })
                }}
              >
                <img 
                  src={getImageForPlaylist(playlist)} 
                  alt={playlist.name}
                  width={64}
                  height={64}
                  className="rounded-lg"
                />
                <div>
                  <h3 className="font-semibold">{playlist.name}</h3>
                  <p className="text-neutral-400 text-sm">{playlist.songs.length} bài</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Media Player */}
      {/* <MediaPlayer /> */}

      {/* Navigation */}
      {/* <Navigation /> */}
    </div>
  );
}
