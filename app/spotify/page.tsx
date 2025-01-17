"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SpotifyPlaylist, SpotifyPlaylistProps } from "../components/SpotifyPlaylist";

export default function SpotifyPage() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [playlists, setPlaylists] = useState<SpotifyPlaylistProps[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkSpotifyAuth = async () => {
            try {
                const req = fetch("/api/spotify/auth");
                const res = await req;
                const data = await res.json();

                if (data.status === 401) {
                    // Redirect to Spotify login route
                    window.location.href = "/api/spotify/login";
                } else {
                    setIsAuthenticated(true);
                    
                    // Fetch playlists
                    const playlistsRes = await fetch("/api/spotify/playlists");
                    const playlistsData = await playlistsRes.json();
                    setPlaylists(playlistsData.items);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error("Authentication check failed", error);
                setIsLoading(false);
            }
        };

        checkSpotifyAuth();
    }, []);

    if (isLoading) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-screen bg-gradient-to-b from-green-900 to-black text-white flex items-center justify-center"
            >
                <p>Loading...</p>
            </motion.div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gradient-to-b from-green-900 to-black text-white"
        >
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Your Spotify Playlists</h1>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {playlists.map((playlist) => (
                        <SpotifyPlaylist 
                            key={playlist.id} 
                            {...playlist} 
                        />
                    ))}
                </div>

                {playlists.length === 0 && (
                    <div className="text-center py-16 text-neutral-400">
                        No playlists found
                    </div>
                )}
            </div>
        </motion.div>
    );
}
