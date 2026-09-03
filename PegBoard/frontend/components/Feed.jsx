import PostComponent from "./PostComponent";
import "../styles/Posts.css";

function Feed({ posts = [] }) {
  
  const samplePosts = [
    {
      id: 1,
      username: "Jessica",
      date: "2024-01-15",
      image:
        "https://static.vecteezy.com/system/resources/thumbnails/008/695/917/small/no-image-available-icon-simple-two-colors-template-for-no-image-or-picture-coming-soon-and-placeholder-illustration-isolated-on-white-background-vector.jpg",
      caption: "Beautiful sunset at the beach!",
    },
    {
      id: 2,
      username: "Sarah",
      date: "2024-01-14",
      image:
        "https://static.vecteezy.com/system/resources/thumbnails/008/695/917/small/no-image-available-icon-simple-two-colors-template-for-no-image-or-picture-coming-soon-and-placeholder-illustration-isolated-on-white-background-vector.jpg",
      caption: "Coffee and creativity",
    },
    {
      id: 3,
      username: "Emma",
      date: "2024-01-13",
      image:
        "https://static.vecteezy.com/system/resources/thumbnails/008/695/917/small/no-image-available-icon-simple-two-colors-template-for-no-image-or-picture-coming-soon-and-placeholder-illustration-isolated-on-white-background-vector.jpg",
      caption: "Adventure awaits",
    },
  ];

  const displayPosts = posts.length > 0 ? posts : samplePosts;

  return (
    <div className="feed">
      <h2>Feed</h2>
      <div className="posts-list">
        {displayPosts.map((post) => (
          <PostComponent
            key={post.id}
            username={post.username}
            date={post.date}
            image={post.image}
            caption={post.caption}
          />
        ))}
      </div>
    </div>
  );
}

export default Feed;
