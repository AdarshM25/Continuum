import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { getMeasurements } from "./api";

export default function HealthTrends() {
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  useEffect(() => {
    getMeasurements()
      .then((data) => {
        setMeasurements(data);
        const types = [...new Set(data.map((m) => m.type))].sort();
        if (types.length > 0) setSelectedType(types[0]);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const types = useMemo(() => [...new Set(measurements.map((m) => m.type))].sort(), [measurements]);

  const series = useMemo(() => {
    if (!selectedType) return [];
    return measurements
      .filter((m) => m.type === selectedType)
      .sort((a, b) => new Date(a.takenAt) - new Date(b.takenAt))
      .map((m) => ({
        date: new Date(m.takenAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        value: m.value,
        unit: m.unit,
        low: m.referenceRange?.low,
        high: m.referenceRange?.high,
      }));
  }, [measurements, selectedType]);

  // Reference range shown as two dashed lines — taken from the most recent
  // reading's range, since the range can technically differ between labs.
  const latestRange = series.length > 0 ? series[series.length - 1] : null;

  return (
    <div className="max-w-4xl mx-auto px-8 py-10">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Health Trends</h1>
        {types.length > 0 && (
          <select
            value={selectedType || ""}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700"
          >
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading && <p className="text-sm text-gray-400">Loading…</p>}
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {!loading && !error && types.length === 0 && (
        <p className="text-sm text-gray-400">No measurements yet — upload a report to see trends.</p>
      )}

      {!loading && !error && series.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="text-sm font-medium text-gray-700 mb-1 capitalize">{selectedType}</div>
          <div className="text-xs text-gray-400 mb-4">{series[0]?.unit}</div>

          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={series} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#9ca3af" }} />
              <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{ fontSize: 13, borderRadius: 8, border: "1px solid #e5e7eb" }}
                formatter={(value) => [`${value} ${series[0]?.unit || ""}`, selectedType]}
              />
              {latestRange?.low != null && (
                <ReferenceLine y={latestRange.low} stroke="#f59e0b" strokeDasharray="4 4" />
              )}
              {latestRange?.high != null && (
                <ReferenceLine y={latestRange.high} stroke="#f59e0b" strokeDasharray="4 4" />
              )}
              <Line type="monotone" dataKey="value" stroke="#0d9488" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>

          {series.length === 1 && (
            <p className="text-xs text-gray-400 mt-3">
              Only one reading so far — upload another report to start seeing a trend.
            </p>
          )}
        </div>
      )}
    </div>
  );
}