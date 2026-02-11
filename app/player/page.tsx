'use client'

import React, { useEffect, useState, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useQueue } from '../context/QueueContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaPlay, FaPause, FaStepBackward, FaStepForward, FaRandom, FaRetweet, FaBars, FaHeart, FaRegHeart, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useFavorites } from '../hooks/useFavorites';
import { useUser } from '@clerk/nextjs';

export default function FullScreenPlayer() {
	const router = useRouter();
	const { 
		currentSong, 
		isPlaying, 
		togglePlayPause, 
		playSong 
	} = usePlayer();
	const { 
		queue, 
		nextSong, 
		prevSong, 
		isLooping, 
		isShuffling, 
		setLooping, 
		setShuffling,
		removeFromQueue,
		addToQueue
	} = useQueue();
	const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

	const [showQueue, setShowQueue] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [volume, setVolume] = useState(1);
	const [previousVolume, setPreviousVolume] = useState(1);
	const { isLoaded, isSignedIn, user } = useUser();
	const queueRef = useRef<HTMLDivElement>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	useEffect(() => {
		const savedVolume = localStorage.getItem('musicPlayerVolume');
		setVolume(savedVolume ? parseFloat(savedVolume) : 1);
	}, []);

	useEffect(() => {
		const existingAudio = document.querySelector('audio') as HTMLAudioElement;
		
		if (existingAudio) {
			audioRef.current = existingAudio;
			
			const handleTimeUpdate = () => {
				setCurrentTime(existingAudio.currentTime);
				setDuration(existingAudio.duration);
			};

			existingAudio.addEventListener('timeupdate', handleTimeUpdate);
			return () => existingAudio.removeEventListener('timeupdate', handleTimeUpdate);
		}
	}, [currentSong]);

	useEffect(() => {
		localStorage.setItem('musicPlayerVolume', volume.toString());
		if (audioRef.current) {
			audioRef.current.volume = volume;
		}
	}, [volume]);

	const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newVolume = parseFloat(e.target.value);
		setVolume(newVolume);
		setPreviousVolume(newVolume);
	};

	const toggleMute = () => {
		if (audioRef.current) {
			if (audioRef.current.muted) {
				audioRef.current.muted = false;
				const restoreVolume = previousVolume > 0 ? previousVolume : 1;
				setVolume(restoreVolume);
			} else {
				audioRef.current.muted = true;
				setPreviousVolume(volume);
				setVolume(0);
			}
		}
	};

	const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!audioRef.current || !duration) return;
		const rect = e.currentTarget.getBoundingClientRect();
		const percent = (e.clientX - rect.left) / rect.width;
		audioRef.current.currentTime = percent * duration;
	};

	const formatTime = (time: number) => {
		if (isNaN(time)) return '0:00';
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);
		return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
	};

	if (!currentSong) {
		router.push('/');
		return;
	}

	if (!isLoaded) return null;

	const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

	return (
		<motion.div 
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="fixed inset-0 bg-carbon z-50 flex flex-col"
		>
			{/* Blurry Background */}
			{currentSong?.albumArt && (
				<div className="absolute inset-0 overflow-hidden">
					<img 
						src={currentSong.albumArt}
						alt=""
						className="w-full h-full object-cover scale-110 filter blur-3xl opacity-20"
					/>
					<div className="absolute inset-0 bg-gradient-to-b from-carbon/50 via-carbon/80 to-carbon" />
				</div>
			)}

			{/* Queue Overlay */}
			<AnimatePresence>
				{showQueue && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-void/60 backdrop-blur-sm z-30"
						onClick={() => setShowQueue(false)}
					/>
				)}
			</AnimatePresence>

			{/* Header */}
			<div className="relative z-40 flex justify-between items-center px-6 pt-12 pb-4">
				<motion.button
					whileTap={{ scale: 0.95 }}
					onClick={() => router.back()}
					className="w-10 h-10 rounded-full bg-concrete/50 border border-iron
						flex items-center justify-center
						text-silver hover:text-snow hover:border-emerald
						transition-all duration-200"
				>
					<FaChevronDown size={18} />
				</motion.button>
				
				<div className="flex items-center gap-3">
					{isSignedIn && (
						<motion.button
							whileTap={{ scale: 0.9 }}
							onClick={() => {
								if (currentSong) {
									if (isFavorite(currentSong.id)) {
										removeFromFavorites(currentSong.id);
									} else {
										addToFavorites(currentSong);
									}
								}
							}}
							className="w-10 h-10 rounded-full bg-concrete/50 border border-iron
								flex items-center justify-center
								transition-all duration-200"
						>
							{currentSong && isFavorite(currentSong.id) ? (
								<FaHeart size={18} className="text-red-400" />
							) : (
								<FaRegHeart size={18} className="text-silver hover:text-snow" />
							)}
						</motion.button>
					)}
					
					<motion.button
						whileTap={{ scale: 0.95 }}
						onClick={() => setShowQueue(!showQueue)}
						className="w-10 h-10 rounded-full bg-concrete/50 border border-iron
							flex items-center justify-center
							text-silver hover:text-snow hover:border-emerald
							transition-all duration-200"
					>
						<FaBars size={18} />
					</motion.button>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex-grow flex flex-col items-center justify-center px-8 relative z-20">
				{/* Album Art with Glow Ring */}
				<motion.div
					initial={{ scale: 0.9, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ type: 'spring', stiffness: 200, damping: 20 }}
					className="relative mb-8"
				>
					{/* Glow ring when playing */}
					{isPlaying && (
						<motion.div
							className="absolute -inset-3 rounded-2xl"
							animate={{
								boxShadow: [
									'0 0 20px rgba(74, 222, 128, 0.3)',
									'0 0 40px rgba(74, 222, 128, 0.4)',
									'0 0 20px rgba(74, 222, 128, 0.3)',
								]
							}}
							transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
						/>
					)}
					
					<div className={`
						w-64 h-64 md:w-80 md:h-80 rounded-xl overflow-hidden
						${isPlaying ? 'ring-2 ring-emerald/50' : 'ring-1 ring-iron'}
					`}>
						<img 
							src={currentSong.albumArt || '/placeholder-album.png'} 
							alt={currentSong.title}
							className="w-full h-full object-cover"
						/>
					</div>
				</motion.div>

				{/* Song Info */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="text-center mb-8 w-full max-w-sm"
				>
					<h1 className="font-serif text-2xl md:text-3xl text-snow mb-2 truncate">
						{currentSong.title}
					</h1>
					<p className="font-sans text-ash text-lg truncate">
						{currentSong.artist}
					</p>
				</motion.div>

				{/* Progress Bar */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="w-full max-w-sm mb-6"
				>
					{/* Progress track */}
					<div 
						className="relative h-1 bg-slate rounded-full cursor-pointer group"
						onClick={handleSeek}
					>
						{/* Progress fill */}
						<div 
							className="absolute left-0 top-0 bottom-0 bg-gradient-glow rounded-full"
							style={{ width: `${progress}%` }}
						/>
						{/* Scrubber */}
						<div 
							className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-mint rounded-full 
								opacity-0 group-hover:opacity-100 transition-opacity shadow-glow-sm"
							style={{ left: `calc(${progress}% - 6px)` }}
						/>
					</div>
					
					{/* Time labels */}
					<div className="flex justify-between mt-2">
						<span className="font-mono text-xs text-ash">
							{formatTime(currentTime)}
						</span>
						<span className="font-mono text-xs text-ash">
							{formatTime(duration)}
						</span>
					</div>
				</motion.div>

				{/* Volume Control - Desktop */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.3 }}
					className="hidden lg:flex items-center gap-3 w-full max-w-sm mb-8"
				>
					<motion.button
						whileTap={{ scale: 0.95 }}
						onClick={toggleMute}
						className="text-silver hover:text-snow transition-colors"
					>
						{volume > 0 ? <FaVolumeUp size={20} /> : <FaVolumeMute size={20} />}
					</motion.button>
					<div className="relative flex-grow h-1 bg-slate rounded-full group">
						<div 
							className="absolute left-0 top-0 bottom-0 bg-mint rounded-full"
							style={{ width: `${volume * 100}%` }}
						/>
						<input 
							type="range" 
							min={0} 
							max={1} 
							step={0.01} 
							value={volume} 
							onChange={handleVolumeChange}
							className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
						/>
					</div>
				</motion.div>

				{/* Playback Controls */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
					className="flex items-center justify-center gap-6"
				>
					<motion.button
						whileTap={{ scale: 0.95 }}
						onClick={() => setShuffling(!isShuffling)}
						className={`p-3 rounded-full transition-all duration-200 ${
							isShuffling 
								? 'text-mint bg-emerald/10' 
								: 'text-ash hover:text-silver'
						}`}
					>
						<FaRandom size={20} />
					</motion.button>
					
					<motion.button
						whileTap={{ scale: 0.95 }}
						onClick={() => {
							const prevTrack = prevSong();
							if (prevTrack) playSong(prevTrack);
						}}
						className="w-12 h-12 rounded-full bg-concrete border border-iron
							flex items-center justify-center
							text-snow hover:border-emerald hover:shadow-glow-sm
							transition-all duration-200"
					>
						<FaStepBackward size={20} />
					</motion.button>
					
					<motion.button
						whileTap={{ scale: 0.9 }}
						onClick={togglePlayPause}
						className="w-16 h-16 rounded-full bg-gradient-glow
							flex items-center justify-center
							text-void shadow-glow-md hover:shadow-glow-lg
							transition-shadow duration-200"
					>
						{isPlaying ? <FaPause size={24} /> : <FaPlay size={24} className="ml-1" />}
					</motion.button>
					
					<motion.button
						whileTap={{ scale: 0.95 }}
						onClick={() => {
							const nextTrack = nextSong();
							if (nextTrack) playSong(nextTrack);
						}}
						className="w-12 h-12 rounded-full bg-concrete border border-iron
							flex items-center justify-center
							text-snow hover:border-emerald hover:shadow-glow-sm
							transition-all duration-200"
					>
						<FaStepForward size={20} />
					</motion.button>
					
					<motion.button
						whileTap={{ scale: 0.95 }}
						onClick={() => setLooping(!isLooping)}
						className={`p-3 rounded-full transition-all duration-200 ${
							isLooping 
								? 'text-mint bg-emerald/10' 
								: 'text-ash hover:text-silver'
						}`}
					>
						<FaRetweet size={20} />
					</motion.button>
				</motion.div>
			</div>

			{/* Queue Panel */}
			<AnimatePresence>
				{showQueue && (
					<motion.div
						ref={queueRef}
						initial={{ y: '100%' }}
						animate={{ y: 0 }}
						exit={{ y: '100%' }}
						transition={{ type: 'spring', stiffness: 300, damping: 30 }}
						className="fixed bottom-0 left-0 right-0 bg-concrete rounded-t-2xl 
							max-h-[70%] z-40 overflow-hidden border-t border-iron"
					>
						{/* Queue header */}
						<div className="flex justify-between items-center p-4 border-b border-iron">
							<h2 className="font-sans text-lg font-medium text-snow">
								Hàng đợi
							</h2>
							<span className="font-mono text-xs text-ash">
								{queue.length} bài
							</span>
						</div>
						
						{/* Queue list */}
						<div className="overflow-y-auto max-h-[calc(70vh-80px)] pb-safe">
							{queue.map((song, index) => (
								<motion.div
									key={`${song.id}-${index}`}
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: index * 0.05 }}
									className={`
										flex items-center gap-3 p-4 border-b border-iron/50
										cursor-pointer transition-colors duration-200
										${currentSong.id === song.id 
											? 'bg-emerald/10 border-l-2 border-l-emerald' 
											: 'hover:bg-slate'
										}
									`}
									onClick={() => {
										addToQueue([song]);
										playSong(song);
										setShowQueue(false);
									}}
								>
									<img 
										src={song.albumArt || '/placeholder-album.png'}
										alt={song.title}
										className="w-12 h-12 rounded-md object-cover ring-1 ring-iron"
									/>
									<div className="flex-1 min-w-0">
										<p className={`
											font-sans font-medium truncate
											${currentSong.id === song.id ? 'text-mint' : 'text-snow'}
										`}>
											{song.title}
										</p>
										<p className="font-sans text-sm text-ash truncate">
											{song.artist}
										</p>
									</div>
								</motion.div>
							))}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
}
