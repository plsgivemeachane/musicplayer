'use client'

import Image from "next/image";
import { useState, useEffect, Suspense } from 'react';
import { FaPlay, FaPause, FaHeart, FaPlus, FaSearch, FaRegHeart } from 'react-icons/fa';
import { useSearchParams } from 'next/navigation';
import { usePlayer } from "../context/PlayerContext";
import { useQueue } from '../context/QueueContext';
import { useRouter } from 'next/navigation';
import MediaPlayer from '../components/MediaPlayer';
import Navigation from '../components/Navigation';
import { motion } from "framer-motion"
import { Song } from '../types/song';
import { useFavorites } from '../hooks/useFavorites';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

interface SearchResult {
  type: string;
  videoId: string;
  name: string;
  artist: {
    name: string;
    artistId: string;
  };
  album: {
    name: string;
    albumId: string;
  };
  duration: number;
  thumbnails: Array<{
    url: string;
    width: number;
    height: number;
  }>;
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Chờ...</div>}>
      <Search />
    </Suspense>
  );
}

function Search() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [query, setQuery] = useState('');
  const [nestedSearchQuery, setNestedSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const queryParam = searchParams.get('query') || '';
  const { playSong } = usePlayer();
  const { addToQueue } = useQueue();
  const router = useRouter();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!queryParam) return;

      setIsLoading(true);
      setError(null);

      try {
        console.log('Fetching search results for query:', queryParam);
        const fullUrl = `${BASE_URL}/search?query=${encodeURIComponent(queryParam)}`;
        console.log('Full URL:', fullUrl);

        const response = await fetch(fullUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          // Handle HTTP errors
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch songs');
        }

        const data: SearchResult[] = await response.json();

        if (data.length === 0) {
          // Redirect to no songs page
          router.push('/no-songs');
          return;
        }

        setSearchResults(data);
      } catch (err) {
        // Log the error for debugging
        console.error('Search error:', err);
        
        // Redirect to no songs page on any error
        router.push('/no-songs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [queryParam]);

  const handlePlaySong = (result: SearchResult) => {
    // Convert SearchResult to Song
    const song: Song = {
      id: result.videoId,
      title: result.name,
      artist: result.artist.name,
      url: `${BASE_URL}/video?v=${result.videoId}`,
      albumArt: result.thumbnails[0]?.url || '/placeholder-album.jpg',
      duration: result.duration
    };

    // Play the first song and add all songs to queue
    playSong(song);
    
    // Convert all search results to songs for queue
    const queueSongs: Song[] = searchResults.map(r => ({
      id: r.videoId,
      title: r.name,
      artist: r.artist.name,
      url: `${BASE_URL}/video?v=${r.videoId}`,
      albumArt: r.thumbnails[0]?.url || '/placeholder-album.jpg',
      duration: r.duration
    }));

    addToQueue(queueSongs);
  };

  const handleFavoriteToggle = (result: SearchResult) => {
    // Convert SearchResult to Song
    const song: Song = {
      id: result.videoId,
      title: result.name,
      artist: result.artist.name,
      albumArt: result.thumbnails[0]?.url,
      url: `${BASE_URL}/video?v=${result.videoId}`,
      duration: result.duration
    };

    if (isFavorite(song.id)) {
      removeFromFavorites(song.id);
    } else {
      addToFavorites(song);
    }
  };

  const handleSearch = () => {
    if (nestedSearchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(nestedSearchQuery)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  if (isLoading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-black text-white min-h-screen flex items-center justify-center">
        <p>Đang tải...</p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <div className="bg-black text-white min-h-screen p-4">
        <p className="text-red-500">Lỗi!: {error}</p>
      </div>
    );
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
                placeholder="Search" 
                value={nestedSearchQuery}
                onChange={(e) => setNestedSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-neutral-800 text-white px-4 py-2 pl-10 rounded-full w-full focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <FaSearch 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
                onClick={handleSearch}
              />
            </div>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-2">
            {searchResults.map((result) => (
              <div 
                key={result.videoId} 
                className="bg-neutral-900 rounded-md p-2 flex items-center space-x-4 hover:bg-neutral-800 transition-colors"
              >
                <Image 
                  src={result.thumbnails[0]?.url || '/placeholder-album.jpg'}
                  alt={"Lỗi ảnh"}
                  width={48}
                  height={48}
                  className="rounded-md object-cover"
                />
                <div className="flex-grow overflow-hidden">
                  <h3 className="text-sm font-semibold truncate">{result.name}</h3>
                  <p className="text-xs text-neutral-400 truncate">{result.artist.name}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleFavoriteToggle(result)}
                    className="text-red-500 hover:text-red-400 transition-colors"
                  >
                    {isFavorite(result.videoId) ? <FaHeart /> : <FaRegHeart />}
                  </button>
                  <button 
                    onClick={() => handlePlaySong(result)}
                    className="text-white hover:text-blue-500 transition-colors"
                  >
                    <FaPlay className="text-xl" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {searchResults.length === 0 && (
          <div className="text-center text-neutral-400 mt-16">
            <p>Không tìm thấy "{queryParam}"</p>
          </div>
        )}
      </div>

      {/* Media Player */}
      {/* <MediaPlayer /> */}

      {/* Navigation */}
      {/* <Navigation /> */}
    </div>
  );
}
