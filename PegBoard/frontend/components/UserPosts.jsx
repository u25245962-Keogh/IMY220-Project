import PostComponent from "./PostComponent";
import "../styles/Posts.css";
import { useEffect, useState } from "react";
import EditPost from "./EditPost";
import DeletePost from "./DeletePost";

function UserPosts({ refreshKey, postUser, waitingForProfile, profileError }) {
  const [userPosts, setUserPosts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

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

        let targetPostUser = postUser;
        if (!targetPostUser) {
          const userCookie = document.cookie
            .split("; ")
            .find((cookie) => cookie.startsWith("postUser="));
          targetPostUser = userCookie
            ? decodeURIComponent(userCookie.slice("postUser=".length))
            : "";
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
  }, [postUser, waitingForProfile, profileError, refreshKey]);

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
          userPosts.map((post) => (
            <PostComponent
              key={post._id}
              username={post.postUser}
              // date={post.date}
              image={post.image}
              caption={post.caption}
              edit={<EditPost />}
              delete={<DeletePost postId={post._id} onDelete={handleDelete} />}
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
