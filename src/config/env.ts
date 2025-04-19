import dotenv from 'dotenv';

dotenv.config();

console.log('Environment variables loaded:');
console.log('SPOTIFY_CLIENT_ID:', process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID ? 'Present' : 'Missing');
console.log('SPOTIFY_CLIENT_SECRET:', process.env.SPOTIFY_CLIENT_SECRET ? 'Present' : 'Missing');
console.log('SPOTIFY_REDIRECT_URI:', process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI ? 'Present' : 'Missing');

export const config = {
  spotify: {
    clientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    accessToken: process.env.SPOTIFY_ACCESS_TOKEN,
    redirectUri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
    apiBaseUrl: process.env.NEXT_PUBLIC_SPOTIFY_API_BASE_URL || 'https://api.spotify.com/v1',
  },
}; 