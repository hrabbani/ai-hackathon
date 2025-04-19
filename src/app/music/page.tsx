'use client';

import { useEffect, useState } from 'react';
import { getAccessToken } from '../../utils/spotifyApi';
import { SpotifyPlayer } from '../../components/SpotifyPlayer';

export default function MusicPage() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchToken = async () => {
      setIsLoading(true);
      const token = await getAccessToken();
      setAccessToken(token);
      setIsLoading(false);
    };

    fetchToken();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Connecting to Spotify...</p>
      </div>
    );
  }

  if (!accessToken) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Spotify Player</h1>
        <p className="text-lg text-gray-600 mb-4">
          Failed to connect to Spotify. Please check your credentials in the .env file.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SpotifyPlayer accessToken={accessToken} />
    </div>
  );
} 