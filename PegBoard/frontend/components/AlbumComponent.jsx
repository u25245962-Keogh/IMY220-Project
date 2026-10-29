import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import greenNote from "../assests/greenNote.png";
import {
  getUserProfileImage,
  resolveProfileImageUrl,
} from "../utils/profileImage";

function AlbumComponent(props) {
  const [posts, setPosts] = useState([]);
  const [postsError, setPostsError] = useState("");
  const [profileImage, setProfileImage] = useState("");

  useEffect(() => {
    const postIds = Array.isArray(props.postIds) ? props.postIds : [];
    

    const fetchPosts = async () => {
      setPosts([]);
      setPostsError("");

      const results = await Promise.allSettled(
        postIds.map(async (id) => {
          const response = await fetch(`http://localhost:3000/api/posts/${id}`);
          const post = await response.json();

          if (!response.ok) {
            throw new Error(post.message || `Could not fetch post ${id}`);
          }

          return post;
        })
      );

      

      const fetchedPosts = results
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value);
      const failures = results.filter((result) => result.status === "rejected");

      setPosts(fetchedPosts);
      if (failures.length > 0) {
        failures.forEach((failure) => console.error("Error fetching album post:", failure.reason));
        setPostsError("Some posts in this album could not be loaded.");
      }
    };

    fetchPosts();
  }, [props.postIds]);

  useEffect(() => {
    let active = true;

    getUserProfileImage(props.userId)
      .then((image) => {
        if (active) {
          setProfileImage(image);
        }
      })
      .catch((error) => {
        if (active) {
          console.error("Could not load the album owner's profile picture:", error);
        }
      });

    return () => {
      active = false;
    };
  }, [props.userId]);

  return (
    <article
      className="relative box-border grid aspect-[1543/1786] w-full max-w-[400px] grid-rows-[auto_minmax(0,1fr)_auto_auto] gap-3 overflow-hidden bg-center bg-no-repeat bg-[length:100%_100%] px-8 pb-8 pt-[164px] font-['Love_Ya_Like_A_Sister'] text-white drop-shadow-lg"
      style={{ backgroundImage: `url(${greenNote})` }}
    >
      {props.delete}
      <Link
        className="max-w-full text-white"
        to={`/albums/${props.id}`}
      >
        <h2 className="m-0 line-clamp-2 break-words text-center text-2xl">
          {props.name}
        </h2>
      </Link>

      <div className="flex min-h-0 flex-col gap-2 overflow-y-auto px-2">
        {postsError && (
          <p className="m-0 w-full text-center text-sm" role="alert">
            {postsError}
          </p>
        )}
        {posts.map((post, index) => (
          <p
            className="m-0 break-words border-b border-white/30 pb-1 text-center text-sm"
            key={post._id ?? post.id ?? index}
          >
            {post.caption || "Untitled post"}
          </p>
        ))}
        {!postsError && posts.length === 0 && (
          <p className="m-0 self-center text-center text-sm">No posts in this album yet.</p>
        )}
      </div>

      <div className="flex w-full min-w-0 items-center justify-between gap-2">
        <Link
          className="min-w-0 truncate text-white"
          to={`/OtherProfile/${props.userId}`}
          state={props}
        >
          {props.username}
        </Link>
        <Link
          to={`/OtherProfile/${props.userId}`}
          state={props}
          className="h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-white"
          aria-label={`View ${props.username || "user"}'s profile`}
        >
          <img
            src={resolveProfileImageUrl(profileImage)}
            alt=""
            className="h-full w-full object-cover"
          />
        </Link>
      </div>

      <p className="m-0 line-clamp-2 break-words text-center text-lg">
        {props.description}
      </p>
    </article>
  );
}

export default AlbumComponent;
