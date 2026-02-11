'use client'

import Image from "next/image";
import { useState, useEffect, Suspense } from 'react';
import { FaPlay, FaPause, FaHeart, FaPlus, FaSearch, FaRegHeart, FaArrowLeft } from 'react-icons/fa';
import { useSearchParams } from 'next/navigation';
import { usePlayer } from "../context/PlayerContext";
import { useQueue } from '../context/QueueContext';
import { useRouter } from 'next/navigation';
import MediaPlayer from '../components/MediaPlayer';
import Navigation from '../components/Navigation';
import BioluminescentBackground from '../components/BioluminescentBackground';
import { motion } from "framer-motion";
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
			<div className="min-h-screen bg-carbon flex items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<div className="w-12 h-12 rounded-full border-2 border-iron border-t-emerald animate-spin" />
					<p className="font-sans text-ash text-sm">Đang tải...</p>
				</div>
			</div>
		}>
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
	const { playSong, currentSong, isPlaying } = usePlayer();
	const { addToQueue } = useQueue();
	const router = useRouter();
	const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
	const { isLoaded, isSignedIn, user } = useUser();

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

	const handleFavoriteToggle = (result: SearchResult) => {
		const song: Song = {
			id: result.videoId,
			title: result.name,
			artist: result.artist.name,
			albumArt: result.thumbnails[0]?.url,
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

	if (error) {
		return (
			<div className="min-h-screen bg-carbon p-4">
				<div className="max-w-md mx-auto">
					<div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
						<p className="text-red-400 font-sans">Lỗi: {error}</p>
					</div>
				</div>
			</div>
		);
	}

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
			
			{/* Main Content */}
			<div className="relative z-10 max-w-md mx-auto px-4 pt-6 pb-32">
				{/* Header with back button */}
				<div className="flex items-center gap-3 mb-6">
					<motion.button
						whileTap={{ scale: 0.95 }}
						onClick={() => router.push('/')}
						className="w-10 h-10 rounded-full bg-concrete border border-iron
							flex items-center justify-center
							text-silver hover:text-snow hover:border-emerald
							transition-all duration-200"
					>
						<FaArrowLeft size={16} />
					</motion.button>
					
					<div className="flex-1">
						<h1 className="font-serif text-2xl text-snow">Tìm kiếm</h1>
					</div>
				</div>

				{/* Search Input */}
				<motion.div 
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					className="mb-6"
				>
					<div className="relative">
						<input 
							type="text" 
							placeholder="Bài hát, nghệ sĩ, album..." 
							value={nestedSearchQuery}
							onChange={(e) => setNestedSearchQuery(e.target.value)}
							onKeyDown={handleKeyDown}
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

				{/* Results Section */}
				{isLoading ? (
					<motion.div
						variants={containerVariants}
						initial="hidden"
						animate="visible"
						className="space-y-3"
					>
						{[...Array(7).keys()].map((i) => (
							<motion.div
								key={i}
								variants={itemVariants}
								className="bg-concrete rounded-lg p-3 border border-iron"
							>
								<div className="flex items-center gap-3">
									{/* Shimmer album art placeholder */}
									<div className="w-12 h-12 rounded-md bg-slate shimmer" />
									<div className="flex-1 space-y-2">
										<div className="h-4 bg-slate rounded shimmer w-3/4" />
										<div className="h-3 bg-slate rounded shimmer w-1/2" />
									</div>
								</div>
							</motion.div>
						))}
					</motion.div>
				) : searchResults.length > 0 ? (
					<>
						{/* Results count */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="mb-4"
						>
							<p className="font-sans text-xs text-ash uppercase tracking-wider">
								{searchResults.length} kết quả cho "{queryParam}"
							</p>
						</motion.div>

						{/* Results list */}
						<motion.div
							variants={containerVariants}
							initial="hidden"
							animate="visible"
							className="space-y-2"
						>
							{searchResults.map((result, index) => (
								<motion.div key={result.videoId} variants={itemVariants}>
									<SongItem 
										result={result}
										isSignedIn={isSignedIn}
										isFavorite={isFavorite}
										handleFavoriteToggle={handleFavoriteToggle}
										handlePlaySong={handlePlaySong}
									/>
								</motion.div>
							))}
						</motion.div>
					</>
				) : (
					/* Empty state */
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="flex flex-col items-center justify-center py-16 text-center"
					>
						<div className="w-16 h-16 rounded-full bg-slate flex items-center justify-center mb-4">
							<FaSearch size={24} className="text-ash" />
						</div>
						<p className="font-sans text-silver mb-1">Không có kết quả</p>
						<p className="font-sans text-sm text-ash">
							Thử tìm kiếm với từ khóa khác
						</p>
					</motion.div>
				)}
			</div>

			<MediaPlayer />
			<Navigation />
		</div>
	);
}
