import { useState } from "react";
import "../styles/Posts.css";

function Comments({ postId, comments = [], onPostUpdated }) {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const userCookie = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("postUser="));
  const currentUser = userCookie
    ? decodeURIComponent(userCookie.slice("postUser=".length))
    : "";

  const handleAddComment = async (e) => {
    e.preventDefault();
    const comment = newComment.trim();
    if (!comment || isSubmitting) return;
    if (!currentUser) {
      setError("Log in to post a comment.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`http://localhost:3000/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: { username: currentUser, comment } }),
      });
      const updatedPost = await response.json();

      if (!response.ok) {
        throw new Error(updatedPost.message || "Could not post comment");
      }

      onPostUpdated?.(updatedPost);
      setNewComment("");
    } catch (requestError) {
      setError(requestError.message || "Failed to post comment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="comments-section">
      <h3>Comments</h3>
      <div className="comments-list">
        {comments.map((comment, index) => {
          const text = typeof comment === "string" ? comment : comment?.comment ?? comment?.text ?? "";
          const username = typeof comment === "object" && comment !== null
            ? comment.username ?? comment.user ?? ""
            : "";

          return (
            <div key={comment?._id ?? comment?.id ?? `${index}-${text}`} className="comment">
              {username && <strong>{username}</strong>}
              <p className="comment-text">{text}</p>
            </div>
          );
        })}
      </div>
      <form onSubmit={handleAddComment} className="add-comment-form">
        <input
          id="post-comment-input"
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="comment-input"
          required
          disabled={isSubmitting}
        />
        <button type="submit" className="comment-submit" disabled={isSubmitting || !newComment.trim()}>
          Post
        </button>
      </form>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}

export default Comments;
