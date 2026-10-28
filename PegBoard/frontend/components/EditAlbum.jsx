import { useState } from "react";

function EditAlbum({
  albumId,
  initialName,
  initialDescription,
  initialPostIds = [],
  userPosts = [],
  onSave,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [selectedPostIds, setSelectedPostIds] = useState(
    initialPostIds.map(String),
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const togglePost = (postId) => {
    const normalizedPostId = String(postId);
    setSelectedPostIds((selected) =>
      selected.includes(normalizedPostId)
        ? selected.filter((id) => id !== normalizedPostId)
        : [...selected, normalizedPostId],
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      await onSave(albumId, { name, description, postIds: selectedPostIds });
      setIsEditing(false);
    } catch (saveError) {
      setError(saveError.message || "Could not update album.");
    } finally {
      setSaving(false);
    }
  };

  if (!isEditing) {
    return (
      <button
        type="button"
        className="create-post-toggle-btn"
        onClick={() => {
          setName(initialName);
          setDescription(initialDescription);
          setSelectedPostIds(initialPostIds.map(String));
          setError("");
          setIsEditing(true);
        }}
      >
        Edit Album
      </button>
    );
  }

  return (
    <form className="album-form edit-album-form" onSubmit={handleSubmit}>
      <h3>Edit Album</h3>
      <label htmlFor={`edit-album-name-${albumId}`}>Name</label>
      <input
        id={`edit-album-name-${albumId}`}
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
      />

      <label htmlFor={`edit-album-description-${albumId}`}>Description</label>
      <textarea
        id={`edit-album-description-${albumId}`}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        rows={3}
      />

      <fieldset className="album-post-selection">
        <legend>Posts in this album</legend>
        {userPosts.length > 0 ? (
          userPosts.map((post) => {
            const postId = String(post._id ?? post.id);
            return (
              <label key={postId} className="album-post-option">
                <input
                  type="checkbox"
                  checked={selectedPostIds.includes(postId)}
                  onChange={() => togglePost(postId)}
                />
                {post.caption || "Untitled post"}
              </label>
            );
          })
        ) : (
          <p>You have no posts to add to this album.</p>
        )}
      </fieldset>

      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="edit-album-actions">
        <button className="profile-submit-button" type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <button
          className="create-post-toggle-btn"
          type="button"
          onClick={() => {
            setName(initialName);
            setDescription(initialDescription);
            setSelectedPostIds(initialPostIds.map(String));
            setError("");
            setIsEditing(false);
          }}
          disabled={saving}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default EditAlbum;
