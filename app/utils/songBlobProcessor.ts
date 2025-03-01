import { Song } from '../types/song';
import { blobStorage } from './blobStorage';
import { serviceWorkerManager } from './serviceWorkerManager';

const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export interface SongBlobProcessorOptions {
  processingUrls: Set<string>;
  setProcessingUrls: React.Dispatch<React.SetStateAction<Set<string>>>;
  nextSong: (skipCurrent?: boolean) => Song | null;
  prefetchNext?: boolean;
}

export class SongBlobProcessor {
  private static instance: SongBlobProcessor;

  private constructor() {}

  public static getInstance(): SongBlobProcessor {
    if (!SongBlobProcessor.instance) {
      SongBlobProcessor.instance = new SongBlobProcessor();
    }
    return SongBlobProcessor.instance;
  }

  public async getStreamURL(id: string) {
    // Fetch to the server
    // const res = await fetch(`${NEXT_PUBLIC_BASE_URL}/v1/youtube/stream?v=${id}`);
    // const data : {
    //   success: boolean,
    //   url: string,
    //   videoId: string
    // } = await res.json();

    // if(data.success) {
    //   return data;
    // } else {
    //   return null;
    // }
    return `${NEXT_PUBLIC_BASE_URL}/v1/youtube/stream?v=${id}`
  }

  public async getSongBlobUrl(
    song: Song, 
    options: SongBlobProcessorOptions
  ): Promise<string> {
    const { 
      processingUrls, 
      setProcessingUrls, 
      nextSong, 
      prefetchNext = true 
    } = options;

    // Convert song url (depricated) to song_get_url
    const song_url = await this.getStreamURL(song.id)
    
    console.log(song_url)

    if(!song_url) {
      return "";
    }

    // const song_url = song_url.url;

    // Prevent multiple processing for the same song
    if (processingUrls.has(song.id)) {
      console.log(`[getSongBlobUrl] Song ${song.title} is already being processed. Skipping.`);
      return song_url;
    }

    // Check if blob is stored in cache
    const cachedBlob = await blobStorage.getBlob(song.id);
    if (cachedBlob) {
      console.log(`[getSongBlobUrl] Retrieved blob from cache for song: ${song.title}`);
      const blobUrl = URL.createObjectURL(cachedBlob);
      
      // Call getSongBlobUrl again with prefetchNext set to false to prefetch next song
      const nextTrack = nextSong(false);
      if (nextTrack && prefetchNext) {
        this.getSongBlobUrl(nextTrack, { 
          processingUrls, 
          setProcessingUrls, 
          nextSong, 
          prefetchNext: false 
        });
      }
      return blobUrl;
    }

    // Immediately return the original URL
    const originalUrl = song_url;

    // Create a background promise for processing
    const processingPromise = new Promise<string>(async (resolve, reject) => {
      try {
        // Add song to processing set
        setProcessingUrls(prev => new Set(prev).add(song.id));
        
        console.log(`[getSongBlobUrl] Starting background process for song: ${song.title} (ID: ${song.id})`);
        
        // Use Service Worker to process blob with progress tracking
        const { blobUrl, error } = await serviceWorkerManager.processBlob(
          {
            url: song_url,
            songId: song.id,
            songTitle: song.title
          },
        );

        // If blob processing fails, return original URL
        if (error || !blobUrl) {
          resolve("OK");
          return;
        }
        
        // Save blob to cache
        const blob = await (await fetch(blobUrl)).blob();
        await blobStorage.saveBlob(song.id, blob);

        // Prefetch next song if requested
        if (prefetchNext) {
          const nextTrack = nextSong(false);
          if (nextTrack) {
            this.getSongBlobUrl(nextTrack, { 
              processingUrls, 
              setProcessingUrls, 
              nextSong, 
              prefetchNext: false 
            });
          }
        }

        // Clean up processing state
        setProcessingUrls(prev => {
          const updated = new Set(prev);
          updated.delete(song.id);
          return updated;
        });
        resolve(blobUrl);
      } catch (error) {
        // Clean up processing state
        setProcessingUrls(prev => {
          const updated = new Set(prev);
          updated.delete(song.id);
          return updated;
        });

        // Log the error
        console.error('[getSongBlobUrl] Error in URL processing:', error);
        resolve("OK");
      }
    });

    // Start the processing promise in the background
    processingPromise.catch(error => {
      console.error('[getSongBlobUrl] Background processing error:', error);
    });

    // Immediately return the original URL
    return originalUrl;
  }
}

export const songBlobProcessor = SongBlobProcessor.getInstance();
