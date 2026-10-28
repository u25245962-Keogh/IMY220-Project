import PostComponent from "./PostComponent";
import "../styles/Posts.css";
import { useEffect, useState } from "react";
import EditPost from "./EditPost";
import DeletePost from "./DeletePost";
import { useAuth } from "../context/AuthContext";
import sortByDateDescending from "../utils/sortByDate";

function UserPosts({ refreshKey, postUser, waitingForProfile, profileError }) {
  const [userPosts, setUserPosts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const targetPostUser = postUser || user?.username || "";
  const sortedUserPosts = sortByDateDescending(userPosts);

  useEffect(() => {
    const fetchPosts = async () => {
      setError(null);
      setLoading(true);

      if (waitingForProfile) {
        return;
      }

      try {
        if (profileError) {
          throw new Error(profileError);
        }

        if (!targetPostUser) {
          throw new Error("Log in to see your posts.");
        }

        const response = await fetch(
          `http://localhost:3000/api/users/${encodeURIComponent(targetPostUser)}/posts`,
        );
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Could not fetch friends");
        }

        setUserPosts(Array.isArray(result) ? result : []);
      } catch (error) {
        setError(error.message || "Failed to connect to the server.");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [targetPostUser, waitingForProfile, profileError, refreshKey]);

  const handleDelete = (deletedPostId) => {
    setUserPosts((posts) => posts.filter((post) => post._id !== deletedPostId));
  };

  return (
    <div className="user-posts">
      <h3>{postUser ? "Posts" : "My Posts"}</h3>
      <div className="posts-list">
        {error ? (
          <p role="alert">{error}</p>
        ) : loading ? (
          <p>Loading posts...</p>
        ) : userPosts.length > 0 ? (
          sortedUserPosts.map((post) => (
            <PostComponent
              key={post._id}
              id={post._id}
              userId={post.userId}
              username={post.postUser}
              image={post.image}
              caption={post.caption}
              hashtags={post.hastags ?? post.hashtags}
              edit={!postUser && <EditPost />}
              delete={!postUser && <DeletePost postId={post._id} onDelete={handleDelete} />}
            />
          ))
        ) : (
          <p>No posts yet. Create your first post!</p>
        )}
      </div>
    </div>
  );
}

export default UserPosts;
