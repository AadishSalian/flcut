"use client";
import { useState, useEffect } from "react";

type Link = {
  id: string;
  slug: string;
  originalUrl: string;
  clicks: number;
  createdAt: string;
  expiresAt: string | null;
};

export default function Home() {
  const [url, setUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [links, setLinks] = useState<Link[]>([]);

  async function fetchLinks() {
    const res = await fetch("/api/links");
    const data = await res.json();
    setLinks(data);
  }

  useEffect(() => {
    fetchLinks();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setShortUrl("");

    const res = await fetch("/api/shorten", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, customSlug, expiresAt }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) return setError(data.error);
    setShortUrl(data.shortUrl);
    setUrl("");
    setCustomSlug("");
    setExpiresAt("");
    fetchLinks();
  }

  function handleCopy() {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 text-gray-900">FLCut</h1>
      <p className="text-gray-500 mb-8">Link shortener for Finite Loop Club</p>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow space-y-4 mb-10 border border-gray-200"
      >
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste your long URL here..."
          className="w-full border border-gray-300 rounded px-4 py-2 text-sm text-gray-900 bg-white placeholder-gray-400"
          required
        />
        <input
          type="text"
          value={customSlug}
          onChange={(e) => setCustomSlug(e.target.value)}
          placeholder="Custom slug (optional) e.g. hackfest26"
          className="w-full border border-gray-300 rounded px-4 py-2 text-sm text-gray-900 bg-white placeholder-gray-400"
        />
        <div>
          <label className="text-xs text-gray-500">Expires at (optional)</label>
          <input
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2 text-sm text-gray-900 bg-white mt-1"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {loading ? "Shortening..." : "Shorten Link"}
        </button>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {shortUrl && (
          <div className="flex items-center gap-3 bg-gray-100 px-4 py-3 rounded border border-gray-200">
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline text-sm flex-1 break-all"
            >
              {shortUrl}
            </a>
            <button
              type="button"
              onClick={handleCopy}
              className="text-xs bg-white border border-gray-300 px-2 py-1 rounded text-gray-700 hover:bg-gray-50"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        )}
      </form>

      <h2 className="text-xl font-semibold mb-4 text-gray-900">Your Links</h2>

      {links.length === 0 && (
        <p className="text-gray-400 text-sm">No links yet. Create one above.</p>
      )}

      <div className="space-y-3">
        {links.map((link) => (
          <div
            key={link.id}
            className="bg-white p-4 rounded-xl shadow border border-gray-200 flex justify-between items-center"
          >
            <div>
              <p className="font-medium text-blue-600">/{link.slug}</p>
              <p className="text-xs text-gray-400 truncate max-w-xs">
                {link.originalUrl}
              </p>
              {link.expiresAt && (
                <p className="text-xs text-orange-500">
                  Expires: {new Date(link.expiresAt).toLocaleString()}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">{link.clicks}</p>
              <p className="text-xs text-gray-400">clicks</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}