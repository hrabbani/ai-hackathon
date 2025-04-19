interface SearchModel {
  query: string; // Search query term
  qtype?: string; // Type of items to search (default: "track")
  limit?: number; // Max items to return (default: 10)
}

interface SpotifySearchResult {
  tracks?: SpotifyTrack[];
  artists?: SpotifyArtist[];
  albums?: SpotifyAlbum[];
  playlists?: SpotifyPlaylist[];
}

interface SpotifyTrack {
  name: string;
  id: string;
  artist?: string | string[];
  album?: SpotifyAlbum;
  isPlaying?: boolean;
  trackNumber?: number;
  durationMs?: number;
  isPlayable?: boolean;
}

interface SpotifyArtist {
  name: string;
  id: string;
  genres?: string[];
}

interface SpotifyAlbum {
  name: string;
  id: string;
  artist?: string | string[];
  tracks?: SpotifyTrack[];
  totalTracks?: number;
  releaseDate?: string;
  genres?: string[];
}

interface SpotifyPlaylist {
  name: string;
  id: string;
  owner: string;
  userIsOwner: boolean;
  description?: string;
  tracks?: SpotifyTrack[];
}

export function printInput(input: string): void {
  console.log(input);
}

export function queryToMCP(input: string): string {
  console.log(input);
  return "test";
}

class SpotifyClient {
  private spotifyApi: any; // Use appropriate Spotify Web API client
  private logger: Logger;
  private username: string | null = null;

  constructor(clientId: string, clientSecret: string, redirectUri: string) {
    // Initialize Spotify Web API client
    this.spotifyApi = new SpotifyWebApi({
      clientId,
      clientSecret,
      redirectUri,
    });
  }

  async search(
    query: string,
    qtype: string = "track",
    limit: number = 10
  ): Promise<SpotifySearchResult> {
    try {
      if (!this.username) {
        await this.setUsername();
      }

      const results = await this.spotifyApi.search(query, qtype.split(","), {
        limit,
      });
      return this.parseSearchResults(results, qtype, this.username);
    } catch (error) {
      this.logger.error(`Search failed: ${error}`);
      throw error;
    }
  }

  private parseSearchResults(
    results: any,
    qtype: string,
    username: string | null
  ): SpotifySearchResult {
    const parsedResults: SpotifySearchResult = {};

    qtype.split(",").forEach((type) => {
      switch (type) {
        case "track":
          parsedResults.tracks = results.tracks.items
            .filter(Boolean)
            .map((item) => this.parseTrack(item));
          break;
        case "artist":
          parsedResults.artists = results.artists.items
            .filter(Boolean)
            .map((item) => this.parseArtist(item));
          break;
        case "album":
          parsedResults.albums = results.albums.items
            .filter(Boolean)
            .map((item) => this.parseAlbum(item));
          break;
        case "playlist":
          parsedResults.playlists = results.playlists.items
            .filter(Boolean)
            .map((item) => this.parsePlaylist(item, username));
          break;
        default:
          throw new Error(`Unknown search type: ${type}`);
      }
    });

    return parsedResults;
  }

  private parseTrack(track: any, detailed: boolean = false): SpotifyTrack {
    const parsed: SpotifyTrack = {
      name: track.name,
      id: track.id,
    };

    if ("is_playing" in track) {
      parsed.isPlaying = track.is_playing;
    }

    if (detailed) {
      parsed.album = this.parseAlbum(track.album);
      parsed.trackNumber = track.track_number;
      parsed.durationMs = track.duration_ms;
    }

    if (!track.is_playable) {
      parsed.isPlayable = false;
    }

    const artists = track.artists.map((a: any) =>
      detailed ? this.parseArtist(a) : a.name
    );

    if (artists.length === 1) {
      parsed.artist = artists[0];
    } else {
      parsed.artist = artists;
    }

    return parsed;
  }

  // Similar parse methods for Artist, Album, and Playlist...
}

class SpotifyClient {
  private spotifyApi: any; // Use appropriate Spotify Web API client
  private logger: Logger;
  private username: string | null = null;

  constructor(clientId: string, clientSecret: string, redirectUri: string) {
    // Initialize Spotify Web API client
    this.spotifyApi = new SpotifyWebApi({
      clientId,
      clientSecret,
      redirectUri,
    });
  }

  async search(
    query: string,
    qtype: string = "track",
    limit: number = 10
  ): Promise<SpotifySearchResult> {
    try {
      if (!this.username) {
        await this.setUsername();
      }

      const results = await this.spotifyApi.search(query, qtype.split(","), {
        limit,
      });
      return this.parseSearchResults(results, qtype, this.username);
    } catch (error) {
      this.logger.error(`Search failed: ${error}`);
      throw error;
    }
  }

  private parseSearchResults(
    results: any,
    qtype: string,
    username: string | null
  ): SpotifySearchResult {
    const parsedResults: SpotifySearchResult = {};

    qtype.split(",").forEach((type) => {
      switch (type) {
        case "track":
          parsedResults.tracks = results.tracks.items
            .filter(Boolean)
            .map((item) => this.parseTrack(item));
          break;
        case "artist":
          parsedResults.artists = results.artists.items
            .filter(Boolean)
            .map((item) => this.parseArtist(item));
          break;
        case "album":
          parsedResults.albums = results.albums.items
            .filter(Boolean)
            .map((item) => this.parseAlbum(item));
          break;
        case "playlist":
          parsedResults.playlists = results.playlists.items
            .filter(Boolean)
            .map((item) => this.parsePlaylist(item, username));
          break;
        default:
          throw new Error(`Unknown search type: ${type}`);
      }
    });

    return parsedResults;
  }

  private parseTrack(track: any, detailed: boolean = false): SpotifyTrack {
    const parsed: SpotifyTrack = {
      name: track.name,
      id: track.id,
    };

    if ("is_playing" in track) {
      parsed.isPlaying = track.is_playing;
    }

    if (detailed) {
      parsed.album = this.parseAlbum(track.album);
      parsed.trackNumber = track.track_number;
      parsed.durationMs = track.duration_ms;
    }

    if (!track.is_playable) {
      parsed.isPlayable = false;
    }

    const artists = track.artists.map((a: any) =>
      detailed ? this.parseArtist(a) : a.name
    );

    if (artists.length === 1) {
      parsed.artist = artists[0];
    } else {
      parsed.artist = artists;
    }

    return parsed;
  }

  // Similar parse methods for Artist, Album, and Playlist...
}
