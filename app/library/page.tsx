'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaMusic, FaHeart, FaClock, FaPlay, FaArrowRight } from 'react-icons/fa';
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import MediaPlayer from '../components/MediaPlayer';
import Navigation from '../components/Navigation';
import BioluminescentBackground from '../components/BioluminescentBackground';
import { PrefetchKind } from 'next/dist/client/components/router-reducer/router-reducer-types';

interface Song {
	id: string;
	title: string;
	artist: string;
	duration: number;
	url?: string;
	albumArt?: string;
}

interface Playlist {
	id: string;
	name: string;
	songs: Song[];
}

export default function LibraryPage() {
	const { isLoaded, isSignedIn, user } = useUser();
	const router = useRouter();
	const [playlists, setPlaylists] = useState<Playlist[]>([]);
	const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);

	useEffect(() => {
		if (!isSignedIn) return;

		// Load playlists
		const storedPlaylists = JSON.parse(localStorage.getItem('playlists') || '[]');
		setPlaylists(storedPlaylists);

		// Load recently played (mock - in real app, this would come from a history store)
		const favoritesPlaylist = storedPlaylists.find((p: Playlist) => p.id === 'favorites');
		if (favoritesPlaylist && favoritesPlaylist.songs.length > 0) {
			setRecentlyPlayed(favoritesPlaylist.songs.slice(0, 4));
		}
	}, [isSignedIn]);

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
			<div className="min-h-screen bg-carbon relative">
				<BioluminescentBackground orbCount={2} intensity="low" />
				<div className="relative z-10 flex items-center justify-center min-h-screen">
					<motion.div 
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="text-center px-6"
					>
						<div className="w-16 h-16 rounded-full bg-slate flex items-center justify-center mx-auto mb-4">
							<FaMusic size={24} className="text-ash" />
						</div>
						<h1 className="font-serif text-2xl text-snow mb-2">Yêu cầu đăng nhập</h1>
						<p className="font-sans text-ash">Đăng nhập để xem thư viện của bạn</p>
					</motion.div>
				</div>
				<Navigation />
			</div>
		);
	}

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { staggerChildren: 0.1 }
		}
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0 }
	};

	const getImageForPlaylist = (playlist: Playlist) => {
		if (playlist.songs.length === 0) {
			return "https://picsum.photos/64/64?random=" + playlist.id;
		}
		return playlist.songs[0].albumArt ?? "";
	};

	return (
		<div className="min-h-screen bg-carbon relative">
			<BioluminescentBackground orbCount={2} intensity="low" />
			
			{/* Main Content */}
			<div className="relative z-10 max-w-md mx-auto px-4 pt-6 pb-32">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					className="mb-8"
				>
					<h1 className="font-serif text-3xl text-snow mb-1">Thư viện</h1>
					<p className="font-sans text-ash text-sm">
						{user?.firstName || 'Bạn'}
					</p>
				</motion.div>

				{/* Quick Access Section */}
				<motion.div
					variants={containerVariants}
					initial="hidden"
					animate="visible"
					className="grid grid-cols-2 gap-3 mb-8"
				>
					{/* Favorites Quick Access */}
					<motion.button
						variants={itemVariants}
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						onClick={() => router.push('/playlist?playlistId=favorites')}
						className="relative bg-concrete rounded-lg p-4 border border-iron
							hover:border-emerald/30 hover:shadow-glow-sm
							transition-all duration-200 text-left overflow-hidden group"
					>
						<div className="relative z-10">
							<div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center mb-3">
								<FaHeart size={18} className="text-red-400" />
							</div>
							<p className="font-sans font-medium text-snow text-sm">Yêu thích</p>
							<p className="font-mono text-xs text-ash mt-0.5">
								{playlists.find(p => p.id === 'favorites')?.songs.length || 0} bài
							</p>
						</div>
						<div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-glow 
							scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
					</motion.button>

					{/* Recently Played */}
					<motion.div
						variants={itemVariants}
						className="relative bg-concrete rounded-lg p-4 border border-iron
							transition-all duration-200 overflow-hidden"
					>
						<div className="relative z-10">
							<div className="w-10 h-10 rounded-lg bg-emerald/20 flex items-center justify-center mb-3">
								<FaClock size={18} className="text-emerald" />
							</div>
							<p className="font-sans font-medium text-snow text-sm">Gần đây</p>
							<p className="font-mono text-xs text-ash mt-0.5">
								{recentlyPlayed.length} bài
							</p>
						</div>
					</motion.div>
				</motion.div>

				{/* Playlists Section */}
				<motion.div
					variants={containerVariants}
					initial="hidden"
					animate="visible"
				>
					<div className="flex items-center justify-between mb-4">
						<h2 className="font-sans text-sm font-medium text-silver uppercase tracking-wider">
							Playlists
						</h2>
						<motion.button
							whileTap={{ scale: 0.95 }}
							onClick={() => router.push('/')}
							className="flex items-center gap-1 text-xs text-ash hover:text-mint transition-colors"
						>
							<span>Xem tất cả</span>
							<FaArrowRight size={10} />
						</motion.button>
					</div>

					<div className="space-y-3">
						{playlists.map((playlist) => (
							<motion.div
								key={playlist.id}
								variants={itemVariants}
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								className="group relative bg-concrete rounded-lg p-4 
									border border-iron
									hover:border-emerald/30 hover:shadow-glow-sm
									cursor-pointer transition-all duration-200"
								onClick={() => router.push(`/playlist?playlistId=${playlist.id}`)}
								onMouseEnter={() => {
									router.prefetch(`/playlist?playlistId=${playlist.id}`, {
										kind: PrefetchKind.FULL
									});
								}}
							>
								<div className="flex items-center gap-4">
									{/* Playlist image */}
									<div className="relative w-14 h-14 flex-shrink-0">
										<img 
											src={getImageForPlaylist(playlist)} 
											alt={playlist.name}
											className="w-full h-full rounded-md object-cover ring-1 ring-iron"
										/>
										{/* Play overlay */}
										<div className="absolute inset-0 rounded-md bg-void/60 
											opacity-0 group-hover:opacity-100 
											flex items-center justify-center
											transition-opacity duration-200">
											<FaPlay size={14} className="text-mint ml-0.5" />
										</div>
									</div>
									
									{/* Playlist info */}
									<div className="flex-1 min-w-0">
										<h3 className="font-sans font-medium text-snow truncate">
											{playlist.name}
										</h3>
										<p className="font-mono text-xs text-ash mt-0.5">
											{playlist.songs.length} bài
										</p>
									</div>
									
									{/* Arrow indicator */}
									<div className="text-ash group-hover:text-mint transition-colors">
										<FaArrowRight size={14} />
									</div>
								</div>
								
								{/* Green underline on hover */}
								<div className="absolute bottom-0 left-4 right-4 h-px 
									bg-gradient-glow scale-x-0 group-hover:scale-x-100 
									transition-transform origin-left duration-300" />
							</motion.div>
						))}
					</div>
				</motion.div>

				{/* Stats Section */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
					className="mt-8 p-4 bg-concrete rounded-lg border border-iron"
				>
					<h3 className="font-sans text-sm font-medium text-silver mb-4">
						Thống kê
					</h3>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<p className="font-mono text-2xl text-mint">
								{playlists.reduce((acc, p) => acc + p.songs.length, 0)}
							</p>
							<p className="font-sans text-xs text-ash">Tổng bài hát</p>
						</div>
						<div>
							<p className="font-mono text-2xl text-snow">
								{playlists.length}
							</p>
							<p className="font-sans text-xs text-ash">Playlists</p>
						</div>
					</div>
				</motion.div>
			</div>

			<MediaPlayer />
			<Navigation />
		</div>
	);
}
