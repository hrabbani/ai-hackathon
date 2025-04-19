import { useEffect, useState } from 'react';

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: {
      Player: new (options: {
        name: string;
        getOAuthToken: (callback: (token: string) => void) => void;
        volume: number;
      }) => any;
    };
  }
}

interface SpotifyPlayerProps {
  accessToken: string;
}

interface PlayerState {
  track_window?: {
    current_track?: {
      name: string;
      artists: Array<{ name: string }>;
      album: {
        name: string;
        images: Array<{ url: string }>;
      };
    };
  };
  paused?: boolean;
  position?: number;
  duration?: number;
}

interface WebPlaybackReady {
  device_id: string;
}

export function SpotifyPlayer({ accessToken }: SpotifyPlayerProps) {
  const [player, setPlayer] = useState<any>(null);
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const spotifyPlayer = new window.Spotify.Player({
        name: 'Web Playback SDK',
        getOAuthToken: cb => cb(accessToken),
        volume: 0.5
      });

      spotifyPlayer.addListener('ready', ({ device_id }: WebPlaybackReady) => {
        console.log('Ready with Device ID', device_id);
        // Transfer playback to the new device
        fetch('https://api.spotify.com/v1/me/player', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            device_ids: [device_id],
            play: false
          })
        });
      });

      spotifyPlayer.addListener('player_state_changed', (state: PlayerState) => {
        if (!state) return;
        setPlayerState(state);
      });

      spotifyPlayer.addListener('not_ready', ({ device_id }: WebPlaybackReady) => {
        console.log('Device ID has gone offline', device_id);
      });

      spotifyPlayer.connect().then((success: boolean) => {
        if (success) {
          setIsActive(true);
        }
      });

      setPlayer(spotifyPlayer);
    };

    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, [accessToken]);

  if (!isActive) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Connecting to Spotify...</div>
      </div>
    );
  }

  const currentTrack = playerState?.track_window?.current_track;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex flex-col items-center gap-6">
        {/* Track Info */}
        {currentTrack && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">{currentTrack.name}</h2>
            <p className="text-gray-600">{currentTrack.artists[0].name}</p>
            {currentTrack.album.images[0] && (
              <img
                src={currentTrack.album.images[0].url}
                alt={`${currentTrack.album.name} cover`}
                className="w-64 h-64 mt-4 rounded-lg shadow-md"
              />
            )}
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => player.previousTrack()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 20L9 12L19 4V20Z" />
              <rect x="4" y="4" width="2" height="16" />
            </svg>
          </button>

          <button
            onClick={() => player.togglePlay()}
            className="p-3 hover:bg-gray-100 rounded-full transition-colors"
          >
            {playerState?.paused ? (
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            ) : (
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            )}
          </button>

          <button
            onClick={() => player.nextTrack()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 4L15 12L5 20V4Z" />
              <rect x="18" y="4" width="2" height="16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
} 