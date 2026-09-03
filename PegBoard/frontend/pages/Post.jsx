import { useParams } from "react-router";
import Navbar from "../components/navbar";
import "../styles/Posts.css"

function Post() {
  let params = useParams();
  params.id;
  return (
    <>
      <Navbar name="Post"></Navbar>
      <h2>Post ID {params.id}</h2>
    </>
  );
}
export default Post;
