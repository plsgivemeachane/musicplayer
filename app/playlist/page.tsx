'use client'

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { FaPlay, FaPause, FaPlus, FaHeart, FaMusic, FaTrash, FaRegHeart, FaArrowLeft, FaSearch } from 'react-icons/fa';
import { SignedIn, useUser } from '@clerk/nextjs';
import { useSearchParams, useRouter } from 'next/navigation';
import { usePlayer } from '../context/PlayerContext';
import { useQueue } from '../context/QueueContext';
import { useFavorites } from '../hooks/useFavorites';
import { SongItem } from '../components/SongItem';
import MediaPlayer from '../components/MediaPlayer';
import Navigation from '../components/Navigation';
import BioluminescentBackground from '../components/BioluminescentBackground';
import { motion } from 'framer-motion';

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
		<Suspense fallback={
			<div className="min-h-screen bg-carbon flex items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<div className="w-12 h-12 rounded-full border-2 border-iron border-t-emerald animate-spin" />
					<p className="font-sans text-ash text-sm">Đang tải...</p>
				</div>
			</div>
		}>
			<Playlist />
		</Suspense>
	);
}

function Playlist() {
	const { isLoaded, isSignedIn, user } = useUser();
	const searchParams = useSearchParams();
	const router = useRouter();
	const playlistId = searchParams.get('playlistId');
	const { playSong, isPlaying, currentSong, togglePlayPause } = usePlayer();
	const { addToQueue } = useQueue();
	const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

	const [playlist, setPlaylist] = useState<Playlist | null>(null);

	useEffect(() => {
		if (!playlistId) return;

		const fetchPlaylist = async () => {
			try {
				const storedPlaylists = JSON.parse(localStorage.getItem('playlists') || '[]');
				const foundPlaylist = storedPlaylists.find((p: Playlist) => p.id === playlistId);
				
				if (foundPlaylist) {
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

	const handlePlayAll = () => {
		if (playlist && playlist.songs.length > 0) {
			addToQueue(playlist.songs);
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

		const updatedSongs = playlist.songs.filter(song => song.id !== songId);
		const updatedPlaylist = { ...playlist, songs: updatedSongs };

		const storedPlaylists = JSON.parse(localStorage.getItem('playlists') || '[]');
		const playlistIndex = storedPlaylists.findIndex((p: Playlist) => p.id === playlistId);
		
		if (playlistIndex !== -1) {
			storedPlaylists[playlistIndex] = updatedPlaylist;
			localStorage.setItem('playlists', JSON.stringify(storedPlaylists));
		}

		setPlaylist(updatedPlaylist);
	};

	const handlePlaySongFromPlaylist = (song: Song) => {
		if (playlist && playlist.songs.length > 0) {
			const playlistSongs = playlist.songs;
			const currentSongIndex = playlistSongs.findIndex(s => s.id === song.id);
			addToQueue(playlistSongs, currentSongIndex);
			playSong(song);
		} else {
			playSong(song);
		}
	};

	// Get playlist image - use first song's album art or placeholder
	const getPlaylistImage = () => {
		if (playlist && playlist.songs.length > 0 && playlist.songs[0].albumArt) {
			return playlist.songs[0].albumArt;
		}
		return '/placeholder-album.png';
	};

	// Calculate total duration
	const getTotalDuration = () => {
		if (!playlist || playlist.songs.length === 0) return '0:00';
		const totalSeconds = playlist.songs.reduce((acc, song) => acc + (song.duration || 0), 0);
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;
		if (hours > 0) {
			return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
		}
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	};

	if (!isLoaded) {
		return (
			<div className="min-h-screen bg-carbon flex items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<div className="w-12 h-12 rounded-full border-2 border-iron border-t-emerald animate-spin" />
					<p className="font-sans text-ash text-sm">Đang tải...</p>
				</div>
			</div>
		);
	}

	if (!isSignedIn) {
		return (
			<div className="min-h-screen bg-carbon flex items-center justify-center">
				<motion.div 
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="text-center px-6"
				>
					<div className="w-16 h-16 rounded-full bg-slate flex items-center justify-center mx-auto mb-4">
						<FaMusic size={24} className="text-ash" />
					</div>
					<h1 className="font-serif text-2xl text-snow mb-2">Yêu cầu đăng nhập</h1>
					<p className="font-sans text-ash">Đăng nhập để sử dụng tính năng này</p>
				</motion.div>
			</div>
		);
	}

	if (!playlist) {
		return (
			<div className="min-h-screen bg-carbon flex items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<div className="w-12 h-12 rounded-full border-2 border-iron border-t-emerald animate-spin" />
					<p className="font-sans text-ash text-sm">Đang tải playlist...</p>
				</div>
			</div>
		);
	}

	const isPlaylistPlaying = playlist.songs.some(song => currentSong?.id === song.id) && isPlaying;

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { staggerChildren: 0.05 }
		}
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 10 },
		visible: { opacity: 1, y: 0 }
	};

	return (
		<div className="min-h-screen bg-carbon relative">
			<BioluminescentBackground orbCount={2} intensity="low" />
			
			{/* Hero Header with gradient */}
			<div className="relative z-10">
				{/* Background gradient from album art */}
				{playlist.songs.length > 0 && playlist.songs[0].albumArt && (
					<div className="absolute inset-0 overflow-hidden h-80">
						<img 
							src={playlist.songs[0].albumArt}
							alt=""
							className="w-full h-full object-cover scale-110 filter blur-3xl opacity-20"
						/>
						<div className="absolute inset-0 bg-gradient-to-b from-carbon/0 via-carbon/50 to-carbon" />
					</div>
				)}

				{/* Header content */}
				<div className="relative px-4 pt-6 pb-8">
					{/* Back button */}
					<div className="flex items-center gap-3 mb-6">
						<motion.button
							whileTap={{ scale: 0.95 }}
							onClick={() => router.push('/')}
							className="w-10 h-10 rounded-full bg-concrete/50 border border-iron
								flex items-center justify-center
								text-silver hover:text-snow hover:border-emerald
								transition-all duration-200"
						>
							<FaArrowLeft size={16} />
						</motion.button>
					</div>

					{/* Playlist info */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="flex items-end gap-4"
					>
						{/* Playlist cover */}
						<div className={`
							w-32 h-32 rounded-lg overflow-hidden flex-shrink-0
							${isPlaylistPlaying ? 'ring-2 ring-emerald shadow-glow-sm' : 'ring-1 ring-iron'}
						`}>
							<img 
								src={getPlaylistImage()}
								alt={playlist.name}
								className="w-full h-full object-cover"
							/>
						</div>

						{/* Playlist details */}
						<div className="flex-1 min-w-0 pb-1">
							<p className="font-sans text-xs text-ash uppercase tracking-wider mb-1">
								Playlist
							</p>
							<h1 className="font-serif text-2xl text-snow truncate mb-2">
								{playlist.name}
							</h1>
							<div className="flex items-center gap-3">
								<span className="font-mono text-xs text-ash">
									{playlist.songs.length} bài
								</span>
								{playlist.songs.length > 0 && (
									<>
										<span className="text-iron">•</span>
										<span className="font-mono text-xs text-ash">
											{getTotalDuration()}
										</span>
									</>
								)}
							</div>
						</div>
					</motion.div>

					{/* Action buttons */}
					{playlist.songs.length > 0 && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.1 }}
							className="flex items-center gap-3 mt-6"
						>
							<motion.button
								whileTap={{ scale: 0.95 }}
								onClick={handlePlayAll}
								className="flex items-center gap-2 px-6 py-3 rounded-lg
									bg-gradient-glow text-void font-sans font-medium
									shadow-glow-sm hover:shadow-glow-md
									transition-shadow duration-200"
							>
								{isPlaylistPlaying ? <FaPause size={16} /> : <FaPlay size={16} className="ml-0.5" />}
								{isPlaylistPlaying ? 'Tạm dừng' : 'Phát tất cả'}
							</motion.button>

							<motion.button
								whileTap={{ scale: 0.95 }}
								onClick={() => router.push('/search')}
								className="w-12 h-12 rounded-lg bg-concrete border border-iron
									flex items-center justify-center
									text-silver hover:text-snow hover:border-emerald
									transition-all duration-200"
							>
								<FaSearch size={16} />
							</motion.button>
						</motion.div>
					)}
				</div>
			</div>

			{/* Songs list */}
			<div className="relative z-10 px-4 pb-32">
				{playlist.songs.length > 0 ? (
					<motion.div
						variants={containerVariants}
						initial="hidden"
						animate="visible"
						className="space-y-2"
					>
						{playlist.songs.map((song, index) => (
							<motion.div key={song.id} variants={itemVariants}>
								<SongItem 
									result={song}
									isSignedIn={isSignedIn}
									isFavorite={(id) => isFavorite(id)}
									handleFavoriteToggle={handleFavoriteToggle}
									handlePlaySong={handlePlaySongFromPlaylist}
								/>
							</motion.div>
						))}
					</motion.div>
				) : (
					/* Empty state */
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="flex flex-col items-center justify-center py-16 text-center"
					>
						<div className="w-16 h-16 rounded-full bg-slate flex items-center justify-center mb-4">
							<FaMusic size={24} className="text-ash" />
						</div>
						<p className="font-sans text-silver mb-2">Playlist trống</p>
						<p className="font-sans text-sm text-ash mb-6">
							Bắt đầu thêm bài hát bằng cách tìm kiếm
						</p>
						<motion.button
							whileTap={{ scale: 0.95 }}
							onClick={() => router.push('/search')}
							className="flex items-center gap-2 px-6 py-3 rounded-lg
								bg-concrete border border-iron
								text-silver hover:text-snow hover:border-emerald
								transition-all duration-200"
						>
							<FaSearch size={14} />
							Tìm kiếm bài hát
						</motion.button>
					</motion.div>
				)}
			</div>

			<MediaPlayer />
			<Navigation />
		</div>
	);
}
