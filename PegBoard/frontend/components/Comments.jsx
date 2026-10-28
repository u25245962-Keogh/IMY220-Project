import { useState } from "react";
import "../styles/Posts.css";
import { useAuth } from "../context/AuthContext";

function Comments({ postId, comments = [], onPostUpdated }) {

  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const currentUser = user?.username ?? "";

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
    <div className="flex w-full flex-col gap-3">
      <h3 className="m-0 text-xl">Comments</h3>
      <div className="flex max-h-72 flex-col gap-3 overflow-y-auto rounded-xl bg-white/30 p-4">
        {comments.map((comment, index) => {
          const text = typeof comment === "string" ? comment : comment?.comment ?? comment?.text ?? "";
          const username = typeof comment === "object" && comment !== null
            ? comment.username ?? comment.user ?? ""
            : "";

          return (
            <div key={comment?._id ?? comment?.id ?? `${index}-${text}`} className="break-words">
              {username && <strong>{username}</strong>}
              <p className="m-0">{text}</p>
            </div>
          );
        })}
      </div>
      <form onSubmit={handleAddComment} className="flex w-full gap-2">
        <input
          id="post-comment-input"
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="min-w-0 flex-1 rounded-lg border border-green-900/30 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-500"
          required
          disabled={isSubmitting}
        />
        <button type="submit" className="rounded-lg bg-green-900 px-4 py-2 text-white hover:bg-green-950 disabled:opacity-60" disabled={isSubmitting || !newComment.trim()}>
          Post
        </button>
      </form>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}

export default Comments;
