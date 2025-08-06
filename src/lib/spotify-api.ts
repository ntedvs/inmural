import { checkAuthStatus } from './spotify-auth';
import type { SpotifyTopTracksResponse, TimeRange, ImageQuality, AlbumCover, SpotifyImage } from '@/types/spotify';

export async function fetchTopTracks(
  timeRange: TimeRange,
  limit: number = 50,
  offset: number = 0
): Promise<SpotifyTopTracksResponse> {
  const isAuthenticated = await checkAuthStatus();
  
  if (!isAuthenticated) {
    throw new Error('Not authenticated');
  }

  const params = new URLSearchParams({
    time_range: timeRange,
    limit: String(Math.min(limit, 50)), // Enforce limit
    offset: String(Math.max(offset, 0)), // Ensure non-negative
  });

  const response = await fetch(`/api/spotify/top-tracks?${params}`, {
    credentials: 'include'
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized - please login again');
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch top tracks: ${response.statusText}`);
  }

  return response.json();
}

function getImageByQuality(images: SpotifyImage[], quality: ImageQuality): string {
  if (!images || images.length === 0) {
    return '/placeholder-album.png';
  }

  const sortedImages = [...images].sort((a, b) => (b.width || 0) - (a.width || 0));

  switch (quality) {
    case 'low':
      return sortedImages[sortedImages.length - 1]?.url || sortedImages[0].url;
    case 'medium':
      const mediumImage = sortedImages.find(img => 
        img.width && img.width >= 200 && img.width <= 400
      );
      return mediumImage?.url || sortedImages[Math.floor(sortedImages.length / 2)]?.url || sortedImages[0].url;
    case 'high':
      return sortedImages[0].url;
    default:
      return sortedImages[0].url;
  }
}

export async function fetchUniqueAlbumCovers(
  width: number,
  height: number,
  quality: ImageQuality,
  timeRange: TimeRange
): Promise<AlbumCover[]> {
  const requiredCovers = width * height;
  const uniqueAlbums = new Map<string, AlbumCover>();
  let offset = 0;
  const limit = 50;
  let hasMore = true;

  while (uniqueAlbums.size < requiredCovers && hasMore) {
    try {
      const response = await fetchTopTracks(timeRange, limit, offset);
      
      for (const track of response.items) {
        const imageUrl = getImageByQuality(track.album.images, quality);
        
        if (!uniqueAlbums.has(imageUrl)) {
          uniqueAlbums.set(imageUrl, {
            id: track.album.id,
            name: track.album.name,
            imageUrl: imageUrl,
            artistName: track.artists[0]?.name || 'Unknown Artist',
            spotifyUri: track.album.uri,
            externalUrl: track.album.external_urls.spotify,
          });
        }
        
        if (uniqueAlbums.size >= requiredCovers) {
          break;
        }
      }

      hasMore = response.next !== null;
      offset += limit;

      if (offset >= 200) {
        console.warn('Reached maximum offset, may not have enough unique albums');
        break;
      }
    } catch (error) {
      console.error('Error fetching tracks:', error);
      throw error;
    }
  }

  const covers = Array.from(uniqueAlbums.values()).slice(0, requiredCovers);
  
  if (covers.length < requiredCovers) {
    const remaining = requiredCovers - covers.length;
    for (let i = 0; i < remaining; i++) {
      covers.push({
        id: `placeholder-${i}`,
        name: 'No Album',
        imageUrl: '/placeholder-album.png',
        artistName: 'Add more music to your library',
        spotifyUri: '',
        externalUrl: '',
      });
    }
  }

  return covers;
}