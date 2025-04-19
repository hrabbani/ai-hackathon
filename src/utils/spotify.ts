import { config } from '../config/env';

const SPOTIFY_AUTHORIZE_URL = 'https://accounts.spotify.com/authorize';

export async function redirectToSpotifyAuth() {
  // Validate required parameters
  if (!config.spotify.clientId) {
    console.error('Spotify client ID is missing');
    throw new Error('Spotify client ID is required');
  }
  if (!config.spotify.redirectUri) {
    console.error('Spotify redirect URI is missing');
    throw new Error('Spotify redirect URI is required');
  }

  const params = new URLSearchParams({
    client_id: config.spotify.clientId,
    response_type: 'code',
    redirect_uri: config.spotify.redirectUri,
    scope: 'user-read-private user-read-email',
  });

  const authUrl = `${SPOTIFY_AUTHORIZE_URL}?${params.toString()}`;
  console.log('Redirecting to Spotify auth URL:', authUrl);
  window.location.href = authUrl;
}

export async function getAccessToken(code: string): Promise<string | null> {
  try {
    const response = await fetch('/api/auth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Token exchange error:', errorData);
      return null;
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
}

export async function getUserProfile(accessToken: string) {
  try {
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    return await response.json();
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
} 