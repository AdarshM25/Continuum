import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Sparkles, TrendingUp } from "lucide-react";
import { getReports, getInsights, getMeasurements } from "./api";

export default function DashboardOverview() {
  const [reports, setReports] = useState([]);
  const [insights, setInsights] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getReports(), getInsights(), getMeasurements()])
      .then(([r, i, m]) => {
        setReports(r);
        setInsights(i);
        setMeasurements(m);
      })
      .finally(() => setLoading(false));
  }, []);

  const distinctTypes = new Set(measurements.map((m) => m.type)).size;
  const latestReport = reports[0];
  const recentInsights = insights.slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
      <p className="text-gray-500 text-sm mb-8">Here's where things stand.</p>

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : (
        <>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <StatCard icon={<FileText size={18} />} label="Reports uploaded" value={reports.length} />
            <StatCard icon={<Sparkles size={18} />} label="Insights flagged" value={insights.length} />
            <StatCard icon={<TrendingUp size={18} />} label="Tracked measurements" value={distinctTypes} />
          </div>

          {latestReport && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
                Latest upload
              </div>
              <div className="text-sm text-gray-800">{latestReport.originalName}</div>
              <div className="text-xs text-gray-400 mt-0.5">
                {new Date(latestReport.uploadedAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </div>
              <Link to="/lab-reports" className="inline-block mt-3 text-sm text-teal-700 font-medium hover:underline">
                View lab reports →
              </Link>
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Recent insights</h3>
              <Link to="/insights" className="text-xs text-teal-700 font-medium hover:underline">
                View all →
              </Link>
            </div>
            {recentInsights.length === 0 ? (
              <p className="text-sm text-gray-400">Nothing flagged yet — upload a report to get started.</p>
            ) : (
              <div className="space-y-2">
                {recentInsights.map((insight) => (
                  <div
                    key={insight._id}
                    className={`rounded-lg p-3 border-l-4 ${
                      insight.type === "threshold"
                        ? "border-amber-500 bg-amber-50"
                        : "border-blue-500 bg-blue-50"
                    }`}
                  >
                    <p className="text-sm text-gray-700 line-clamp-2">{insight.aiText}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}