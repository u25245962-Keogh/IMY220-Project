import { useEffect, useState } from "react";
import "../styles/Posts.css";
import { Link } from "react-router-dom";
import {
  getUserProfileImage,
  resolveProfileImageUrl,
} from "../utils/profileImage";

function PostComponent(props) {
  const [profileImage, setProfileImage] = useState("");
  const hashtags = Array.isArray(props.hashtags)
    ? props.hashtags
    : Array.isArray(props.hastags)
      ? props.hastags
      : [];

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
          console.error("Could not load the post author's profile picture:", error);
        }
      });

    return () => {
      active = false;
    };
  }, [props.userId]);

  return (
    <article className="relative box-border grid aspect-[1543/1786] w-full max-w-[400px] grid-rows-[minmax(0,1fr)_auto_auto] justify-items-center gap-3 overflow-hidden bg-[url('/orangeNote.png')] bg-center bg-no-repeat bg-[length:100%_100%] px-8 pb-2 pt-8 font-['Love_Ya_Like_A_Sister']">
      {props.delete && (
        <div className="card-delete-overlay">
          {props.delete}
        </div>
      )}
      <Link
        className="flex min-h-0 w-full items-end justify-center overflow-hidden pb-1"
        to={`/posts/${props.id}`}
      >
        <img
          className="block h-[90%] max-h-[90%] w-[90%] max-w-[90%] translate-y-8 translate-x-3 object-contain"
          src={props.image ? resolveProfileImageUrl(props.image) : undefined}
          alt={props.caption || "Post image"}
        />
      </Link>

      <div className="flex w-full min-w-0 items-center justify-between gap-2 overflow-hidden text-white">
        <div className="min-w-0 flex-1">
          <div className="postTop -mb-1 max-w-full overflow-hidden text-left">
            <Link to={`/OtherProfile/${props.userId}`} state={props}>
              <h2 className="m-0 max-w-full truncate text-left">
                {props.username}
              </h2>
            </Link>
          </div>
          <h3 className="m-0 line-clamp-2 max-w-full overflow-hidden break-words text-left">
            {props.caption}
          </h3>
          {hashtags.length > 0 && (
            <p className="m-0 mt-1 line-clamp-2 max-w-full break-words text-left text-sm">
              {hashtags.filter((hashtag) => typeof hashtag === "string").map((hashtag, index) => (
                <span key={`${hashtag}-${index}`} className="mr-2">
                  {hashtag.startsWith("#") ? hashtag : `#${hashtag}`}
                </span>
              ))}
            </p>
          )}
        </div>
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

      <div className="flex max-w-full flex-wrap items-center justify-center gap-2 overflow-hidden">
        {props.edit}
      </div>
    </article>
  );
}

export default PostComponent;
