import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import PostComponent from "../components/PostComponent";
import { useEffect, useState } from "react";

function Posts() {

  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/posts`, {
          method: "GET",
        });
        const posts = await response.json();

        if (!response.ok) {
          throw new Error(posts.message || "Could not fetch posts");
        }

        setPosts(Array.isArray(posts) ? posts : []);
      } catch (error) {
        setError(error.message || "Failed to connect to the server.");
      }
    };
    
    fetchContent();
  },[])
  console.log(posts);



  return (
    <>
      <Navbar name="Posts"></Navbar>

      <div className="postBox">
        {error && <p role="alert">{error}</p>}
        {posts.map((post) => (
          <div key={post._id}>
            <PostComponent
              username={post.username ?? post.postUser}
              image={post.image}
              caption={post.caption}
              postId={post._id}
            />
            <Link to={`/posts/${post._id}`} state={{ post }}>
             more
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}
export default Posts;
