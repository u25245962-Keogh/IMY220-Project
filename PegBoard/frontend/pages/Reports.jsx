import { useCallback, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ReportedPostComponent from "../components/ReportedPostComponent";
import { useAuth } from "../context/AuthContext";
import "../styles/Reports.css";

function Reports() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [reasons, setReasons] = useState([]);
  const [newReason, setNewReason] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchReports = useCallback(async () => {
    const response = await fetch(
      `http://localhost:3000/api/reports?userId=${encodeURIComponent(user.id)}`,
    );
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Could not fetch reported posts");
    }
    setPosts(Array.isArray(result) ? result : []);
  }, [user.id]);

  const fetchReasons = useCallback(async () => {
    const response = await fetch("http://localhost:3000/api/report-reasons");
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Could not fetch report reasons");
    }
    setReasons(Array.isArray(result.reasons) ? result.reasons : []);
  }, []);

  useEffect(() => {
    const loadReportsPage = async () => {
      setError("");
      try {
        await Promise.all([fetchReports(), fetchReasons()]);
      } catch (requestError) {
        setError(requestError.message || "Failed to load reports.");
      }
    };
    loadReportsPage();
  }, [fetchReports, fetchReasons]);

  const saveReasons = async (nextReasons) => {
    setIsSaving(true);
    setError("");
    try {
      const response = await fetch("http://localhost:3000/api/report-reasons", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, reasons: nextReasons }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Could not save report reasons");
      }
      setReasons(result.reasons);
    } catch (requestError) {
      setError(requestError.message || "Failed to save report reasons.");
    } finally {
      setIsSaving(false);
    }
  };

  const updateReason = (index, value) => {
    setReasons((current) => current.map((reason, i) => i === index ? value : reason));
  };

  const addReason = () => {
    const cleanReason = newReason.trim();
    if (!cleanReason || reasons.some((reason) => reason.toLowerCase() === cleanReason.toLowerCase())) {
      return;
    }
    setReasons((current) => [...current, cleanReason]);
    setNewReason("");
  };

  const removeReason = (index) => {
    setReasons((current) => current.filter((_, i) => i !== index));
  };

  const handleSaveReasons = async (event) => {
    event.preventDefault();
    const cleanReasons = reasons.map((reason) => reason.trim());
    if (
      cleanReasons.length === 0 ||
      cleanReasons.some((reason) => !reason) ||
      new Set(cleanReasons.map((reason) => reason.toLowerCase())).size !== cleanReasons.length
    ) {
      setError("Keep at least one reason and make sure all reasons are unique and non-empty.");
      return;
    }
    await saveReasons(cleanReasons);
  };

  return (
    <>
      <Navbar name="Reports" />
      <main className="reports-page mx-auto flex w-full flex-col gap-8 px-4">
        {error && (
          <p className="reports-error" role="alert">
            {error}
          </p>
        )}
        <section className="report-reasons-panel">
          <h2 className="mt-0 font-['Rubik_Spray_Paint'] text-3xl">
            Report reasons
          </h2>
          <form onSubmit={handleSaveReasons} className="report-reasons-form">
            {reasons.map((reason, index) => (
              <div key={`report-reason-${index}`} className="report-reason-row">
                <input
                  type="text"
                  value={reason}
                  onChange={(event) => updateReason(index, event.target.value)}
                  aria-label={`Report reason ${index + 1}`}
                />
                <button
                  type="button"
                  className="report-reason-action"
                  onClick={() => removeReason(index)}
                  disabled={reasons.length === 1 || isSaving}
                >
                  Remove
                </button>
              </div>
            ))}
            <div className="report-reason-add">
              <input
                type="text"
                value={newReason}
                onChange={(event) => setNewReason(event.target.value)}
                placeholder="Add a reason"
                aria-label="New report reason"
              />
              <button
                type="button"
                className="report-reason-action"
                onClick={addReason}
              >
                Add
              </button>
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="report-save-button"
            >
              {isSaving ? "Saving..." : "Save reasons"}
            </button>
          </form>
        </section>

        <section className="reported-posts-section">
          <h2 className="justify-self-center font-['Rubik_Spray_Paint'] text-3xl">
            Reported posts
          </h2>
          {posts.length === 0 ? (
            <p className="reports-empty-state">No reported posts.</p>
          ) : (
            <div className="posts-list flex-row justify-items-center">
              {posts.map((report) => (
                <ReportedPostComponent
                  key={report._id}
                  report={report}
                  onDelete={(deletedPostId) =>
                    setPosts((current) =>
                      current.filter((item) => item.postId !== deletedPostId),
                    )
                  }
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

export default Reports;
