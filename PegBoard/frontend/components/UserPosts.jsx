import PostComponent from "./PostComponent";
import "../styles/Posts.css";

function UserPosts({ posts = [] }) {
  
  const samplePosts = [
    {
      id: 1,
      username: "You",
      date: "2024-01-15",
      image:
        "https://static.vecteezy.com/system/resources/thumbnails/008/695/917/small/no-image-available-icon-simple-two-colors-template-for-no-image-or-picture-coming-soon-and-placeholder-illustration-isolated-on-white-background-vector.jpg",
      caption: "My first post!",
    },
    {
      id: 2,
      username: "You",
      date: "2024-01-12",
      image:
        "https://static.vecteezy.com/system/resources/thumbnails/008/695/917/small/no-image-available-icon-simple-two-colors-template-for-no-image-or-picture-coming-soon-and-placeholder-illustration-isolated-on-white-background-vector.jpg",
      caption: "Another beautiful moment",
    },
  ];

  const displayPosts = posts.length > 0 ? posts : samplePosts;

  return (
    <div className="user-posts">
      <h3>My Posts</h3>
      <div className="posts-list">
        {displayPosts.length > 0 ? (
          displayPosts.map((post) => (
            <PostComponent
              key={post.id}
              username={post.username}
              date={post.date}
              image={post.image}
              caption={post.caption}
            />
          ))
        ) : (
          <p>No posts yet. Create your first post!</p>
        )}
      </div>
    </div>
  );
}

export default UserPosts;
