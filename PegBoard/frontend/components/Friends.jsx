import { useEffect, useState } from "react";
import "../styles/profile.css";
import { useAuth } from "../context/AuthContext";


function Friends({ friends }) {
  const [sampleFriends, setSampleFriends] = useState([]);
  const [error, setError] = useState(""); 
  const { user } = useAuth();
  
  useEffect(() => {
    if (friends !== undefined) return;
    if (!user?.id) return;

    const fetchFriends = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/users/${encodeURIComponent(user.id)}`,
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
  }, [friends, user]);
 
  const displayFriends = friends ?? sampleFriends;

  return (
    <div className="friends-container">

      <h3>Friends ({displayFriends.length})</h3>

      <div className="friends-list">

        {displayFriends.map((friend, index) => (

          <div key={friend._id ?? friend.id ?? index} className="friend-card">


            <p className>{friend}</p>

          </div>

        ))}
      </div>
    </div>
  );
}

export default Friends;
