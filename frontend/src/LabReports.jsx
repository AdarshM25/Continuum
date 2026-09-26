import { useEffect, useState, useCallback, useMemo } from "react";
import { getMeasurements, getInsights } from "./api";
import UploadReport from "./UploadReport";
import ReportHistory from "./ReportHistory";

function groupByType(measurements) {
  const grouped = {};
  for (const m of measurements) {
    if (!grouped[m.type]) grouped[m.type] = [];
    grouped[m.type].push(m);
  }
  return grouped;
}

export default function LabReports() {
  const [measurements, setMeasurements] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedReportId, setSelectedReportId] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [measurementsData, insightsData] = await Promise.all([getMeasurements(), getInsights()]);
      setMeasurements(measurementsData);
      setInsights(insightsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleUploaded() {
    loadData();
    setRefreshKey((k) => k + 1);
  }

  const reportMeasurements = useMemo(
    () => measurements.filter((m) => m.reportId === selectedReportId),
    [measurements, selectedReportId]
  );

  const reportInsights = useMemo(() => {
    const idsInReport = new Set(reportMeasurements.map((m) => String(m._id)));
    return insights.filter((insight) =>
      insight.sourceMeasurements.some((id) => idsInReport.has(String(id)))
    );
  }, [insights, reportMeasurements]);

  const grouped = groupByType(reportMeasurements);

  return (
    <div className="max-w-3xl mx-auto px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Lab Reports</h1>

      <UploadReport onUploaded={handleUploaded} />

      <ReportHistory
        refreshKey={refreshKey}
        selectedId={selectedReportId}
        onSelect={setSelectedReportId}
      />

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
          {error}
        </div>
      )}
      {loading && <p className="text-sm text-gray-400 text-center py-6">Loading your data…</p>}

      {!loading && !error && !selectedReportId && (
        <p className="text-sm text-gray-400 text-center py-8">
          Select a report above to view its insights and measurements.
        </p>
      )}

      {!loading && !error && selectedReportId && (
        <>
          <section className="mb-8">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Insights ({reportInsights.length})
            </h3>
            {reportInsights.length === 0 && (
              <p className="text-sm text-gray-400">Nothing flagged for this report.</p>
            )}
            <div className="space-y-2">
              {reportInsights.map((insight) => (
                <div
                  key={insight._id}
                  className={`rounded-lg p-4 border-l-4 ${
                    insight.type === "threshold"
                      ? "border-amber-500 bg-amber-50"
                      : "border-blue-500 bg-blue-50"
                  }`}
                >
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                    {insight.type}
                  </div>
                  <p className="text-sm text-gray-800">{insight.aiText}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Measurements
            </h3>
            {Object.keys(grouped).length === 0 && (
              <p className="text-sm text-gray-400">No measurements extracted from this report.</p>
            )}
            <div className="space-y-4">
              {Object.entries(grouped).map(([type, series]) => (
                <div key={type} className="bg-white border border-gray-200 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">{type}</h4>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-gray-400 uppercase border-b border-gray-100">
                        <th className="pb-2 font-medium">Date</th>
                        <th className="pb-2 font-medium">Value</th>
                        <th className="pb-2 font-medium">Reference range</th>
                      </tr>
                    </thead>
                    <tbody>
                      {series.map((m) => {
                        const outOfRange =
                          m.referenceRange &&
                          (m.value < m.referenceRange.low || m.value > m.referenceRange.high);
                        return (
                          <tr key={m._id} className="border-b border-gray-50 last:border-0">
                            <td className="py-2 text-gray-600">
                              {new Date(m.takenAt).toLocaleDateString()}
                            </td>
                            <td className={`py-2 ${outOfRange ? "text-red-600 font-semibold" : "text-gray-800"}`}>
                              {m.value} {m.unit}
                            </td>
                            <td className="py-2 text-gray-500">
                              {m.referenceRange ? `${m.referenceRange.low}–${m.referenceRange.high}` : "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}