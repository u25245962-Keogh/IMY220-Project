import { useEffect, useState } from "react";
import "../styles/profile.css";


function Friends({ friends = [] }) {
  const [sampleFriends, setSampleFriends] = useState([]);
  const [error, setError] = useState(""); 
  
  useEffect(() => {
    const userCookie = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("userId="));
    const userId = userCookie?.slice("userId=".length);

    if (!userId) return;

    const fetchFriends = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/users/${encodeURIComponent(decodeURIComponent(userId))}`,
        );
        const user = await response.json();

        if (!response.ok) {
          throw new Error(user.message || "Could not fetch friends");
        }

        setSampleFriends(Array.isArray(user.friends) ? user.friends : []);
      } catch (error) {
        setError(error.message || "Failed to connect to the server.");
      }
    };

    fetchFriends();
  }, []);
 
  const displayFriends = friends.length > 0 ? friends : sampleFriends;

  return (
    <div className="friends-container">

      <h3 className="mb-4 text-lg font-bold text-stone-900">Friends ({displayFriends.length})</h3>

      <div className="friends-list grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

        {displayFriends.map((friend, index) => (

          <div key={friend._id ?? friend.id ?? index} className="friend-card min-w-0 rounded-md border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700">


            <p className="break-words">{friend}</p>

          </div>

        ))}
      </div>
    </div>
  );
}

export default Friends;
