import "../styles/Posts.css";

function PostComponent(props) {
  return (
    <div className="postComponent">
      <div className="postTop">
        <h2>{props.username}</h2> <p>{props.date}</p>
          </div>
          
      <img src={props.image}></img>
      <h3>{props.caption}</h3>
    </div>
  );
}

export default PostComponent;
