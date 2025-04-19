import axios from 'axios';
import { config } from '../config/env';

const SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1';
const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_AUTHORIZE_URL = 'https://accounts.spotify.com/authorize';

interface SpotifyAlbum {
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
}

// This function is for client credentials flow (server-to-server)
export const getAccessToken = async (): Promise<string | null> => {
  try {
    if (!config.spotify.clientId || !config.spotify.clientSecret) {
      console.error('Missing client credentials. Please check your .env file.');
      return null;
    }

    const authString = `${config.spotify.clientId}:${config.spotify.clientSecret}`;
    const base64Auth = Buffer.from(authString).toString('base64');

    console.log('Attempting to get access token...');
    const response = await axios.post(
      SPOTIFY_AUTH_URL,
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${base64Auth}`,
        },
      }
    );

    if (response.data.access_token) {
      console.log('Successfully obtained access token');
      return response.data.access_token;
    } else {
      console.error('No access token in response:', response.data);
      return null;
    }
  } catch (error: any) {
    if (error.response) {
      console.error('Spotify API Error:', {
        status: error.response.status,
        data: error.response.data,
      });
    } else {
      console.error('Error fetching access token:', error.message);
    }
    return null;
  }
};

// This function initiates the authorization code flow for Web Playback SDK
export const initiateSpotifyAuth = () => {
  if (!config.spotify.clientId || !config.spotify.redirectUri) {
    console.error('Missing client ID or redirect URI. Please check your .env file.');
    return;
  }

  const scope = 'streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state';
  const state = generateRandomString(16);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.spotify.clientId,
    scope: scope,
    redirect_uri: config.spotify.redirectUri,
    state: state
  });

  window.location.href = `${SPOTIFY_AUTHORIZE_URL}?${params.toString()}`;
};

// This function exchanges the authorization code for an access token
export const getAuthTokenFromCode = async (code: string): Promise<string | null> => {
  try {
    if (!config.spotify.clientId || !config.spotify.clientSecret || !config.spotify.redirectUri) {
      console.error('Missing client credentials. Please check your .env file.');
      return null;
    }

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: config.spotify.redirectUri
    });

    const authString = `${config.spotify.clientId}:${config.spotify.clientSecret}`;
    const base64Auth = Buffer.from(authString).toString('base64');

    const response = await axios.post(SPOTIFY_AUTH_URL, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${base64Auth}`,
      },
    });

    if (response.data.access_token) {
      return response.data.access_token;
    }
    return null;
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    return null;
  }
};

// Helper function to generate random string for state parameter
function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export const getAlbumCover = async (
  songName: string,
  artistName: string,
  accessToken: string
): Promise<string | null> => {
  try {
    // Search for the track
    const searchResponse = await axios.get(
      `${SPOTIFY_API_BASE_URL}/search`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          q: `track:${songName} artist:${artistName}`,
          type: 'track',
          limit: 1,
        },
      }
    );

    const track = searchResponse.data.tracks.items[0];
    if (!track) {
      return null;
    }

    // Get the album details
    const albumResponse = await axios.get<SpotifyAlbum>(
      `${SPOTIFY_API_BASE_URL}/albums/${track.album.id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // Return the medium-sized image (usually 300x300)
    const images = albumResponse.data.images;
    if (images.length > 0) {
      return images[1]?.url || images[0].url;
    }

    return null;
  } catch (error) {
    console.error('Error fetching album cover:', error);
    return null;
  }
}; 