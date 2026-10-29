

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

function ReportComponent({ postId }) {
  const { user } = useAuth();
  const [reasons, setReasons] = useState([]);
  const [reason, setReason] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isReported, setIsReported] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || reasons.length > 0) return;

    const loadReasons = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await fetch("http://localhost:3000/api/report-reasons");
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Could not load report reasons");
        }
        if (!Array.isArray(result.reasons) || result.reasons.length === 0) {
          throw new Error("No report reasons are currently available");
        }
        setReasons(result.reasons);
        setReason(result.reasons[0]);
      } catch (requestError) {
        setError(requestError.message || "Failed to load report reasons.");
      } finally {
        setIsLoading(false);
      }
    };

    loadReasons();
  }, [isOpen, reasons.length]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user?.id || !reason || isLoading) return;

    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(`http://localhost:3000/api/posts/${postId}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, reason }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Could not report post");
      }
      setIsReported(true);
      setIsOpen(false);
    } catch (requestError) {
      setError(requestError.message || "Failed to report post.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 text-sm text-gray-900">
      {isReported ? (
        <span role="status">Post reported</span>
      ) : (
        <button
          type="button"
          className="rounded-full bg-red-800/90 px-3 py-1 text-white hover:bg-red-900"
          onClick={() => {
            setIsOpen((open) => !open);
            setError("");
          }}
          aria-expanded={isOpen}
        >
          Report
        </button>
      )}
      {isOpen && (
        <form onSubmit={handleSubmit} className="flex w-full flex-col items-center gap-2">
          <label htmlFor={`report-reason-${postId}`}>Reason for reporting</label>
          <select
            id={`report-reason-${postId}`}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            disabled={isLoading || reasons.length === 0}
            className="max-w-full rounded-lg bg-white px-2 py-1 text-gray-900"
            required
          >
            {reasons.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isLoading || !reason}
              className="rounded-lg bg-red-800 px-3 py-1 text-white disabled:opacity-60"
            >
              {isLoading ? "Submitting..." : "Submit report"}
            </button>
            <button type="button" onClick={() => setIsOpen(false)} disabled={isLoading}>
              Cancel
            </button>
          </div>
        </form>
      )}
      {error && <p role="alert" className="m-0">{error}</p>}
    </div>
  );
}

export default ReportComponent;