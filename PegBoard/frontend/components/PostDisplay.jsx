import "../styles/Posts.css";
import { useState } from "react";

function PostDisplay({ postId, username, caption, date, likes = 0 }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");

  const handleLike = async () => {
    setIsUpdating(true);
    setError("");

    try {
      const response = await fetch(`http://localhost:3000/api/posts/${postId}/likes`, {
        method: liked ? "DELETE" : "POST",
      });
      const updatedPost = await response.json();

      if (!response.ok) {
        throw new Error(updatedPost.message || "Could not update like");
      }

      if (typeof updatedPost.likes !== "number") {
        throw new Error("The likes API response did not include a like count");
      }
      setLikeCount(updatedPost.likes);
      setLiked(!liked);
    } catch (requestError) {
      setError(requestError.message || "Failed to update like.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="post-display">
      <div className="post-header">
        <h2>{username}</h2>
        {date && <time dateTime={date}>{new Date(date).toLocaleString()}</time>}
      </div>
      <div className="post-content">
        <p className="post-caption">{caption}</p>
        <div className="post-actions">
          <button className="like-button" type="button" onClick={handleLike} disabled={isUpdating} aria-pressed={liked}>
            {liked ? "Unlike" : "Like"} ({likeCount})
          </button>
          <button className="comment-button" type="button" onClick={() => document.getElementById("post-comment-input")?.focus()}>
            Comment
          </button>
        </div>
        {error && <p role="alert">{error}</p>}
      </div>
    </div>
  );
}

export default PostDisplay;
