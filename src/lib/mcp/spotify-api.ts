import SpotifyWebApi from "spotify-web-api-node";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const requiredEnvVars = [
  "SPOTIFY_CLIENT_ID",
  "SPOTIFY_CLIENT_SECRET",
  "SPOTIFY_REDIRECT_URI",
];
requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

// Define interfaces for the different item types
export interface SpotifyTrack {
  id: string;
  name: string;
  uri: string;
  artist: string;
  album: string;
  duration_ms: number;
  popularity: number;
}

interface SpotifyAlbum {
  id: string;
  name: string;
  uri: string;
  artist: string;
  release_date: string;
  total_tracks: number;
}

interface SpotifyArtist {
  id: string;
  name: string;
  uri: string;
  genres: string[];
  popularity: number;
}

interface SpotifyPlaylist {
  id: string;
  name: string;
  uri: string;
  owner: string;
  tracks_total: number;
}

// Define the search results interface
interface SearchResults {
  tracks?: SpotifyTrack[];
  albums?: SpotifyAlbum[];
  artists?: SpotifyArtist[];
  playlists?: SpotifyPlaylist[];
}

type SearchType = "track" | "album" | "artist" | "playlist";

/**
 * SpotifyClient manages the connection to the Spotify Web API.
 * It handles authentication and provides methods to search for music.
 */
export class SpotifyClient {
  private api: SpotifyWebApi;
  private tokenExpirationTime: number = 0;

  constructor() {
    // Initialize the Spotify API client with credentials from environment variables
    this.api = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      redirectUri: process.env.SPOTIFY_REDIRECT_URI,
    });
  }

  /**
   * Ensures the client has a valid access token before making API calls.
   */
  private async ensureToken(): Promise<void> {
    const now = Date.now();

    // Check if token is expired or will expire soon
    if (now >= this.tokenExpirationTime - 60000) {
      // Get a new client credentials token
      const data = await this.api.clientCredentialsGrant();

      // Set the access token and when it will expire
      this.api.setAccessToken(data.body.access_token);
      this.tokenExpirationTime = now + data.body.expires_in * 1000;

      console.log("Retrieved new Spotify access token");
    }
  }

  /**
   * Searches Spotify for tracks, albums, artists, or playlists.
   *
   * @param query Search query text
   * @param type Type of items to search for (track, album, artist, playlist)
   * @param limit Maximum number of results to return
   * @returns Formatted search results
   */
  async search(
    query: string,
    type: SearchType = "track",
    limit: number = 10
  ): Promise<SearchResults> {
    try {
      // Ensure we have a valid token
      await this.ensureToken();

      // Perform the search
      const response = await this.api.search(
        query,
        [type as "track" | "album" | "artist" | "playlist"],
        { limit }
      );

      // Format the results based on the type
      return this.parseSearchResults(response.body, type);
    } catch (error) {
      console.error("Error searching Spotify:", error);
      throw error;
    }
  }
  /**
   * Parses and formats search results from Spotify API.
   *
   * @param results Raw search results from Spotify API
   * @param type Type of items that were searched
   * @returns Formatted search results
   */
  private parseSearchResults(
    results: SpotifyApi.SearchResponse,
    type: SearchType
  ): SearchResults {
    const formattedResults: SearchResults = {};

    // Process different result types
    if (type.includes("track") && results.tracks) {
      formattedResults.tracks = results.tracks.items.map((track) => ({
        id: track.id,
        name: track.name,
        uri: track.uri,
        artist: track.artists.map((a) => a.name).join(", "),
        album: track.album.name,
        duration_ms: track.duration_ms,
        popularity: track.popularity,
      }));
    }

    if (type.includes("album") && results.albums) {
      formattedResults.albums = results.albums.items.map((album) => ({
        id: album.id,
        name: album.name,
        uri: album.uri,
        artist: album.artists.map((a) => a.name).join(", "),
        release_date: album.release_date,
        total_tracks: album.total_tracks,
      }));
    }

    if (type.includes("artist") && results.artists) {
      formattedResults.artists = results.artists.items.map((artist) => ({
        id: artist.id,
        name: artist.name,
        uri: artist.uri,
        genres: artist.genres,
        popularity: artist.popularity,
      }));
    }

    if (type.includes("playlist") && results.playlists) {
      formattedResults.playlists = results.playlists.items.map((playlist) => ({
        id: playlist.id,
        name: playlist.name,
        uri: playlist.uri,
        owner: playlist.owner.display_name || "Unknown Owner",
        tracks_total: playlist.tracks.total,
      }));
    }

    return formattedResults;
  }
}

// Create and export a singleton instance
export const spotifyClient = new SpotifyClient();
