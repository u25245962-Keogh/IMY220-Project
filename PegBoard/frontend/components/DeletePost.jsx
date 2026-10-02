function DeletePost({ postId, onDelete }) {
  async function handleDelete(e) {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost:3000/api/posts/${postId}`, {
        method: "DELETE",
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
    <form onSubmit={handleDelete}>
      <button type="submit">Delete</button>
    </form>
  );
}

export default DeletePost