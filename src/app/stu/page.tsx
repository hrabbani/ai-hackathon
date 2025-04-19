"use client";
import { useState } from "react";

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [result, setResult] = useState<{
    openaiResponse: any;
    openaiToolMessages: any;
  } | null>(null);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/stu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: userInput }),
      });

      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error("Error calling agent:", error);
    } finally {
      setLoading(false);
      setUserInput("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl">
        <div className="flex gap-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Enter your prompt..."
            className="flex-1 p-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-6 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Send
          </button>
        </div>
      </form>

      {result && (
        <div className="w-full max-w-2xl bg-gray shadow-md p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Results:</h2>
          <pre className="text-sm whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
