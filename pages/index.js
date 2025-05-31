
import { useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";

export default function WatchPricer() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

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
      setPricesForChart(data.priceList || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">eBay Watch Market Pricer</h1>
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
          <CardContent className="p-4 text-red-600">
            Error: {error}
          </CardContent>
        </Card>
      )}
      {result && !loading && (
        <Card>
          <CardContent className="space-y-2 p-4">
            <div>
              <strong>Average Sold Price:</strong> ${result.averagePrice.toFixed(2)}
            </div>
            <div>
              <strong>Market Price (20% deduction):</strong> ${result.marketPrice.toFixed(2)}
            </div>
            <div>
              <strong>Recommended Resale Price (+20%):</strong> ${result.resalePrice.toFixed(2)}
            </div>
            <div className="text-sm text-gray-500">
              Based on {result.itemCount} sold listings.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
