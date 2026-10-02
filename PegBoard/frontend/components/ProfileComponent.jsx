import { useEffect, useState } from "react";
import "../styles/profile.css";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const userCookie = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("userId="));
    const userId = userCookie?.slice("userId=".length);

    if (!userId) {
      setError("Please log in to view your profile.");
      return;
    }

    let isActive = true;

    const fetchProfile = async () => {
      try {
        const decodedUserId = decodeURIComponent(userId);
        const response = await fetch(
          `http://localhost:3000/api/users/${encodeURIComponent(decodedUserId)}`
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
  }, []);

  if (error) {
    return <p className="text-sm font-medium text-red-700" role="alert">{error}</p>;
  }

  if (!profile) {
    return <p className="text-sm text-stone-600">Loading profile...</p>;
  }

  const { username, bio, followers, following } = profile;

  return (
    <div className="profile-info">
      <div className="profile-header flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
        <div className="profile-avatar size-28 shrink-0 overflow-hidden rounded-full border-4 border-orange-100 bg-stone-100 sm:size-32">
          <img
            src="https://static.vecteezy.com/system/resources/thumbnails/008/695/917/small/no-image-available-icon-simple-two-colors-template-for-no-image-or-picture-coming-soon-and-placeholder-illustration-isolated-on-white-background-vector.jpg"
            alt={username || "User profile"}
            className="avatar-image size-full object-cover"
          />
        </div>
        <div className="profile-details min-w-0 flex-1">
          <h2 className="break-words text-2xl font-bold text-stone-900 sm:text-3xl">{username || "Unnamed user"}</h2>
          {bio && <p className="bio mt-2 max-w-2xl whitespace-pre-wrap text-sm leading-6 text-stone-600">{bio}</p>}
          <div className="profile-stats mt-5 flex flex-wrap gap-3">
            {followers != null && (
              <div className="stat flex min-w-28 flex-col rounded-md bg-stone-100 px-4 py-3">
                <span className="stat-number text-lg font-bold text-stone-900">{followers}</span>
                <span className="stat-label text-xs font-medium uppercase text-stone-500">Followers</span>
              </div>
            )}
            {following != null && (
              <div className="stat flex min-w-28 flex-col rounded-md bg-stone-100 px-4 py-3">
                <span className="stat-number text-lg font-bold text-stone-900">{following}</span>
                <span className="stat-label text-xs font-medium uppercase text-stone-500">Following</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
