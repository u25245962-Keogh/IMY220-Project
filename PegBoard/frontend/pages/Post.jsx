import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import PostDisplay from "../components/PostDisplay";
import PostActions from "../components/PostActions";
import ImageComponent from "../components/ImageComponent";
import Comments from "../components/Comments";
import ReportComponent from "../components/ReportComponent";
import { useAuth } from "../context/AuthContext";
import "../styles/Posts.css";

function Post() {
  const { id: postId } = useParams();
  const { state } = useLocation();
  const { user } = useAuth();
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
      <main className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-4 py-8">
        {error && (
          <p className="w-full text-center" role="alert">
            {error}
          </p>
        )}
        {post && (
          <>
            <article className="relative box-border mx-auto flex aspect-[1543/1786] w-full max-w-[500px] flex-col items-center justify-center gap-5 bg-[url('/orangeNote.png')] bg-center bg-no-repeat bg-[length:100%_100%] px-8 py-12 font-['Love_Ya_Like_A_Sister'] text-white sm:px-14">
              <section className="flex min-h-0 w-full flex-1 justify-center">
                <ImageComponent
                  src={post.image}
                  alt={post.caption || "Post image"}
                />
              </section>
              <section className="w-full max-w-xl">
                <PostDisplay
                  username={post.username ?? post.postUser}
                  date={post.createdAt ?? post.date}
                  caption={post.caption}
                />
              </section>
              <PostActions postId={postId} likes={post.likes} />
            </article>
            {user?.id !== post.userId && <ReportComponent postId={postId} />}
            <section className="w-full max-w-xl rounded-xl bg-[#95c623] p-4 text-gray-900">
              <button
                className="mb-3 rounded-full bg-green-900 px-4 py-2 text-white hover:bg-green-950 font-['Love_Ya_Like_A_Sister']"
                type="button"
                onClick={() =>
                  document.getElementById("post-comment-input")?.focus()
                }
              >
                Comment
              </button>
              <Comments
                postId={postId}
                comments={post.comments ?? []}
                onPostUpdated={setPost}
              />
            </section>
          </>
        )}
      </main>
    </>
  );
}
export default Post;
