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
  const [postsRefreshKey, setPostsRefreshKey] = useState(0);

  const handleSaveProfile = (formData) => {
    console.log("Profile saved:", formData);
    setShowEditProfile(false);
   
  };

  const handleCreatePost = async (formData) => {
    const postUserCookie = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("postUser="));
    const postUser = postUserCookie?.slice("postUser=".length);

    if (!postUser) {
      throw new Error("Please log in before creating a post.");
    }

    const postData = {
      caption: formData.caption,
      image: formData.image,
      postUser: decodeURIComponent(postUser),
      hastags: formData.Hashtags.split(/[\s,]+/).filter(Boolean),
    };
    const response = await fetch("http://localhost:3000/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });
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
      <main className="profile-page min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <section className="profile-section relative rounded-lg border border-stone-200 bg-white/90 p-5 shadow-sm sm:p-8">
          <ProfileComponent />
          <button 
            className="edit-profile-btn mt-6 inline-flex min-h-10 items-center justify-center rounded-md bg-orange-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
            onClick={() => setShowEditProfile(!showEditProfile)}
          >
            {showEditProfile ? "Cancel" : "Edit Profile"}
          </button>
        </section>

        {showEditProfile && (
          <section className="edit-profile-section rounded-lg border border-stone-200 bg-white/90 p-5 shadow-sm sm:p-8">
            <EditProfile onSave={handleSaveProfile} />
          </section>
        )}

        <section className="create-post-section rounded-lg border border-stone-200 bg-white/90 p-5 shadow-sm sm:p-8">
          <button 
            className="create-post-toggle-btn inline-flex min-h-10 items-center justify-center rounded-md bg-orange-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
            onClick={() => setShowCreatePost(!showCreatePost)}
          >
            {showCreatePost ? "Cancel" : "Create New Post"}
          </button>
          {showCreatePost && <CreatePost onSubmit={handleCreatePost} />}
        </section>

        <section className="user-posts-section rounded-lg border border-stone-200 bg-white/90 p-5 shadow-sm sm:p-8">
          <UserPosts refreshKey={postsRefreshKey} />
        </section>

        <section className="friends-section rounded-lg border border-stone-200 bg-white/90 p-5 shadow-sm sm:p-8">
          <Friends />
        </section>
        </div>
      </main>
    </>
  );
}
export default Profile;

