import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import UserPosts from "../components/UserPosts";
import FeedAlbums from "../components/FeedAlbums";
import Friends from "../components/Friends";
import "../styles/profile.css";
import {
  getCachedProfileImage,
  resolveProfileImageUrl,
} from "../utils/profileImage";

function OtherProfile() {
  const [profile, setProfile] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [error, setError] = useState("");
  const [albumsError, setAlbumsError] = useState("");
  const [albumsLoading, setAlbumsLoading] = useState(true);
  const { id: profileId } = useParams();

  useEffect(() => {
    let isActive = true;
    setProfile(null);
    setError("");
    setAlbums([]);
    setAlbumsError("");
    setAlbumsLoading(true);

    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/users/${encodeURIComponent(profileId ?? "")}`,
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load this profile.");
        }

        if (!isActive) return;
        setProfile(data);

        try {
          const albumsResponse = await fetch("http://localhost:3000/api/albums");
          const albumsData = await albumsResponse.json();
          if (!albumsResponse.ok) {
            throw new Error(albumsData.message || "Unable to load this user's albums.");
          }

          if (isActive) {
            setAlbums(
              (Array.isArray(albumsData) ? albumsData : []).filter(
                (album) => String(album.userId) === String(data._id),
              ),
            );
          }
        } catch (albumsFetchError) {
          if (isActive) {
            setAlbumsError(
              albumsFetchError.message || "Unable to load this user's albums.",
            );
          }
        }
      } catch (fetchError) {
        if (isActive) {
          setError(fetchError.message || "Unable to load this profile.");
        }
      } finally {
        if (isActive) {
          setAlbumsLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isActive = false;
    };
  }, [profileId]);

  if (error) {
    return (
      <>
        <Navbar name="Profile" />
        <main className="profile-page">
          <div className="profile-content">
            <p className="text-sm font-medium text-red-700" role="alert">{error}</p>
          </div>
        </main>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Navbar name="Profile" />
        <main className="profile-page">
          <div className="profile-content">
            <p className="text-sm text-stone-600">Loading profile...</p>
          </div>
        </main>
      </>
    );
  }

  const { username, name, surname, email, bio } = profile;
  const fullName = [name, surname].filter(Boolean).join(" ");
  const profileImage = resolveProfileImageUrl(
    profile.image || getCachedProfileImage(profile._id),
  );

  return (
    <>
      <Navbar name="Profile" />
      <main className="profile-page">
        <div className="profile-content">
          <section className="profile-section">
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
                <h2>{fullName || username || "Unnamed user"}</h2>
                {email && <p>{email}</p>}
                {bio && <p>{bio}</p>}
              </div>
            </div>
          </section>

          <section className="user-posts-section profile-content-card">
            <UserPosts
              postUser={username}
              waitingForProfile={!username}
              profileError={!username ? "This profile has no username." : ""}
            />
          </section>

          <section className="profile-content-card">
            <div className="profile-albums">
              <h2>Albums</h2>
              {albumsLoading ? (
                <p>Loading albums...</p>
              ) : albumsError ? (
                <p role="alert">{albumsError}</p>
              ) : albums.length > 0 ? (
                <FeedAlbums posts={albums} />
              ) : (
                <p>No albums yet.</p>
              )}
            </div>
          </section>

          <section className="friends-section profile-content-card">
            <Friends friends={Array.isArray(profile.friends) ? profile.friends : []} />
          </section>
        </div>
      </main>
    </>
  );
}

export default OtherProfile;
