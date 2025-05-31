import { useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const Logo = () => (
  <div className="flex items-center gap-2">
    <svg viewBox="0 0 64 64" className="w-8 h-8 fill-blue-600">
      <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="4" fill="none" />
      <path d="M32 16 L32 32 L44 44" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
    </svg>
    <span className="text-xl font-bold text-blue-600">WatchMarket</span>
  </div>
);

export default function WatchMarket() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const res = await fetch(`/api/scrape?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Logo />
      <h1 className="text-3xl font-bold">Find Your Watch's Market Value</h1>
      <p className="text-gray-600">Search real sales to estimate market and resale price with confidence.</p>

      <div className="flex gap-2">
        <Input
          placeholder="Enter watch model (e.g. Rolex Submariner)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>

      {loading && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
          </CardContent>
        </Card>
      )}

      {error && !loading && (
        <Card>
          <CardContent className="p-4 text-red-600">Error: {error}</CardContent>
        </Card>
      )}

      {result && !loading && (
        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="space-y-1">
              <div><strong>Average Sold Price:</strong> ${result.averagePrice.toFixed(2)}</div>
              <div><strong>Market Price (-20%):</strong> ${result.marketPrice.toFixed(2)}</div>
              <div><strong>Recommended Resale Price (+20%):</strong> ${result.resalePrice.toFixed(2)}</div>
              <div className="text-sm text-gray-500">Based on {result.itemCount} recent listings.</div>
            </div>
            <div className="pt-2">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={result.priceList?.map((v, i) => ({ index: i + 1, value: v })) || []}>
                  <XAxis dataKey="index" hide />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}