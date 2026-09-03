import "../styles/Posts.css";

function PostDisplay({ postId, username = "JessicaPin", date = "2024-01-15", caption = "Beautiful sunset at the beach!", likes = 234 }) {
  return (
    <div className="post-display">
      <div className="post-header">
        <h2>{username}</h2>
        <p>{date}</p>
      </div>
      <div className="post-content">
        <p className="post-caption">{caption}</p>
        <div className="post-actions">
          <button className="like-button">Like({likes})</button>
          <button className="comment-button">Comment</button>
          
        </div>
      </div>
    </div>
  );
}

export default PostDisplay;
