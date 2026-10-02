import PostComponent from "./PostComponent";
import "../styles/Posts.css";

function Feed({posts}) {
  
  

  return (
    <div className="feed">
      <h2>Feed</h2>
      <div className="posts-list">
        {posts.map((post, index) => (
          <PostComponent
            key={post._id ?? post.id ?? index}
            id={post._id}
            username={post.postUser ?? post.username}
            date={post.createdAt ?? post.date}
            image={post.image}
            caption={post.caption}
          />
        ))}
      </div>
    </div>
  );
}

export default Feed;
