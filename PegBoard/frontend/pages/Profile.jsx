import { useState } from "react";
import Navbar from "../components/Navbar";
import ProfileComponent from "../components/ProfileComponent";
import EditProfile from "../components/EditProfile";
import UserPosts from "../components/UserPosts";
import Friends from "../components/Friends";
import CreatePost from "../components/CreatePost";
import ProfileAlbums from "../components/ProfileAlbums";
import FriendRequests from "../components/FriendRequests";
import { useAuth } from "../context/AuthContext";
import "../styles/profile.css";

function Profile() {
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [postsRefreshKey, setPostsRefreshKey] = useState(0);
  const { user, setUser } = useAuth();
  const userId = user?.id ?? "";
  const [profileRefreshKey, setProfileRefreshKey] = useState(0);

  const handleSaveProfile = async (updates) => {
    if (!userId) {
      throw new Error("Please log in before updating your profile.");
    }

    const imageStorageKey = `profileImage:${userId}`;
    const profileData = new FormData();
    Object.entries(updates).forEach(([field, value]) => {
      profileData.append(field, value);
    });

    const response = await fetch(`http://localhost:3000/api/users/${encodeURIComponent(userId)}`, {
      method: "PATCH",
      body: profileData,
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Could not update your profile.");
    }

    setUser((currentUser) => ({
      ...currentUser,
      username: result.username,
      image: result.image,
    }));

    if (updates.image) {
      try {
        localStorage.setItem(imageStorageKey, result.image);
      } catch (storageError) {
        console.error("Could not cache the profile picture path:", storageError);
      }
    }

    setProfileRefreshKey((key) => key + 1);
    setShowEditProfile(false);
  };

  const handleCreatePost = async (formData) => {
    if (!user?.username || !userId) {
      throw new Error("Please log in before creating a post.");
    }

    const postData = new FormData();
    postData.append("caption", formData.caption);
    postData.append("postUser", user.username);
    postData.append("userId", formData.userId);
    postData.append(
      "hastags",
      JSON.stringify(formData.Hashtags.split(/[\s,]+/).filter(Boolean)),
    );
    if (formData.image) {
      postData.append("image", formData.image);
    }

    const response = await fetch("http://localhost:3000/api/posts", {
      method: "POST",
      body: postData,
    });
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      throw new Error(
        `The post API returned a non-JSON response (HTTP ${response.status}). Restart the backend from the PegBoard folder with "node backend/server.js" and try again.`,
      );
    }
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to create post");
    }

    setShowCreatePost(false);
    setPostsRefreshKey((key) => key + 1);
  };

  return (
    <>
      <Navbar name="Profile"></Navbar>
      <main className="profile-page">
        <div className="profile-content">
          <section className="profile-section">
            <ProfileComponent refreshKey={profileRefreshKey} />
            <button
              type="button"
              className="edit-profile-btn"
              onClick={() => setShowEditProfile(!showEditProfile)}
            >
              {showEditProfile ? "Cancel" : "Edit Profile"}
            </button>
          </section>

          {showEditProfile && (
            <section className="edit-profile-section">
              <EditProfile onSave={handleSaveProfile} />
            </section>
          )}

          <section className="create-post-section profile-create-post">
            <button
              type="button"
              className="create-post-toggle-btn"
              onClick={() => setShowCreatePost(!showCreatePost)}
            >
              {showCreatePost ? "Cancel" : "Create New Post"}
            </button>
            {showCreatePost && (
              <CreatePost onSubmit={handleCreatePost} userId={userId} />
            )}
          </section>

          <section className="user-posts-section profile-content-card font-['Love_Ya_Like_A_Sister']">
            <UserPosts refreshKey={postsRefreshKey} />
          </section>

          <section className="">
            <ProfileAlbums />
          </section>

          <section className="friends-section profile-content-card">
            <Friends />
          </section>
          <FriendRequests />
        </div>
      </main>
    </>
  );
}
export default Profile;
