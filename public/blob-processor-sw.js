const MAX_BLOB_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', async (event) => {
  if (event.data.type === 'PROCESS_BLOB') {
    const { url, songId, songTitle } = event.data.songData;
    
    try {
      console.log(`[ServiceWorker] Processing blob for song: ${songTitle}`);
      
      // First, check content length
      const headResponse = await fetch(url, { method: 'HEAD' });
      const contentLength = headResponse.headers.get('Content-Length');
      
      if (contentLength) {
        const size = parseInt(contentLength, 10);
        
        if (size > MAX_BLOB_SIZE_BYTES) {
          console.warn(`[ServiceWorker] Blob size (${size} bytes) exceeds maximum limit for song: ${songTitle}`);
          throw new Error('Blob size too large');
        }
      }
      
      // Download blob
      const response = await fetch(url);
      const blob = await response.blob();
      
      console.log(`[ServiceWorker] Downloaded blob size: ${blob.size} bytes for song: ${songTitle}`);
      
      // Validate blob size
      if (blob.size > MAX_BLOB_SIZE_BYTES) {
        console.warn(`[ServiceWorker] Downloaded blob size (${blob.size} bytes) exceeds maximum limit for song: ${songTitle}`);
        throw new Error('Downloaded blob size too large');
      }
      
      // Create blob URL
      const blobUrl = URL.createObjectURL(blob);
      
      console.log(`[ServiceWorker] Created blob URL for song: ${songTitle}`);
      
      // Send back blob URL
      event.ports[0].postMessage({ 
        blobUrl, 
        songId,
        songTitle 
      });
    } catch (error) {
      console.error(`[ServiceWorker] Error processing blob for song: ${songTitle}`, error);
      
      event.ports[0].postMessage({ 
        error: error.message,
        blobUrl: null,
        songId,
        songTitle
      });
    }
  }
});
