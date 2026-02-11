'use client'

import { openDB } from 'idb';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FaPlay, FaPause, FaStepBackward, FaStepForward, FaHeart, FaRegHeart } from 'react-icons/fa';
import { usePlayer } from '../context/PlayerContext';
import { useQueue } from '../context/QueueContext';
import { useFavorites } from '../hooks/useFavorites';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { songBlobProcessor } from '../utils/songBlobProcessor';

interface Song {
	id: string;
	title: string;
	artist: string;
	duration: number;
	albumArt?: string;
}

export default function MediaPlayer() {
	const { 
		currentSong, 
		isPlaying, 
		togglePlayPause,
		playSong
	} = usePlayer();
	const { 
		nextSong, 
		prevSong,
		queue
	} = useQueue();
	const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
	const { isLoaded, isSignedIn, user } = useUser();
	const router = useRouter();
	const audioRef = useRef<HTMLAudioElement>(null);

	const [processingUrls, setProcessingUrls] = useState<Set<string>>(new Set());

	const getSongBlobUrl = useCallback(async (song: Song, prefetchNext: boolean = true) => {
		return songBlobProcessor.getSongBlobUrl(song, {
			processingUrls,
			setProcessingUrls,
			nextSong,
			prefetchNext
		});
	}, [processingUrls, nextSong]);

	const MAX_RETRIES = 15;
	const RETRY_DELAY = 1000;

	const attemptPlay = async (audio: any, retryCount = 0) => {
		try {
			if (isPlaying) {
				await audio.play();
			}
		} catch (error) {
			console.error(`Playback error (Attempt ${retryCount + 1}):`, error);
			await audio.load();
			if (retryCount < MAX_RETRIES) {
				setTimeout(() => {
					attemptPlay(audio, retryCount + 1);
				}, RETRY_DELAY);
			} else {
				console.error('Max retries reached. Unable to play song.');
			}
		}
	};

	const [volume, setVolume] = useState(() => {
		const savedVolume = localStorage.getItem('musicPlayerVolume');
		return savedVolume ? parseFloat(savedVolume) : 1;
	});

	const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newVolume = parseFloat(e.target.value);
		setVolume(newVolume);
		localStorage.setItem('musicPlayerVolume', newVolume.toString());
		if (audioRef.current) {
			audioRef.current.volume = newVolume;
		}
	};

	const toggleMute = () => {
		if (audioRef.current) {
			audioRef.current.muted = !audioRef.current.muted;
			const newVolume = audioRef.current.muted ? 0 : 1;
			setVolume(newVolume);
			localStorage.setItem('musicPlayerVolume', newVolume.toString());
		}
	};

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;

		audio.onpause = () => {
			if (!isPlaying) return;
			console.error('Error loading audio:', audio.error);
			attemptPlay(audio);
		};
	}, [audioRef, isPlaying])

	useEffect(() => {
		const audio = audioRef.current;
		if (audio && currentSong) {
			const setupAudio = async () => {
				const blobUrl = await getSongBlobUrl(currentSong, true);
				audio.src = blobUrl;

				audio.onended = () => {
					const nextTrack = nextSong();
					if (nextTrack) {
						playSong(nextTrack);
					}
				};
				attemptPlay(audio);
			};

			setupAudio();
		}
	}, [currentSong?.id, playSong]);

	useEffect(() => {
		const audio = audioRef.current;
		if (audio) {
			if (isPlaying) {
				attemptPlay(audio);
			} else {
				audio.pause();
			}
		}
	}, [isPlaying]);

	useEffect(() => {
		const audio = audioRef.current;
		if (audio) {
			audio.volume = volume;
		}
	}, [volume]);

	useEffect(() => {
		const audio = audioRef.current;
		if ('mediaSession' in navigator && audio && currentSong) {
			navigator.mediaSession.metadata = new MediaMetadata({
				title: currentSong.title,
				artist: currentSong.artist,
				artwork: currentSong.albumArt 
					? [{ src: currentSong.albumArt, sizes: '96x96', type: 'image/png' }]
					: [{ src: '/placeholder-album.png', sizes: '96x96', type: 'image/png' }]
			});

			navigator.mediaSession.setActionHandler('play', () => {
				if (audio.paused) togglePlayPause();
			});

			navigator.mediaSession.setActionHandler('pause', () => {
				if (!audio.paused) togglePlayPause();
			});

			navigator.mediaSession.setActionHandler('previoustrack', () => {
				prevSong();
			});

			navigator.mediaSession.setActionHandler('nexttrack', () => {
				nextSong();
			});

			navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
		}
	}, [currentSong, prevSong, nextSong, isPlaying]);

	useEffect(() => {
		const cleanupInterval = setInterval(() => {
			// blobStorage.cleanupExpiredBlobs();
		}, 24 * 60 * 60 * 1000);

		return () => clearInterval(cleanupInterval);
	}, []);

	const handleFavoriteToggle = () => {
		if (!currentSong) return;
		if (isFavorite(currentSong.id)) {
			removeFromFavorites(currentSong.id);
		} else {
			addToFavorites(currentSong);
		}
	};

	if (!currentSong) return null;
	if (!isLoaded) return null;

	return (
		<motion.div 
			initial={{ y: 100, opacity: 0 }} 
			animate={{ y: 0, opacity: 1 }} 
			exit={{ y: 100, opacity: 0 }}
			transition={{ type: 'spring', stiffness: 300, damping: 30 }}
			className="fixed bottom-20 left-4 right-4 z-40 max-w-md mx-auto"
			onMouseEnter={() => router.prefetch('/player')}
			onClick={() => router.push('/player')}
		>
			<audio ref={audioRef} />
			
			{/* Glass card with glow effect when playing */}
			<div className={`
				relative glass rounded-lg p-4 
				border border-iron
				transition-all duration-300 ease-out
				cursor-pointer
				${isPlaying ? 'border-emerald/50 shadow-glow-sm' : 'hover:border-steel'}
			`}>
				{/* Pulsing glow ring when playing */}
				<AnimatePresence>
					{isPlaying && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="absolute inset-0 rounded-lg pointer-events-none"
							style={{
								boxShadow: '0 0 20px rgba(74, 222, 128, 0.2), inset 0 0 20px rgba(74, 222, 128, 0.05)'
							}}
						/>
					)}
				</AnimatePresence>

				<div className="flex items-center justify-between relative z-10">
					{/* Song info with album art */}
					<div className="flex items-center gap-3 flex-1 min-w-0">
						{/* Album art with playing ring */}
						<div className={`
							relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0
							${isPlaying ? 'ring-2 ring-emerald/50' : ''}
						`}>
							<img 
								src={currentSong.albumArt || '/placeholder-album.png'} 
								alt={currentSong.title}
								className="w-full h-full object-cover"
							/>
							{/* Playing indicator overlay */}
							{isPlaying && (
								<div className="absolute inset-0 bg-emerald/20 animate-pulse" />
							)}
						</div>
						
						{/* Title and artist */}
						<div className="min-w-0 flex-1">
							<p className="font-sans text-sm font-medium text-snow truncate">
								{currentSong.title}
							</p>
							<p className="font-sans text-xs text-ash truncate">
								{currentSong.artist}
							</p>
						</div>
						
						{/* Favorite button */}
						{isSignedIn && (
							<motion.button
								whileTap={{ scale: 0.9 }}
								onClick={handleFavoriteToggle}
								className="text-ash hover:text-red-400 transition-colors p-2 flex-shrink-0"
							>
								{isFavorite(currentSong.id) ? (
									<FaHeart size={18} className="text-red-400" />
								) : (
									<FaRegHeart size={18} />
								)}
							</motion.button>
						)}
					</div>

					{/* Playback controls */}
					<div className="flex items-center gap-2 flex-shrink-0 ml-2">
						<motion.button
							whileTap={{ scale: 0.95 }}
							onClick={(e) => {
								e.stopPropagation();
								prevSong();
							}}
							className="text-ash hover:text-silver transition-colors p-2 hidden sm:block"
						>
							<FaStepBackward size={18} />
						</motion.button>
						
						<motion.button
							whileTap={{ scale: 0.95 }}
							onClick={(e) => {
								e.stopPropagation();
								togglePlayPause();
							}}
							className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-glow text-void hover:shadow-glow-md transition-shadow"
						>
							{isPlaying ? <FaPause size={16} /> : <FaPlay size={16} className="ml-0.5" />}
						</motion.button>
						
						<motion.button
							whileTap={{ scale: 0.95 }}
							onClick={(e) => {
								e.stopPropagation();
								nextSong();
							}}
							className="text-ash hover:text-silver transition-colors p-2 hidden sm:block"
						>
							<FaStepForward size={18} />
						</motion.button>
					</div>
				</div>
			</div>
		</motion.div>
	);
}
