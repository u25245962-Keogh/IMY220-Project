import { useState } from "react";
import "../styles/Posts.css";

function CreatePost({ onSubmit }) {
  const [formData, setFormData] = useState({
    caption: "",
    image: "",
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
    // Reset form
    setFormData({
      caption: "",
      image: "",
    });
  };

  return (
    <div className="create-post">
      <h3>Create New Post</h3>
      <form onSubmit={handleSubmit} className="post-form">
        <div className="form-group">
          <label htmlFor="image">Upload Image</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            className="image-input"
          />
          {formData.image && (
            <div className="image-preview">
              <img src={formData.image} alt="Preview" />
            </div>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="caption">Caption</label>
          <textarea
            id="caption"
            name="caption"
            value={formData.caption}
            onChange={handleChange}
            placeholder="Write a caption for your post..."
            rows="4"
            required
          />
        </div>
        <button type="submit" className="submit-button">
          Post
        </button>
      </form>
    </div>
  );
}

export default CreatePost;
