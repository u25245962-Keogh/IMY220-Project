import { useState } from "react";
import Navbar from "../components/Navbar";
import ProfileComponent from "../components/ProfileComponent";
import EditProfile from "../components/EditProfile";
import UserPosts from "../components/UserPosts";
import Friends from "../components/Friends";
import CreatePost from "../components/CreatePost";

function Profile() {
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);

  const handleSaveProfile = (formData) => {
    console.log("Profile saved:", formData);
    setShowEditProfile(false);
    // Update profile data here
  };

  const handleCreatePost = (postData) => {
    console.log("Post created:", postData);
    setShowCreatePost(false);
    // Add post to backend here
  };

  return (
    <>
      <Navbar name="Profile"></Navbar>
      <div className="profile-page">
        <section className="profile-section">
          <ProfileComponent />
          <button 
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

        <section className="create-post-section">
          <button 
            className="create-post-toggle-btn"
            onClick={() => setShowCreatePost(!showCreatePost)}
          >
            {showCreatePost ? "Cancel" : "Create New Post"}
          </button>
          {showCreatePost && <CreatePost onSubmit={handleCreatePost} />}
        </section>

        <section className="user-posts-section">
          <UserPosts />
        </section>

        <section className="friends-section">
          <Friends />
        </section>
      </div>
    </>
  );
}
export default Profile;

