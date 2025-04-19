"use client";
import { useState } from "react";

interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  popularity: number;
  acoustic_features?: Record<string, unknown>;
}

interface SearchResults {
  tracks: Track[];
}

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResults | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [expandedTrack, setExpandedTrack] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/api/music", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: userInput }),
      });

      if (!response.ok) {
        console.log(response);
        throw new Error("Failed to search for music");
      }

      const results = await response.json();
      setSearchResults(results);
    } catch (error) {
      console.error("Error finding music:", error);
    } finally {
      setIsLoading(false);
      setUserInput(""); // Clear input after submission
    }
  };

  const toggleTrackDetails = (trackId: string) => {
    if (expandedTrack === trackId) {
      setExpandedTrack(null);
    } else {
      setExpandedTrack(trackId);
    }
  };

  // Function to display the acoustic features in a readable format
  const renderAcousticFeatures = (features: Record<string, unknown>) => {
    return (
      <div className="mt-3 border-t pt-3 text-sm">
        <h4 className="font-medium mb-2 text-black">Acoustic Features:</h4>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(features).map(([key, value]) => {
            if (typeof value === "object" && value !== null) {
              return (
                <div key={key} className="col-span-2 mb-2">
                  <h5 className="font-medium text-black">{key}</h5>
                  <div className="pl-2 border-l-2 border-blue-200">
                    {Object.entries(value as Record<string, unknown>).map(
                      ([subKey, subValue]) => (
                        <div key={subKey} className="flex justify-between">
                          <span className="text-black">{subKey}:</span>
                          <span className="font-mono text-black">
                            {typeof subValue === "number"
                              ? subValue.toFixed(4)
                              : String(subValue)}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              );
            } else {
              return (
                <div key={key} className="flex justify-between">
                  <span className="text-black">{key}:</span>
                  <span className="font-mono text-black">{String(value)}</span>
                </div>
              );
            }
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl">
        <div className="flex gap-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Enter your music search..."
            className="flex-1 p-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {searchResults && (
        <div className="mt-8 w-full max-w-2xl">
          <div className="grid gap-4">
            {searchResults.tracks.map((track) => (
              <div
                key={track.id}
                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg text-black">
                      {track.name}
                    </h3>
                    <p className="text-gray-600">{track.artist}</p>
                    <p className="text-gray-500 text-sm">{track.album}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      Popularity: {track.popularity}
                    </span>
                    {track.acoustic_features && (
                      <button
                        onClick={() => toggleTrackDetails(track.id)}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        {expandedTrack === track.id
                          ? "Hide Features"
                          : "Show Features"}
                      </button>
                    )}
                  </div>
                </div>

                {expandedTrack === track.id &&
                  track.acoustic_features &&
                  renderAcousticFeatures(track.acoustic_features)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
