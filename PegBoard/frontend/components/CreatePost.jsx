import { useState } from "react";
import "../styles/Posts.css";

function CreatePost({ onSubmit, userId }) {
  const [formData, setFormData] = useState({
    caption: "",
    image: "",
    Hashtags: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          image: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await onSubmit({ ...formData, userId });

      setFormData({
        caption: "",
        image: "",
        Hashtags: "",
      });
    } catch (submitError) {
      setError(submitError.message || "Could not create post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-post profile-creation-form">
      <h3>Create New Post</h3>
      <form onSubmit={handleSubmit} className="post-form">
        <input type="hidden" name="userId" value={userId ?? ""} />
        <div className="form-group">
          <label htmlFor="image">Upload Image</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            className="image-input profile-file-input"
          />
          <p className="form-help">Choose an image to share with your post.</p>
          {formData.image && (
            <div className="image-preview profile-image-preview">
              <img src={formData.image} alt="Preview" />
            </div>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="hashtags">Hashtags</label>
          <textarea
            id="hashtags"
            name="Hashtags"
            value={formData.Hashtags}
            onChange={handleChange}
            placeholder="#art, #paintings"
            rows="2"
            required
          />
          <p className="form-help">Separate hashtags with commas or spaces.</p>
        </div>
        <div className="form-group">
          <label htmlFor="caption">Caption</label>
          <textarea
            id="caption"
            name="caption"
            value={formData.caption}
            onChange={handleChange}
            placeholder="Write a caption for your post..."
            rows="3"
            required
          />
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button type="submit" className="submit-button profile-submit-button" disabled={isSubmitting}>
          {isSubmitting ? "Posting..." : "Share Post"}
        </button>
      </form>
    </div>
  );
}

export default CreatePost;
