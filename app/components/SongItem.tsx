import React from 'react';
import { FaHeart, FaRegHeart, FaPlay } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface SearchResultSong {
  videoId: string;
  thumbnails: { url: string }[];
  name: string;
  artist: { name: string };
}

interface PlaylistSong {
  id: string;
  title: string;
  artist: string;
  albumArt?: string;
}

type SongResult = SearchResultSong | PlaylistSong;

interface SongItemProps {
  result: SongResult;
  isSignedIn: boolean;
  isFavorite: (id: string) => boolean;
  handleFavoriteToggle: (song: any) => void;
  handlePlaySong: (song: any) => void;
}

export const SongItem: React.FC<SongItemProps> = ({
  result,
  isSignedIn,
  isFavorite,
  handleFavoriteToggle,
  handlePlaySong
}) => {
  // Normalize song data
  const songData = 'videoId' in result ? {
    id: result.videoId,
    title: result.name,
    artist: result.artist.name,
    albumArt: result.thumbnails[0]?.url || '/placeholder-album.png'
  } : {
    id: result.id,
    title: result.title,
    artist: result.artist,
    albumArt: result.albumArt || '/placeholder-album.png'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      key={songData.id} 
      className="bg-neutral-900 rounded-md p-2 flex items-center space-x-4 hover:bg-neutral-800 transition-colors"
    >
      <img 
        src={songData.albumArt}
        alt={"Loi Anh"}
        width={48}
        height={48}
        className="rounded-md object-cover"
      />
      <div className="flex-grow overflow-hidden">
        <h3 className="text-sm font-semibold truncate">{songData.title}</h3>
        <p className="text-xs text-neutral-400 truncate">{songData.artist}</p>
      </div>
      <div className="flex items-center space-x-2">
        {isSignedIn && <button 
          onClick={() => handleFavoriteToggle(result)}
          className="text-red-500 hover:text-red-400 transition-colors"
        >
          {isFavorite(songData.id) ? <FaHeart /> : <FaRegHeart />}
        </button>}
        <button 
          onClick={() => handlePlaySong(result)}
          className="text-white hover:text-blue-500 transition-colors"
        >
          <FaPlay className="text-xl" />
        </button>
      </div>
    </motion.div>
  );
};
