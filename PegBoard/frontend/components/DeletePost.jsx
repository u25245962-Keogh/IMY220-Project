import { useAuth } from "../context/AuthContext";

function DeletePost({ postId, onDelete }) {
  const { user } = useAuth();

  async function handleDelete(e) {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost:3000/api/posts/${postId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not delete post");
      }

      onDelete?.(postId);
    } catch (error) {
      window.alert(error.message || "Failed to connect to the server.");
    }
  }

  return (
    <form className="delete-control-form" onSubmit={handleDelete}>
      <button
        className="delete-cross-button"
        type="submit"
        aria-label="Delete post"
        title="Delete post"
      >
        ×
      </button>
    </form>
  );
}

export default DeletePost