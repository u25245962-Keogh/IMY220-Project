import { useState } from "react";
import "../styles/Posts.css";

function Comments({ postId, comments = [] }) {
  const [newComment, setNewComment] = useState("");

  
  const sampleComments = [
    {
      id: 1,
      author: "Sarah",
      text: "Amazing shot!",
      date: "2024-01-15",
    },
    {
      id: 2,
      author: "Emily",
      text: "Love this! Where did you take it?",
      date: "2024-01-15",
    },
  ];

  const displayComments = comments.length > 0 ? comments : sampleComments;

  const handleAddComment = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
     
      console.log("New comment:", newComment);
      setNewComment("");
    }
  };

  return (
    <div className="comments-section">
      <h3>Comments</h3>
      <div className="comments-list">
        {displayComments.map((comment) => (
          <div key={comment.id} className="comment">
            <div className="comment-header">
              <strong>{comment.author}</strong>
              <span className="comment-date">{comment.date}</span>
            </div>
            <p className="comment-text">{comment.text}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleAddComment} className="add-comment-form">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="comment-input"
        />
        <button type="submit" className="comment-submit">
          Post
        </button>
      </form>
    </div>
  );
}

export default Comments;
