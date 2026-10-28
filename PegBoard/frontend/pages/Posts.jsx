import Navbar from "../components/Navbar";
import PostComponent from "../components/PostComponent";
import { useEffect, useState } from "react";
import sortByDateDescending from "../utils/sortByDate";

function Posts() {

  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const sortedPosts = sortByDateDescending(posts);

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
  return (
    <>
      <Navbar name="Posts"></Navbar>

      <div className="">
        {error && <p role="alert">{error}</p>}
        {sortedPosts.map((post, index) => (
          <div key={post._id ?? post.id ?? index}>
            <PostComponent
              id={post._id}
              username={post.postUser ?? post.username}
              date={post.createdAt ?? post.date}
              image={post.image}
              caption={post.caption}
              hashtags={post.hastags ?? post.hashtags}
              userId={post.userId}
            />
          </div>
        ))}
      </div>
    </>
  );
}
export default Posts;
