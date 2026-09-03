import { useState } from "react";
import { useParams } from "react-router";
import Navbar from "../components/Navbar";
import PostDisplay from "../components/PostDisplay";
import ImageComponent from "../components/ImageComponent";
import Comments from "../components/Comments";
import EditPost from "../components/EditPost";
import "../styles/Posts.css";

function Post() {
  let params = useParams();
  const postId = params.id;
  const [showEditPost, setShowEditPost] = useState(false);

  const handleSaveEdit = (updatedData) => {
    console.log("Post updated:", updatedData);
    setShowEditPost(false);
    
  };

  return (
    <>
      <Navbar name="Post"></Navbar>
      <div className="post-page">
        <div className="post-main">
          <h2>Post ID {postId}</h2>
          
          <section className="post-image-section">
            <ImageComponent />
          </section>

          <section className="post-details-section">
            <PostDisplay postId={postId} />
            <button 
              className="edit-post-btn"
              onClick={() => setShowEditPost(!showEditPost)}
            >
              {showEditPost ? "Cancel" : "Edit Post"}
            </button>
          </section>

          {showEditPost && (
            <section className="edit-post-section">
              <EditPost postId={postId} onSave={handleSaveEdit} />
            </section>
          )}

          <section className="comments-section">
            <Comments postId={postId} />
          </section>
        </div>
      </div>
    </>
  );
}
export default Post;
