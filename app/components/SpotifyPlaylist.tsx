"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export interface SpotifyPlaylistProps {
    id: string;
    name: string;
    description?: string;
    images: Array<{
        url: string;
        height?: number;
        width?: number;
    }>;
    owner: {
        display_name?: string;
    };
    tracks: {
        total: number;
    };
}

export function SpotifyPlaylist({ 
    id, 
    name, 
    description, 
    images, 
    owner, 
    tracks 
}: SpotifyPlaylistProps) {
    // Select the largest available image, preferring 640x640
    const playlistImage = images.find(img => img.height === 640) || images[0];

    return (
        <motion.div 
            className="bg-neutral-800 rounded-lg p-4 flex items-center space-x-4 hover:bg-neutral-700 transition-colors"
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {playlistImage && (
                <Image 
                    src={playlistImage.url} 
                    alt={name} 
                    width={80} 
                    height={80} 
                    className="rounded-md"
                />
            )}
            <div className="flex-grow">
                <h3 className="text-white font-semibold text-lg">{name}</h3>
                {description && (
                    <p className="text-neutral-400 text-sm line-clamp-1">{description}</p>
                )}
                <div className="text-neutral-500 text-xs mt-1">
                    {owner.display_name} • {tracks.total} tracks
                </div>
            </div>
        </motion.div>
    );
}
