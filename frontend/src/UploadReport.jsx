import { useState } from "react";
import { UploadCloud } from "lucide-react";
import { uploadReport, getReportStatus } from "./api";

const POLL_INTERVAL_MS = 2000;

export default function UploadReport({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  async function pollUntilDone(reportId) {
    setStatus("pending");
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      const result = await getReportStatus(reportId);
      if (result.extractionStatus === "done") {
        setStatus("done");
        onUploaded();
        return;
      }
      if (result.extractionStatus === "failed") {
        setStatus("failed");
        setError(result.extractionError || "Extraction failed");
        return;
      }
    }
  }

  async function handleUpload() {
    if (!file) return;
    setError(null);
    setStatus("uploading");
    try {
      const { reportId } = await uploadReport(file);
      await pollUntilDone(reportId);
    } catch (err) {
      setStatus("failed");
      setError(err.message);
    }
  }

  const busy = status === "uploading" || status === "pending";

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <UploadCloud size={18} className="text-teal-600" />
        <h3 className="text-base font-semibold text-gray-800">Upload a lab report</h3>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          onChange={(e) => setFile(e.target.files[0] || null)}
          className="text-sm text-gray-600"
        />
        <button
          onClick={handleUpload}
          disabled={!file || busy}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-teal-600 to-emerald-700 hover:opacity-90 transition disabled:opacity-40"
        >
          Upload
        </button>
      </div>

      {status === "uploading" && <p className="text-sm text-gray-400 mt-3">Uploading…</p>}
      {status === "pending" && (
        <p className="text-sm text-gray-400 mt-3">Extracting values — this can take up to a minute…</p>
      )}
      {status === "done" && <p className="text-sm text-emerald-600 mt-3">Done — open it from the history below.</p>}
      {status === "failed" && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mt-3">
          {error}
        </div>
      )}
    </div>
  );
}