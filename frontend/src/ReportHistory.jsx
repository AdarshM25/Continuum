import { useEffect, useState } from "react";
import { FileText, ChevronRight } from "lucide-react";
import { getReports } from "./api";

const STATUS_STYLES = {
  done: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  failed: "bg-red-50 text-red-700",
};

export default function ReportHistory({ refreshKey, selectedId, onSelect }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReports()
      .then(setReports)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refreshKey]);

  if (loading) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Upload history ({reports.length})
      </h3>

      {reports.length === 0 && (
        <p className="text-sm text-gray-400 py-2">No reports uploaded yet.</p>
      )}

      <div className="space-y-1">
        {reports.map((report) => {
          const isSelected = selectedId === report._id;
          const canOpen = report.extractionStatus === "done";
          return (
            <button
              key={report._id}
              onClick={() => canOpen && onSelect(isSelected ? null : report._id)}
              disabled={!canOpen}
              className={`w-full flex items-center justify-between py-2 px-2 rounded-lg text-left transition ${
                isSelected ? "bg-teal-50" : canOpen ? "hover:bg-gray-50" : "opacity-60 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText size={16} className="text-gray-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm text-gray-800 truncate">{report.originalName}</div>
                  <div className="text-xs text-gray-400">
                    {new Date(report.uploadedAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    STATUS_STYLES[report.extractionStatus] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  {report.extractionStatus}
                </span>
                {canOpen && (
                  <ChevronRight
                    size={16}
                    className={`text-gray-400 transition-transform ${isSelected ? "rotate-90" : ""}`}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}