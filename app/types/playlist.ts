export interface Song {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration?: number;
  albumArt?: string;
}

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  createdAt: number;
  description?: string;
}

export interface LocalStoragePlaylistManager {
  getPlaylists(): Playlist[];
  createPlaylist(name: string, description?: string): Playlist;
  addSongToPlaylist(playlistId: string, song: Song): void;
  removeSongFromPlaylist(playlistId: string, songId: string): void;
  deletePlaylist(playlistId: string): void;
  updatePlaylist(playlist: Playlist): void;
}

export class PlaylistManager implements LocalStoragePlaylistManager {
  private static STORAGE_KEY = 'quanvn_music_playlists';

  getPlaylists(): Playlist[] {
    if (typeof window === 'undefined') return [];
    
    const storedPlaylists = localStorage.getItem(PlaylistManager.STORAGE_KEY);
    return storedPlaylists ? JSON.parse(storedPlaylists) : [];
  }

  createPlaylist(name: string, description?: string): Playlist {
    const newPlaylist: Playlist = {
      id: crypto.randomUUID(),
      name,
      description,
      songs: [],
      createdAt: Date.now()
    };

    const playlists = this.getPlaylists();
    playlists.push(newPlaylist);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(PlaylistManager.STORAGE_KEY, JSON.stringify(playlists));
    }

    return newPlaylist;
  }

  addSongToPlaylist(playlistId: string, song: Song): void {
    const playlists = this.getPlaylists();
    const playlistIndex = playlists.findIndex(p => p.id === playlistId);

    if (playlistIndex !== -1) {
      // Ensure the song doesn't already exist in the playlist
      const songExists = playlists[playlistIndex].songs.some(s => s.id === song.id);
      
      if (!songExists) {
        playlists[playlistIndex].songs.push(song);
        
        if (typeof window !== 'undefined') {
          localStorage.setItem(PlaylistManager.STORAGE_KEY, JSON.stringify(playlists));
        }
      }
    }
  }

  removeSongFromPlaylist(playlistId: string, songId: string): void {
    const playlists = this.getPlaylists();
    const playlistIndex = playlists.findIndex(p => p.id === playlistId);

    if (playlistIndex !== -1) {
      playlists[playlistIndex].songs = playlists[playlistIndex].songs.filter(
        song => song.id !== songId
      );

      if (typeof window !== 'undefined') {
        localStorage.setItem(PlaylistManager.STORAGE_KEY, JSON.stringify(playlists));
      }
    }
  }

  deletePlaylist(playlistId: string): void {
    const playlists = this.getPlaylists();
    const updatedPlaylists = playlists.filter(p => p.id !== playlistId);

    if (typeof window !== 'undefined') {
      localStorage.setItem(PlaylistManager.STORAGE_KEY, JSON.stringify(updatedPlaylists));
    }
  }

  updatePlaylist(playlist: Playlist): void {
    const playlists = this.getPlaylists();
    const playlistIndex = playlists.findIndex(p => p.id === playlist.id);

    if (playlistIndex !== -1) {
      playlists[playlistIndex] = playlist;

      if (typeof window !== 'undefined') {
        localStorage.setItem(PlaylistManager.STORAGE_KEY, JSON.stringify(playlists));
      }
    }
  }
}
