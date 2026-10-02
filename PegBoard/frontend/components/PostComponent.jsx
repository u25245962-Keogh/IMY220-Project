import "../styles/Posts.css";
import { Link } from "react-router-dom";


function PostComponent(props) {
  return (
    <div className="postComponent">
      <div className="postTop">
        <Link to={`/profile/${props.id}`} state={props}>
          <h2>{props.username}</h2>
        </Link>
      </div>
      <Link to={`/posts/${props.id}`}>
        <img src={props.image}></img>
      </Link>

      <h3>{props.caption}</h3>

      {props.delete}
      {props.edit}
    </div>
  );
}

export default PostComponent;
