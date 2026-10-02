import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import PostDisplay from "../components/PostDisplay";
import ImageComponent from "../components/ImageComponent";
import Comments from "../components/Comments";
import EditPost from "../components/EditPost";
import "../styles/Posts.css";

function Post() {
  const { id: postId } = useParams();
  const { state } = useLocation();
  const [post, setPost] = useState(state?.post ?? null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (post) return;

    const fetchPost = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/posts/${postId}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Could not fetch post");
        }
        setPost(data);
      } catch (fetchError) {
        setError(fetchError.message || "Failed to connect to the server.");
      }
    };

    fetchPost();
  }, [post, postId]);



  return (
    <>
      <Navbar name="Post"></Navbar>
      <div className="post-page">
        <div className="post-main">
          <section className="post-image-section">
            <ImageComponent src={post?.image} alt={post?.caption || "Post image"} />
          </section>

          <section className="post-details-section">
            {error && <p role="alert">{error}</p>}
            {post && (
              <>
                <PostDisplay
                  postId={postId}
                  username={post.username ?? post.postUser}
                  date={post.createdAt ?? post.date}
                  caption={post.caption}
                  likes={post.likes}
                />
              
              </>
            )}
          </section>

         

          <section className="comments-section">
            <Comments postId={postId} comments={post?.comments ?? []} onPostUpdated={setPost} />
          </section>
        </div>
      </div>
    </>
  );
}
export default Post;
