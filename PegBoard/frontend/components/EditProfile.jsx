import { useState } from "react";
import "../styles/profile.css";

function EditProfile({ onSave, initialData = {} }) {
  const [formData, setFormData] = useState({
    username: initialData.username || "",
    bio: initialData.bio || "",
    email: initialData.email || "",
    website: initialData.website || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    //e.preventDefault();

    const userCookie = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("userId="));
    const userId = userCookie?.slice("userId=".length);

    if (name === "" && surname === "" && email === "" && bio === "" && username ==="") {
      setError("Fill in at least one field!");
      return;
    }

   

    //setError("Login details are valid.");

    try {
      const response = await fetch(
        `http://localhost:3000/api/users/${encodeURIComponent(decodeURIComponent(userId))}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            Object.fromEntries(
              Object.entries(formData).filter(([, value]) => value.length > 0),
            ),
          ),
        },
      );
      const data = await response.json();
      if (response.ok) {
        
      } else {
        setError(data.message || "invalid changes");
      }
    } catch (error) {
      console.error(error);
      setError("failed to connect to the server.");
    }
  };

  return (
    <div className="edit-profile">
      <h3>Edit Profile</h3>
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label htmlFor="name">name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
          />
        </div>
        <div className="form-group">
          <label htmlFor="surname">surname</label>
          <input
            type="text"
            id="surname"
            name="surname"
            value={formData.surname}
            onChange={handleChange}
            placeholder="Enter your surname"
          />
        </div>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your username"
          />
        </div>
        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell us about yourself"
            rows="4"
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
          />
        </div>

        <button type="submit" className="save-button">
          Save Changes
        </button>
      </form>
    </div>
  );
}

export default EditProfile;
