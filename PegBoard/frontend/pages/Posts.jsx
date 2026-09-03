import Navbar from "../components/Navbar";
import Post from "./Post";
import { Link } from "react-router-dom";
import ProfilePreview from "../components/ProfilePreview";
import PostComponent from "../components/PostComponent";

const posts = [
  {
    id: 1,
    username: "@sarah",
    caption: "Studying React today!",
  },
  {
    id: 2,
    username: "@john",
    caption: "Finished Practical 4.",
  },
  {
    id: 3,
    username: "@leanne",
    caption: "Sunset over campus.",
  },
];
function Posts() {
  return (
    <>
      <Navbar name="Posts"></Navbar>

      <div className="postBox">
        {posts.map((post) => (
          <div key={post.id}>
            <PostComponent username={post.username} />
            <Link to={`/posts/${post.id}`}>
             more
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}
export default Posts;
