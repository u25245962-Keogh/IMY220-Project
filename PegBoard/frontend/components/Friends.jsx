import { useEffect, useState } from "react";
import "../styles/profile.css";
import { useAuth } from "../context/AuthContext";


function Friends({ friends }) {
  const [loadedFriends, setLoadedFriends] = useState([]);
  const [loadedUserId, setLoadedUserId] = useState("");
  const [error, setError] = useState("");
  const [friendUsernames, setFriendUsernames] = useState({});
  const [friendLookupError, setFriendLookupError] = useState("");
  const { user } = useAuth();

  const isLoading =
    friends === undefined &&
    Boolean(user?.id) &&
    loadedUserId !== user.id;
  const displayFriends =
    friends ?? (loadedUserId === user?.id ? loadedFriends : []);
  const friendsKey = JSON.stringify(displayFriends);
  const hasFriendIds = displayFriends.some((friend) => {
    const friendId = friend?._id ?? friend?.id ?? friend;
    return typeof friendId === "string" && /^[a-f\d]{24}$/i.test(friendId);
  });

  useEffect(() => {
    if (friends !== undefined) return;
    if (!user?.id) return;

    let isActive = true;

    const fetchFriends = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/users/${encodeURIComponent(user.id)}`,
        );
        const profile = await response.json();

        if (!response.ok) {
          throw new Error(profile.message || "Could not fetch friends.");
        }

        if (isActive) {
          setLoadedFriends(Array.isArray(profile.friends) ? profile.friends : []);
          setError("");
        }
      } catch (fetchError) {
        if (isActive) {
          setError(fetchError.message || "Failed to connect to the server.");
        }
      } finally {
        if (isActive) {
          setLoadedUserId(user.id);
        }
      }
    };

    fetchFriends();
    return () => {
      isActive = false;
    };
  }, [friends, user?.id]);

  useEffect(() => {
    let isActive = true;
    if (!hasFriendIds) {
      return;
    }

    const fetchFriendUsernames = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/users");
        const users = await response.json();
        if (!response.ok) {
          throw new Error(users.message || "Could not load friend usernames.");
        }

        const usernamesById = Object.fromEntries(
          (Array.isArray(users) ? users : [])
            .filter((person) => person._id && person.username)
            .map((person) => [String(person._id), person.username]),
        );
        if (isActive) {
          setFriendUsernames(usernamesById);
          setFriendLookupError("");
        }
      } catch (lookupError) {
        if (isActive) {
          setFriendLookupError(
            lookupError.message || "Could not load friend usernames.",
          );
        }
      }
    };

    fetchFriendUsernames();
    return () => {
      isActive = false;
    };
  }, [friendsKey, hasFriendIds]);

  return (
    <div className="friends-container">
      <h3>
        Friends (
        {isLoading ? "..." : displayFriends.length}
        )
      </h3>
      {error && <p role="alert">{error}</p>}
      {hasFriendIds && friendLookupError && (
        <p role="alert">{friendLookupError}</p>
      )}
      <div className="friends-list">
        {displayFriends.map((friend, index) => {
          const friendReference = friend?._id ?? friend?.id ?? friend;
          const friendName = friend?.username ||
            (typeof friendReference === "string"
              ? friendUsernames[friendReference] || friendReference
              : friend?.name || "Unknown user");
          return (
            <div
              key={friendReference ?? friendName ?? index}
              className="friend-card"
            >
              <p>{friendName}</p>
            </div>
          );
        })}
      </div>
      {!isLoading && !error && displayFriends.length === 0 && (
        <p>No friends yet.</p>
      )}
    </div>
  );
}

export default Friends;
