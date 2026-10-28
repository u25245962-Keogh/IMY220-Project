import { useEffect, useState } from "react";
import "../styles/profile.css";
import { useAuth } from "../context/AuthContext";
import {
  getCachedProfileImage,
  resolveProfileImageUrl,
} from "../utils/profileImage";

function Profile({ refreshKey }) {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    let isActive = true;

    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/users/${encodeURIComponent(user.id)}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load your profile.");
        }

        if (isActive) {
          setProfile(data);
        }
      } catch (fetchError) {
        if (isActive) {
          setError(fetchError.message || "Unable to load your profile.");
        }
      }
    };

    fetchProfile();
    return () => {
      isActive = false;
    };
  }, [user?.id, refreshKey]);

  if (!user?.id) {
    return <p className="text-sm font-medium text-red-700" role="alert">Please log in to view your profile.</p>;
  }

  if (error) {
    return <p className="text-sm font-medium text-red-700" role="alert">{error}</p>;
  }

  if (!profile) {
    return <p className="text-sm text-stone-600">Loading profile...</p>;
  }

  const { username, name, surname, email, bio } = profile;
  const cachedImage = getCachedProfileImage(user.id);
  const profileImage = resolveProfileImageUrl(profile.image || cachedImage);

  return (
    <div className="profile-info">
      <div className="profile-avatar profile-note">
          <span className="profile-pin" aria-hidden="true" />
          <img
            src={profileImage}
            alt={username || "User profile"}
            className="profile-img"
          />
      </div>
      <div className="profile-details profile-note">
        <span className="profile-pin" aria-hidden="true" />
        <h2>{[name, surname].filter(Boolean).join(" ") || username || "Unnamed user"}</h2>
        {email && <p>{email}</p>}
        {bio && <p>{bio}</p>}
      </div>
    </div>
  );
}

export default Profile;
