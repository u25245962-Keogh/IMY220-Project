import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import UserPosts from "../components/UserPosts";
import FeedAlbums from "../components/FeedAlbums";
import Friends from "../components/Friends";
import { useAuth } from "../context/AuthContext";
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
  const [isFriend, setIsFriend] = useState(false);
  const [friendshipLoading, setFriendshipLoading] = useState(true);
  const [friendActionLoading, setFriendActionLoading] = useState(false);
  const [friendActionError, setFriendActionError] = useState("");
  const [friendActionMessage, setFriendActionMessage] = useState("");
  const { id: profileId } = useParams();
  const { user } = useAuth();
  const viewerIsAdmin = user?.username === "Admin";

  useEffect(() => {
    let isActive = true;
    setProfile(null);
    setError("");
    setAlbums([]);
    setAlbumsError("");
    setAlbumsLoading(true);
    setFriendshipLoading(Boolean(user?.id));
    setFriendActionError("");
    setFriendActionMessage("");

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

        let viewerIsFriend =
          viewerIsAdmin ||
          (Boolean(user?.id) && String(user.id) === String(data._id));
        if (user?.id && String(user.id) !== String(data._id)) {
          if (!viewerIsAdmin) {
            const ownProfileResponse = await fetch(
              `http://localhost:3000/api/users/${encodeURIComponent(user.id)}`,
            );
            const ownProfile = await ownProfileResponse.json();
            if (!ownProfileResponse.ok) {
              throw new Error(ownProfile.message || "Unable to check your friends.");
            }
            if (isActive) {
              const ownFriends = Array.isArray(ownProfile.friends)
                ? ownProfile.friends
                : [];
              viewerIsFriend = ownFriends.some(
                (friend) =>
                  String(friend?._id ?? friend?.id ?? friend) === String(data._id) ||
                  String(friend?._id ?? friend?.id ?? friend) === data.username,
              );
              setIsFriend(viewerIsFriend);
            }
          } else if (isActive) {
            setIsFriend(false);
          }
        } else if (isActive) {
          setIsFriend(false);
        }

        if (viewerIsFriend) {
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
        }
      } catch (fetchError) {
        if (isActive) {
          setError(fetchError.message || "Unable to load this profile.");
        }
      } finally {
        if (isActive) {
          setAlbumsLoading(false);
          setFriendshipLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isActive = false;
    };
  }, [profileId, user?.id, viewerIsAdmin]);

  const handleFriendAction = async () => {
    if (!user?.id || !profile?._id) return;

    setFriendActionLoading(true);
    setFriendActionError("");
    setFriendActionMessage("");
    try {
      const response = await fetch(
        isFriend
          ? `http://localhost:3000/api/users/${encodeURIComponent(user.id)}/friends/${encodeURIComponent(profile._id)}`
          : `http://localhost:3000/api/users/${encodeURIComponent(profile._id)}/requests`,
        {
          method: isFriend ? "DELETE" : "POST",
          ...(isFriend
            ? {}
            : {
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requesterId: user.id }),
              }),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Unable to update this friendship.");
      }

      if (isFriend) {
        setIsFriend(false);
        setFriendActionMessage("Friend removed.");
      } else {
        setFriendActionMessage("Friend request sent.");
      }
    } catch (actionError) {
      setFriendActionError(
        actionError.message || "Unable to update this friendship.",
      );
    } finally {
      setFriendActionLoading(false);
    }
  };

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

  const { username, name, surname, bio } = profile;
  const canViewPrivateProfile =
    viewerIsAdmin ||
    (Boolean(user?.id) && String(user.id) === String(profile._id)) ||
    (!friendshipLoading && isFriend);
  const fullName = [name, surname].filter(Boolean).join(" ");
  const profileImage = resolveProfileImageUrl(
    profile.image || getCachedProfileImage(profile._id),
  );
  const hasPendingRequest = Array.isArray(profile.requests) &&
    profile.requests.some(
      (requester) =>
        String(requester?._id ?? requester?.id ?? requester) === String(user?.id) ||
        String(requester?._id ?? requester?.id ?? requester) === user?.username,
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
                {canViewPrivateProfile && bio && <p>{bio}</p>}
              </div>
            </div>
            {user?.id && String(user.id) !== String(profile._id) && (
              <div>
                <button
                  type="button"
                  className="profile-submit-button"
                  onClick={handleFriendAction}
                  disabled={
                    friendshipLoading ||
                    friendActionLoading ||
                    (!isFriend && hasPendingRequest)
                  }
                >
                  {friendActionLoading
                    ? "Please wait..."
                    : isFriend
                      ? "Remove friend"
                      : hasPendingRequest ||
                          friendActionMessage === "Friend request sent."
                        ? "Request sent"
                        : "Send friend request"}
                </button>
                {friendActionError && (
                  <p role="alert" className="text-sm font-medium text-red-700">
                    {friendActionError}
                  </p>
                )}
                {friendActionMessage && (
                  <p role="status">{friendActionMessage}</p>
                )}
              </div>
            )}
          </section>

          {canViewPrivateProfile ? (
            <>
              <section className="user-posts-section profile-content-card font-['Love_Ya_Like_A_Sister']">
                <UserPosts
                  postUser={username}
                  waitingForProfile={!username}
                  profileError={
                    !username ? "This profile has no username." : ""
                  }
                />
              </section>

              <section className="profile-content-card font-['Love_Ya_Like_A_Sister']">
                <div className="profile-albums">
                  <h2>Albums</h2>
                  {albumsLoading ? (
                    <p>Loading albums...</p>
                  ) : albumsError ? (
                    <p role="alert">{albumsError}</p>
                  ) : albums.length > 0 ? (
                    <FeedAlbums posts={albums} />
                  ) : (
                    <p className="justify-self-center">No albums yet.</p>
                  )}
                </div>
              </section>

              <section className="friends-section profile-content-card">
                <Friends
                  friends={
                    Array.isArray(profile.friends) ? profile.friends : []
                  }
                />
              </section>
            </>
          ) : (
            <p className="profile-content-card">
              {friendshipLoading
                ? "Checking friendship..."
                : "Add this user as a friend to see their bio, posts, and friends."}
            </p>
          )}
        </div>
      </main>
    </>
  );
}

export default OtherProfile;
