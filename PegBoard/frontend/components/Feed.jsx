import PostComponent from "./PostComponent";
import "../styles/Posts.css";
import sortByDateDescending from "../utils/sortByDate";

function Feed({posts}) {
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
          />
        ))}
      </div>
    </div>
  );
}

export default Feed;
