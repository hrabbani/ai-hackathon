import React, { useEffect, useState } from 'react';
import SongIcon from '../components/SongIcon';
import { getAlbumCover, getAccessToken } from '../utils/spotifyApi';

const SongPage: React.FC = () => {
  const [albumArtUrl, setAlbumArtUrl] = useState<string>('');

  useEffect(() => {
    const fetchAlbumCover = async () => {
      console.log('Fetching access token...');
      const accessToken = await getAccessToken();
      console.log('Access token received:', accessToken ? 'Yes' : 'No');
      
      if (!accessToken) {
        console.error('Failed to get access token');
        return;
      }

      console.log('Fetching album cover...');
      const url = await getAlbumCover(
        'It Could Be Sweet',
        'Portishead',
        accessToken
      );
      console.log('Album cover URL:', url);
      
      if (url) {
        setAlbumArtUrl(url);
      }
    };

    fetchAlbumCover();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <SongIcon
        albumArtUrl={albumArtUrl || 'https://via.placeholder.com/300'} // Fallback to placeholder if no image is found
        title="It Could Be Sweet"
        artist="Portishead"
      />
    </div>
  );
};

export default SongPage; 