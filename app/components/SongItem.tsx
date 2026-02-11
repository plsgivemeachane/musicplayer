'use client'

import React from 'react';
import { FaHeart, FaRegHeart, FaPlay, FaPause } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { usePlayer } from '../context/PlayerContext';

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
	const { currentSong, isPlaying } = usePlayer();
	
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

	const isCurrentlyPlaying = currentSong?.id === songData.id && isPlaying;

	return (
		<motion.div 
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.2 }}
			className={`
				group relative rounded-lg p-3 
				bg-concrete border border-iron
				transition-all duration-200 ease-out
				hover:bg-slate hover:border-emerald/30 hover:shadow-glow-sm
				cursor-pointer
			`}
		>
			<div className="flex items-center gap-3">
				{/* Album art with playing indicator */}
				<div className="relative w-12 h-12 flex-shrink-0">
					<img 
						src={songData.albumArt}
						alt={songData.title}
						className={`
							w-full h-full rounded-md object-cover
							transition-all duration-200
							${isCurrentlyPlaying ? 'ring-2 ring-emerald' : 'ring-1 ring-iron group-hover:ring-emerald/50'}
						`}
					/>
					{/* Play overlay on hover */}
					<div className={`
						absolute inset-0 rounded-md
						flex items-center justify-center
						bg-void/60 opacity-0 group-hover:opacity-100
						transition-opacity duration-200
					`}>
						<motion.button
							whileTap={{ scale: 0.9 }}
							onClick={() => handlePlaySong(result)}
							className="w-8 h-8 rounded-full bg-mint flex items-center justify-center"
						>
							{isCurrentlyPlaying ? (
								<FaPause size={12} className="text-void" />
							) : (
								<FaPlay size={12} className="text-void ml-0.5" />
							)}
						</motion.button>
					</div>
					
					{/* Playing animation indicator */}
					{isCurrentlyPlaying && (
						<div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald animate-pulse" />
					)}
				</div>
				
				{/* Song info */}
				<div className="flex-grow min-w-0">
					<h3 className={`
						font-sans text-sm font-medium truncate
						${isCurrentlyPlaying ? 'text-mint' : 'text-snow'}
					`}>
						{songData.title}
					</h3>
					<p className="font-sans text-xs text-ash truncate mt-0.5">
						{songData.artist}
					</p>
				</div>
				
				{/* Action buttons */}
				<div className="flex items-center gap-1 flex-shrink-0">
					{isSignedIn && (
						<motion.button
							whileTap={{ scale: 0.9 }}
							onClick={(e) => {
								e.stopPropagation();
								handleFavoriteToggle(result);
							}}
							className="p-2 text-ash hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
						>
							{isFavorite(songData.id) ? (
								<FaHeart size={16} className="text-red-400" />
							) : (
								<FaRegHeart size={16} />
							)}
						</motion.button>
					)}
					
					<motion.button
						whileTap={{ scale: 0.95 }}
						onClick={() => handlePlaySong(result)}
						className={`
							w-9 h-9 rounded-full flex items-center justify-center
							transition-all duration-200
							${isCurrentlyPlaying 
								? 'bg-emerald text-void' 
								: 'bg-slate text-silver hover:bg-mint hover:text-void'
							}
						`}
					>
						{isCurrentlyPlaying ? (
							<FaPause size={14} />
						) : (
							<FaPlay size={14} className="ml-0.5" />
						)}
					</motion.button>
				</div>
			</div>
			
			{/* Green underline on hover */}
			<div className="absolute bottom-0 left-3 right-3 h-px bg-gradient-glow scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
		</motion.div>
	);
};

export default SongItem;
