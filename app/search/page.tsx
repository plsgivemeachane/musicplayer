'use client'

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search as SearchIcon, Music, X, Loader2 } from 'lucide-react';
import { usePlayer } from "../context/PlayerContext";
import { useQueue } from '../context/QueueContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";
import { Song } from '../types/song';
import { useFavorites } from '../hooks/useFavorites';
import { useUser } from "@clerk/nextjs";
import { SongItem } from '../components/SongItem';

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
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full"
        />
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}

function SearchPageContent() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [nestedSearchQuery, setNestedSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const queryParam = searchParams.get('query') || '';
  const { playSong, isPlaying, currentSong } = usePlayer();
  const { addToQueue } = useQueue();
  const router = useRouter();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { isLoaded } = useUser();

  useEffect(() => {
    if (queryParam) {
      setNestedSearchQuery(queryParam);
    }
  }, [queryParam]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!queryParam) return;

      setIsLoading(true);
      setError(null);

      try {
        const fullUrl = `${BASE_URL}/v1/youtube/search?query=${encodeURIComponent(queryParam)}`;

        const response = await fetch(fullUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: "force-cache"
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch songs');
        }

        const data: SearchResult[] = await response.json();

        if (data.length === 0) {
          router.push('/no-songs');
          return;
        }

        setSearchResults(data);
      } catch (err) {
        console.error('Search error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        router.push('/no-songs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [queryParam]);

  const getLargestAlbumArt = (thumbnails: SearchResult['thumbnails']) => {
    if (thumbnails.length > 0) {
      return thumbnails.reduce((largest, thumbnail) => {
        if (thumbnail.width > largest.width) {
          return thumbnail;
        }
        return largest;
      });
    }
    return null;
  };

  const handlePlaySong = (result: SearchResult) => {
    const song: Song = {
      id: result.videoId,
      title: result.name,
      artist: result.artist.name,
      albumArt: getLargestAlbumArt(result.thumbnails)?.url || '/placeholder-album.png',
      duration: result.duration
    };

    const queueSongs: Song[] = searchResults.map(r => ({
      id: r.videoId,
      title: r.name,
      artist: r.artist.name,
      albumArt: getLargestAlbumArt(r.thumbnails)?.url || '/placeholder-album.png',
      duration: r.duration
    }));

    const currentSongIndex = queueSongs.findIndex(song => song.id === result.videoId);

    addToQueue(queueSongs, currentSongIndex);
    playSong(song);
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

  const clearSearch = () => {
    setNestedSearchQuery('');
    setSearchResults([]);
    router.push('/search');
  };

  if(!isLoaded) {
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

  return (
    <div className="min-h-screen p-4 md:p-6 pb-32">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Tìm kiếm
          </h1>
          <p className="text-gray-400">Tìm bài hát bạn yêu thích</p>
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
                placeholder="Tìm kiếm bài hát, nghệ sĩ..."
                value={nestedSearchQuery}
                onChange={(e) => setNestedSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="input-search pr-20 py-4 text-base"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                {nestedSearchQuery && (
                  <button
                    onClick={clearSearch}
                    className="text-gray-500 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={handleSearch}
                  className="icon-btn w-9 h-9 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400"
                >
                  <SearchIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {[...Array(7)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card p-4 flex items-center gap-4"
                >
                  <div className="w-14 h-14 shimmer rounded-lg" />
                  <div className="flex-grow space-y-2">
                    <div className="h-4 w-3/4 shimmer rounded" />
                    <div className="h-3 w-1/2 shimmer rounded" />
                  </div>
                  <div className="w-8 h-8 shimmer rounded-full" />
                </motion.div>
              ))}
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
                <Music className="text-red-500 w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Đã xảy ra lỗi</h2>
              <p className="text-gray-400">{error}</p>
            </motion.div>
          ) : searchResults.length > 0 ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">
                  Kết quả cho "{queryParam}"
                </h2>
                <span className="text-sm text-gray-400">
                  {searchResults.length} bài hát
                </span>
              </div>

              <div className="space-y-3">
                {searchResults.map((result, index) => {
                  const song: Song = {
                    id: result.videoId,
                    title: result.name,
                    artist: result.artist.name,
                    albumArt: getLargestAlbumArt(result.thumbnails)?.url || '/placeholder-album.png',
                    duration: result.duration
                  };
                  
                  return (
                    <motion.div
                      key={result.videoId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <SongItem 
                        song={song}
                        index={index}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-full flex items-center justify-center">
                <SearchIcon className="text-gray-500 w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Tìm kiếm bài hát
              </h2>
              <p className="text-gray-400 max-w-md mx-auto">
                Nhập tên bài hát hoặc nghệ sĩ để bắt đầu tìm kiếm
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
