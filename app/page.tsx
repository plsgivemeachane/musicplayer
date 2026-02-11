'use client'

import Image from "next/image";
import { useState, useRef, useEffect } from 'react';
import { FaSearch, FaPlus, FaPlay } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useUser } from "@clerk/nextjs";
import { usePlayer } from './context/PlayerContext';
import MediaPlayer from "./components/MediaPlayer";
import Navigation from "./components/Navigation";
import BioluminescentBackground from "./components/BioluminescentBackground";
import { motion } from 'framer-motion';
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
	const { isLoaded, isSignedIn, user } = useUser();
	const { playSong } = usePlayer();

	useEffect(() => {
		const storedPlaylists = playlistManager.getPlaylists();
		setPlaylists(storedPlaylists);

		if (storedPlaylists.length === 0) {
			const favoritesPlaylist = {
				id: 'favorites',
				name: 'Favorites',
				songs: []
			};
			
			const currentPlaylists = JSON.parse(localStorage.getItem('playlists') || '[]');
			const updatedPlaylists = [...currentPlaylists, favoritesPlaylist];
			localStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
			setPlaylists([...updatedPlaylists]);
		}
	}, []);

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

	const handleSearch = async () => {
		if (searchQuery.trim()) {
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
		if (hour < 12) return 'Chào buổi sáng';
		if (hour < 18) return 'Chào buổi chiều';
		return 'Chào buổi tối';
	};

	const getImageForPlaylist = (playlist: Playlist) => {
		if (playlist.songs.length === 0) {
			return "https://picsum.photos/64/64?random=" + playlist.id;
		}
		return playlist.songs[0].albumArt ?? "";
	};

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1
			}
		}
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0 }
	};

	return (
		<div className="min-h-screen bg-carbon relative">
			<BioluminescentBackground orbCount={3} intensity="low" />
			
			{/* Main Content */}
			<div className="relative z-10 max-w-md mx-auto px-4 pt-6 pb-32">
				{/* Search Section */}
				<motion.div 
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					className="mb-8"
				>
					<div className="relative">
						<input 
							type="text" 
							placeholder="Tìm kiếm bài hát, nghệ sĩ..." 
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							onKeyDown={handleKeyDown}
							onMouseEnter={() => router.prefetch(`/search`)}
							className="w-full bg-concrete text-snow px-4 py-3 pl-12 rounded-lg 
								border border-iron
								focus:outline-none focus:border-emerald focus:shadow-glow-sm
								placeholder:text-ash
								transition-all duration-200"
						/>
						<FaSearch 
							className="absolute left-4 top-1/2 -translate-y-1/2 text-ash cursor-pointer hover:text-mint transition-colors"
							onClick={handleSearch}
						/>
					</div>
				</motion.div>

				{/* Auth Gate */}
				{!isSignedIn && (
					<motion.div 
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="fixed inset-0 z-20 flex items-center justify-center bg-carbon/80 backdrop-blur-sm"
					>
						<div className="text-center px-6">
							<h1 className="font-serif text-2xl md:text-3xl text-snow mb-4">
								Đăng nhập để sử dụng playlists
							</h1>
							<p className="font-sans text-ash text-sm">
								Lưu trữ và đồng bộ nhạc yêu thích của bạn
							</p>
						</div>
					</motion.div>
				)}

				{/* Content with blur for non-auth users */}
				<div className={`relative ${!isSignedIn ? 'blur-md pointer-events-none' : ''}`}>
					{/* Greeting */}
					<motion.div 
						variants={itemVariants}
						initial="hidden"
						animate="visible"
						className="mb-6"
					>
						<h1 className="font-serif text-3xl text-snow mb-1">
							{getGreeting()}
						</h1>
						<p className="font-sans text-ash text-sm">
							{user?.firstName || 'Bạn'}
						</p>
					</motion.div>

					{/* Playlists Section */}
					<motion.div
						variants={containerVariants}
						initial="hidden"
						animate="visible"
						className="space-y-3"
					>
						<div className="flex items-center justify-between mb-4">
							<h2 className="font-sans text-sm font-medium text-silver uppercase tracking-wider">
								Playlists
							</h2>
							<motion.button
								whileTap={{ scale: 0.95 }}
								onClick={() => alert("Tính năng đang phát triển!")}
								className="w-8 h-8 rounded-full bg-slate border border-iron 
									flex items-center justify-center
									text-ash hover:text-mint hover:border-emerald
									transition-all duration-200"
							>
								<FaPlus size={12} />
							</motion.button>
						</div>

						{playlists.map((playlist, index) => (
							<motion.div
								key={playlist.id}
								variants={itemVariants}
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }
								}
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
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
											<path d="M9 18l6-6-6-6" />
										</svg>
									</div>
								</div>
								
								{/* Green underline on hover */}
								<div className="absolute bottom-0 left-4 right-4 h-px 
									bg-gradient-glow scale-x-0 group-hover:scale-x-100 
									transition-transform origin-left duration-300" />
							</motion.div>
						))}
					</motion.div>
				</div>
			</div>

			<MediaPlayer />
			<Navigation />
		</div>
	);
}
