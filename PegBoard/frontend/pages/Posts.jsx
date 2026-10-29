import Navbar from "../components/Navbar";
import PostComponent from "../components/PostComponent";
import DeletePost from "../components/DeletePost";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import sortByDateDescending from "../utils/sortByDate";

function Posts() {

  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const sortedPosts = sortByDateDescending(posts);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/posts`, {
          method: "GET",
        });
        const posts = await response.json();

        if (!response.ok) {
          throw new Error(posts.message || "Could not fetch posts");
        }

        setPosts(Array.isArray(posts) ? posts : []);
      } catch (error) {
        setError(error.message || "Failed to connect to the server.");
      }
    };
    
    fetchContent();
  },[])
  return (
    <>
      <Navbar name="Posts"></Navbar>

      <div className="">
        {error && (
          <p
            role="alert"
            className="justify-self-center font-['Rubik_Spray_Paint'] translate-y-106 text-2xl"
          >
            {error}
          </p>
        )}
        <div className="grid justify-items-center gap-3">
          {sortedPosts.map((post, index) => (
            <div key={post._id ?? post.id ?? index}>
              <PostComponent
                id={post._id}
                username={post.postUser ?? post.username}
                date={post.date}
                image={post.image}
                caption={post.caption}
                hashtags={post.hastags ?? post.hashtags}
                userId={post.userId}
                delete={
                  user?.username === "Admin" && (
                    <DeletePost
                      postId={post._id}
                      onDelete={(deletedPostId) =>
                        setPosts((current) =>
                          current.filter(
                            (item) =>
                              String(item._id ?? item.id) !==
                              String(deletedPostId),
                          ),
                        )
                      }
                    />
                  )
                }
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
export default Posts;
