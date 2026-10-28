import { useState } from "react";

function PostActions({ postId, likes = 0 }) {
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
    <div className="absolute bottom-8 right-8 flex flex-col items-center gap-2 text-center text-gray-900">
      <button
        className="flex size-14 flex-col items-center justify-center rounded-full bg-[#95c623] text-white shadow-lg ring-2 ring-white/80 hover:bg-green-700 disabled:opacity-60"
        type="button"
        onClick={handleLike}
        disabled={isUpdating}
        aria-pressed={liked}
        aria-label={`${liked ? "Unlike" : "Like"} post`}
      >
        <span className="text-xl leading-none" aria-hidden="true">
          👍
        </span>
        <span className="text-xs leading-none">{likeCount}</span>
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}

export default PostActions;
