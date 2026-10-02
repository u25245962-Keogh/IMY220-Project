import { useState } from "react";
import "../styles/Posts.css";

function EditPost({ postId, onSave, initialCaption = "" }) {
  const [caption, setCaption] = useState(initialCaption);
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave({
        postId,
        caption,
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="edit-post">
      {!isEditing ? (
        <button type="button" onClick={() => setIsEditing(true)}>
          Edit
        </button>
      ) : (
        <>
          <h3>Edit Post</h3>
          <form onSubmit={handleSubmit} className="edit-post-form">
            <div className="form-group">
              <label htmlFor="caption">Caption</label>
              <textarea
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Edit your post caption..."
                rows="4"
                required
              />
            </div>
            <div className="form-buttons">
              <button type="submit" className="save-button">
                Save Changes
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

export default EditPost;
