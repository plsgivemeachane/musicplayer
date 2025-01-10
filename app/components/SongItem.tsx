import React from 'react';
import { FaHeart, FaRegHeart, FaPlay } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface SongItemProps {
  result: {
    videoId: string;
    thumbnails: { url: string }[];
    name: string;
    artist: { name: string };
  };
  isSignedIn: boolean;
  isFavorite: (videoId: string) => boolean;
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
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      key={result.videoId} 
      className="bg-neutral-900 rounded-md p-2 flex items-center space-x-4 hover:bg-neutral-800 transition-colors"
    >
      <img 
        src={result.thumbnails[0]?.url || '/placeholder-album.png'}
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
        {isSignedIn && <button 
          onClick={() => handleFavoriteToggle(result)}
          className="text-red-500 hover:text-red-400 transition-colors"
        >
          {isFavorite(result.videoId) ? <FaHeart /> : <FaRegHeart />}
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
