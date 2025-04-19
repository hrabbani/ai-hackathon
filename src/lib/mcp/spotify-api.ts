import SpotifyWebApi from "spotify-web-api-node";
import dotenv from "dotenv";
import axios from "axios";

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
interface SpotifyTrack {
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
  acoustic_features?: Record<string, unknown>;
}

type SearchType = "track" | "album" | "artist" | "playlist";

// Define interfaces for the Spotify API responses and other types
interface SpotifyTrackInfo {
  name: string;
  isrc?: string;
  album?: string;
  mbid?: string;
  acoustic_features?: Record<string, unknown>;
}

// Generic interface for search response from Spotify API
interface SpotifyApiResponse {
  tracks?: {
    items: Array<{
      id: string;
      name: string;
      uri: string;
      artists: Array<{ name: string }>;
      album: { name: string };
      duration_ms: number;
      popularity: number;
      external_ids: { isrc?: string };
    }>;
  };
  albums?: {
    items: Array<{
      id: string;
      name: string;
      uri: string;
      artists: Array<{ name: string }>;
      release_date: string;
      total_tracks: number;
    }>;
  };
  artists?: {
    items: Array<{
      id: string;
      name: string;
      uri: string;
      genres: string[];
      popularity: number;
    }>;
  };
  playlists?: {
    items: Array<{
      id: string;
      name: string;
      uri: string;
      owner: { display_name?: string };
      tracks: { total: number };
    }>;
  };
}

// Define type for Spotify track response item to use in parseTrackInfo
interface SpotifyTrackResponseItem {
  id: string;
  name: string;
  uri: string;
  artists: { name: string }[];
  album: { name: string };
  duration_ms: number;
  popularity: number;
  external_ids: { isrc?: string };
}

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

      // NEED TO ADD MODEL LOGIC TO TRANSLATE QUERY PROPERLY
      console.log("Search Query:", query);

      // Perform the search
      const response = await this.api.search(query, [type], { limit });
      // Check if tracks exist in response before accessing
      if (response.body.tracks?.items) {
        console.log("Spotify response:", response.body.tracks.items);
      }

      console.log("Track names and ids:");
      let tracksWithFeatures: SpotifyTrackInfo[] = [];

      if (response.body.tracks?.items) {
        const trackInfo = this.parseTrackInfo(response.body.tracks.items);
        console.log("Track info:", trackInfo);

        // Get Music Brainz IDs
        const musicbrainzResult = await this.musicBrainzSearch(trackInfo);
        console.log("Musicbrainz api call result:", musicbrainzResult);

        // Get Acoustic Brainz features
        tracksWithFeatures = await this.acousticBrainzSearch(musicbrainzResult);
        console.log("Tracks with acoustic features:", tracksWithFeatures);
      }

      // Format the results based on the type
      const results = this.parseSearchResults(response.body, type);

      // Add acoustic features to the results if we have them
      if (tracksWithFeatures.length > 0 && results.tracks) {
        results.tracks = results.tracks.map((track) => {
          const trackWithFeatures = tracksWithFeatures.find(
            (t) => t.name === track.name
          );
          if (trackWithFeatures && trackWithFeatures.acoustic_features) {
            return {
              ...track,
              acoustic_features: trackWithFeatures.acoustic_features,
            };
          }
          return track;
        });
      }

      return results;
    } catch (error) {
      console.error("Error searching Spotify:", error);
      throw error;
    }
  }

  /**
   * Parses track information from Spotify API response for musicbrainz api.
   * @param tracks - Array of track objects from Spotify API response
   * @returns Array of objects with track name, isrc, and album
   */
  public parseTrackInfo(
    tracks: SpotifyTrackResponseItem[]
  ): SpotifyTrackInfo[] {
    return tracks.map((track) => ({
      name: track.name,
      isrc: track.external_ids.isrc,
      album: track.album.name,
    }));
  }

  public async musicBrainzSearch(
    tracks: SpotifyTrackInfo[]
  ): Promise<SpotifyTrackInfo[]> {
    const musicbrainz_url = "https://musicbrainz.org/ws/2/recording?query=";

    const tracksWithMbid = await Promise.all(
      tracks.map(async (track) => {
        if (track.isrc) {
          const query = `${musicbrainz_url}isrc:${track.isrc}&fmt=json`;
          const response = await axios.get(query);
          return {
            ...track,
            mbid: response.data.recordings[0]?.id,
          };
        }
        return track;
      })
    );

    return tracksWithMbid;
  }

  public async acousticBrainzSearch(
    tracks: SpotifyTrackInfo[]
  ): Promise<SpotifyTrackInfo[]> {
    const acousticBrainz_url = "https://acousticbrainz.org/api/v1/high-level?";

    const mbids = tracks.map((track) => track.mbid).filter(Boolean);

    // Join mbids into a string separated by semicolons
    const mbidsString = mbids.join(";");
    console.log("query:", `${acousticBrainz_url}recording_ids=${mbidsString}`);

    const response = await axios.get(
      `${acousticBrainz_url}recording_ids=${mbidsString}`
    );

    console.log(response.data);

    // Create a new array with acoustic features added to tracks
    const tracksWithFeatures = tracks.map((track) => {
      // Create a copy of the track
      const enhancedTrack = { ...track };

      // Check if this track's mbid exists in the response data
      if (track.mbid && response.data[track.mbid]) {
        // Add the acoustic features to the track
        enhancedTrack.acoustic_features =
          response.data[track.mbid][0].highlevel;
      }

      return enhancedTrack;
    });

    // Log the enhanced tracks
    console.log("Tracks with acoustic features:");
    console.log(tracksWithFeatures);

    return tracksWithFeatures;
  }

  /**
   * Parses and formats search results from Spotify API for frontend display.
   *
   * @param results Raw search results from Spotify API
   * @param type Type of items that were searched
   * @returns Formatted search results
   */
  private parseSearchResults(
    results: SpotifyApiResponse,
    type: string
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
        owner: playlist.owner.display_name || "Unknown",
        tracks_total: playlist.tracks.total,
      }));
    }

    return formattedResults;
  }
}

// Create and export a singleton instance
export const spotifyClient = new SpotifyClient();
