import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

function FriendRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loadedUserId, setLoadedUserId] = useState("");
  const [actionId, setActionId] = useState("");
  const [error, setError] = useState("");
  const loading = Boolean(user?.id) && loadedUserId !== user.id;
  const visibleRequests = loadedUserId === user?.id ? requests : [];

  useEffect(() => {
    if (!user?.id) return;

    let isActive = true;

    const fetchRequests = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/users/${encodeURIComponent(user.id)}/requests`,
        );
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Could not load friend requests.");
        }
        if (isActive) {
          setError("");
          setRequests(Array.isArray(result) ? result : []);
        }
      } catch (fetchError) {
        if (isActive) {
          setError(fetchError.message || "Could not load friend requests.");
        }
      } finally {
        if (isActive) {
          setLoadedUserId(user.id);
        }
      }
    };

    fetchRequests();
    return () => {
      isActive = false;
    };
  }, [user?.id]);

  const handleRequest = async (requesterId, action) => {
    if (!user?.id) return;

    setActionId(requesterId);
    setError("");
    try {
      const response = await fetch(
        action === "accept"
          ? `http://localhost:3000/api/users/${encodeURIComponent(user.id)}/requests/${encodeURIComponent(requesterId)}/accept`
          : `http://localhost:3000/api/users/${encodeURIComponent(user.id)}/requests/${encodeURIComponent(requesterId)}`,
        { method: action === "accept" ? "POST" : "DELETE" },
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Could not update this friend request.");
      }

      setRequests((currentRequests) =>
        currentRequests.filter(
          (request) => String(request._id) !== String(requesterId),
        ),
      );
    } catch (actionError) {
      setError(actionError.message || "Could not update this friend request.");
    } finally {
      setActionId("");
    }
  };

  return (
    <section className="profile-content-card friend-requests-section">
      <h2>Friend requests</h2>
      {!user?.id ? (
        <p className="font-['Love_Ya_Like_A_Sister']">
          Please log in to view friend requests.
        </p>
      ) : loading ? (
        <p className="font-['Love_Ya_Like_A_Sister']">
          Loading friend requests...
        </p>
      ) : error && visibleRequests.length === 0 ? (
        <p role="alert" className="font-['Love_Ya_Like_A_Sister']">
          {error}
        </p>
      ) : visibleRequests.length > 0 ? (
        <div className="friends-list">
          {visibleRequests.map((request) => (
            <div key={request._id} className="friend-card">
              <p>{request.username || "Unknown user"}</p>
              <button
                type="button"
                className="profile-submit-button"
                onClick={() => handleRequest(request._id, "accept")}
                disabled={Boolean(actionId)}
              >
                Accept
              </button>
              <button
                type="button"
                className="profile-submit-button"
                onClick={() => handleRequest(request._id, "reject")}
                disabled={Boolean(actionId)}
              >
                Reject
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="font-['Love_Ya_Like_A_Sister'] text-gray-400">
          No pending friend requests.
        </p>
      )}
      {error && visibleRequests.length > 0 && <p role="alert">{error}</p>}
    </section>
  );
}

export default FriendRequests;
