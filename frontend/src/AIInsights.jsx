import { useEffect, useState } from "react";
import { getInsights } from "./api";

export default function AIInsights() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // "all" | "threshold" | "trend"

  useEffect(() => {
    getInsights()
      .then(setInsights)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const visible = filter === "all" ? insights : insights.filter((i) => i.type === filter);

  return (
    <div className="max-w-3xl mx-auto px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">AI Insights</h1>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {["all", "threshold", "trend"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs font-medium px-3 py-1.5 rounded-md capitalize transition ${
                filter === f ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="text-sm text-gray-400">Loading…</p>}
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {!loading && !error && visible.length === 0 && (
        <p className="text-sm text-gray-400">Nothing to show here yet.</p>
      )}

      <div className="space-y-2">
        {visible.map((insight) => (
          <div
            key={insight._id}
            className={`rounded-lg p-4 border-l-4 ${
              insight.type === "threshold" ? "border-amber-500 bg-amber-50" : "border-blue-500 bg-blue-50"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {insight.type}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(insight.generatedAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-gray-800">{insight.aiText}</p>
          </div>
        ))}
      </div>
    </div>
  );
}