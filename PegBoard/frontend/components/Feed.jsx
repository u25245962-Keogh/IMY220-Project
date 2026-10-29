import PostComponent from "./PostComponent";
import "../styles/Posts.css";
import sortByDateDescending from "../utils/sortByDate";
import { useAuth } from "../context/AuthContext";
import DeletePost from "./DeletePost";

function Feed({ posts, onDelete }) {
  const { user } = useAuth();
  const sortedPosts = sortByDateDescending(posts);

  return (
    <div className="feed">
      <div className="posts-list flex-row justify-items-center">
        {sortedPosts.map((post, index) => (
          <PostComponent
            key={post._id ?? post.id ?? index}
            id={post._id}
            username={post.postUser ?? post.username}
            date={post.createdAt ?? post.date}
            image={post.image}
            caption={post.caption}
            hashtags={post.hastags ?? post.hashtags}
            userId={post.userId}
            delete={user?.username === "Admin" && (
              <DeletePost postId={post._id} onDelete={onDelete} />
            )}
          />
        ))}
      </div>
    </div>
  );
}

export default Feed;
