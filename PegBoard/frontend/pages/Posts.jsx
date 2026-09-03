import Navbar from "../components/Navbar";
import Post from "./Post";
import { Link } from "react-router-dom";
import ProfilePreview from "../components/ProfilePreview";
import PostComponent from "../components/PostComponent";

const posts = [
  {
    id: 1,
    username: "@person1",
    caption: "building a rocket",
  },
  {
    id: 2,
    username: "@person2",
    caption: "made a ring",
  },
  {
    id: 3,
    username: "@person3",
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
