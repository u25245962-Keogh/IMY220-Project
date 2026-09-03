import { useState } from "react";
import "../styles/Posts.css";

function EditPost({ postId, onSave, initialCaption = "" }) {
  const [caption, setCaption] = useState(initialCaption);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave({
        postId,
        caption,
      });
    }
  };

  return (
    <div className="edit-post">
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
          <button type="button" className="cancel-button">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditPost;
