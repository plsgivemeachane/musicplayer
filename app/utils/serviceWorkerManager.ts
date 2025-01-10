
interface DownloadProgress {
  percentComplete: number;
  loaded: number;
  total: number;
}

export class ServiceWorkerManager {
  private serviceWorker: ServiceWorker | null = null;
  private progressListeners: Map<string, (progress: DownloadProgress) => void> = new Map();

  constructor() {
    this.initServiceWorker();
  }

  private async initServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/blob-processor-sw.js');
        
        // Wait for the service worker to be active
        this.serviceWorker = registration.active || await new Promise<ServiceWorker>((resolve) => {
          registration.addEventListener('activate', () => {
            resolve(registration.active!);
          });
        });

        // Add message listener for progress updates
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data.type === 'PROGRESS') {
            const { songId, percentComplete, loaded, total } = event.data;
            const listener = this.progressListeners.get(songId);
            if (listener) {
              listener({ percentComplete, loaded, total });
            }
          }
        });

        console.log('Service Worker registered successfully');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  async processBlob(
    songData: { 
      url: string, 
      songId: string, 
      songTitle: string 
    },
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<{ 
    blobUrl: string | null, 
    error?: string 
  }> {
    // Register progress listener if provided
    if (onProgress) {
      this.progressListeners.set(songData.songId, onProgress);
    }

    return new Promise((resolve) => {
      // Create a message channel for two-way communication
      const channel = new MessageChannel();
      
      channel.port1.onmessage = (event) => {
        const { type, blobUrl, error, songId, songTitle } = event.data;
        
        // Remove progress listener
        this.progressListeners.delete(songId);

        switch(type) {
          case 'COMPLETE':
            resolve({ blobUrl, error: undefined });
            break;
          case 'ERROR':
            console.warn(`Service Worker blob processing error for song ${songTitle} (${songId}):`, error);
            resolve({ blobUrl: null, error });
            break;
        }
      };

      // Ensure service worker is ready before sending message
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage(
          { 
            type: 'PROCESS_BLOB', 
            songData 
          }, 
          [channel.port2]
        );
      } else {
        console.warn('No active service worker controller');
        resolve({ blobUrl: null, error: 'No active service worker' });
      }
    });
  }
}

export const serviceWorkerManager = new ServiceWorkerManager();
