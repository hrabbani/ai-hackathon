// Next.js automatically loads .env files from the root directory
// No need to use dotenv

export const config = {
  spotify: {
    clientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
    apiBaseUrl: process.env.NEXT_PUBLIC_SPOTIFY_API_BASE_URL || 'https://api.spotify.com/v1',
  },
};

// Log environment variables for debugging (excluding sensitive data)
console.log('Environment variables:', {
  SPOTIFY_CLIENT_ID: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
  SPOTIFY_REDIRECT_URI: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
  HAS_CLIENT_SECRET: !!process.env.SPOTIFY_CLIENT_SECRET,
}); 