import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/profile.css";

const emptyProfile = {
  username: "",
  bio: "",
  email: "",
  name: "",
  surname: "",
  image: "",
};

const maxProfileImageSize = 20 * 1024 * 1024;
const supportedImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

function EditProfile({ onSave }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState(emptyProfile);
  const [originalData, setOriginalData] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchProfile = async () => {
      if (!user?.id) {
        setError("Please log in to edit your profile.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:3000/api/users/${encodeURIComponent(user.id)}`,
        );
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Could not load profile details.");
        }

        const profileData = {
          username: result.username ?? "",
          bio: result.bio ?? "",
          email: result.email ?? "",
          name: result.name ?? "",
          surname: result.surname ?? "",
          image: result.image ?? "",
        };
        if (active) {
          setFormData(profileData);
          setOriginalData(profileData);
        }
      } catch (fetchError) {
        if (active) {
          setError(fetchError.message || "Could not load profile details.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchProfile();
    return () => {
      active = false;
    };
  }, [user?.id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!supportedImageTypes.includes(file.type)) {
      setError("Choose a JPEG, PNG, GIF, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > maxProfileImageSize) {
      setError("Profile pictures must be 20 MB or smaller.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setError("Could not read the selected image.");
        return;
      }

      setFormData((currentData) => ({
        ...currentData,
        image: reader.result,
      }));
      setError("");
    };
    reader.onerror = () => {
      setError("Could not read the selected image.");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const updates = Object.fromEntries(
      Object.entries(formData).filter(([field, value]) => value !== originalData[field]),
    );
    if (Object.keys(updates).length === 0) {
      setError("Update at least one profile field before saving.");
      return;
    }

    setIsSaving(true);
    try {
      await onSave(updates);
      setOriginalData(formData);
    } catch (saveError) {
      setError(saveError.message || "Could not save profile details.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <p>Loading profile details...</p>;
  }

  return (
    <div className="edit-profile profile-creation-form">
      <h3>Edit Profile</h3>
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label htmlFor="edit-name">Name</label>
          <input
            type="text"
            id="edit-name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
          />
        </div>
        <div className="form-group">
          <label htmlFor="edit-surname">Surname</label>
          <input
            type="text"
            id="edit-surname"
            name="surname"
            value={formData.surname}
            onChange={handleChange}
            placeholder="Enter your surname"
          />
        </div>
        <div className="form-group">
          <label htmlFor="edit-username">Username</label>
          <input
            type="text"
            id="edit-username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your username"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="edit-bio">Bio</label>
          <textarea
            id="edit-bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell us about yourself"
            rows={4}
          />
        </div>
        <div className="form-group">
          <label htmlFor="edit-email">Email</label>
          <input
            type="email"
            id="edit-email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="edit-image">Profile picture</label>
          <input
            type="file"
            id="edit-image"
            name="image"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleImageChange}
          />
          {formData.image && (
            <img
              src={formData.image}
              alt="Profile picture preview"
              className="profile-img profile-edit-preview"
            />
          )}
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="profile-submit-button" type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

export default EditProfile;
