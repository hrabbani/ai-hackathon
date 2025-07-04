"use client";
import { useState } from "react";

interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  popularity: number;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log("Frontend: Sending request to agent API");

      const response = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "findMusic",
          params: { query: userInput },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Frontend: API error response:", errorData);
        throw new Error(errorData.details || "Failed to search for music");
      }

      const results = await response.json();
      console.log("Frontend: Received results:", results);
      setSearchResults(results);
    } catch (error) {
      console.error("Frontend: Error finding music:", error);
      // You might want to add error state management here
    } finally {
      setIsLoading(false);
      setUserInput(""); // Clear input after submission
    }
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
                    <h3 className="font-semibold text-lg">{track.name}</h3>
                    <p className="text-gray-600">{track.artist}</p>
                    <p className="text-gray-500 text-sm">{track.album}</p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500">
                      Popularity: {track.popularity}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
