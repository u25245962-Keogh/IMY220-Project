import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DeletePost from "./DeletePost";
import {
  getUserProfileImage,
  resolveProfileImageUrl,
} from "../utils/profileImage";
import blueNote from "../assests/blueNote.png";

function ReportedPostComponent({ report, onDelete }) {
  const post = report.post;
  const [profileImage, setProfileImage] = useState("");
  const reasons = Array.isArray(report.reason) ? report.reason : [];
  const hashtags = Array.isArray(post?.hashtags)
    ? post.hashtags
    : Array.isArray(post?.hastags)
      ? post.hastags
      : [];

  useEffect(() => {
    let active = true;

    getUserProfileImage(post?.userId)
      .then((image) => {
        if (active) setProfileImage(image);
      })
      .catch((error) => {
        if (active) {
          console.error("Could not load the post author's profile picture:", error);
        }
      });

    return () => {
      active = false;
    };
  }, [post?.userId]);

  return (
    <article
      className="relative box-border grid aspect-[1543/1786] w-full max-w-[400px] grid-rows-[minmax(0,1fr)_auto_auto] justify-items-center gap-3 overflow-hidden bg-center bg-no-repeat bg-[length:100%_100%] px-8 pb-5 pt-8 font-['Love_Ya_Like_A_Sister'] text-white drop-shadow-lg"
      style={{ backgroundImage: `url(${blueNote})` }}
    >
      {post && (
        <div className="card-delete-overlay">
          <DeletePost
            postId={report.postId}
            onDelete={onDelete}
          />
        </div>
      )}

      {post ? (
        <Link
          className="flex min-h-0 w-full items-end justify-center overflow-hidden pb-1"
          to={`/posts/${report.postId}`}
        >
          {post.image ? (
            <img
              className="block h-[90%] max-h-[90%] w-[90%] max-w-[90%] translate-y-8 translate-x-3 object-contain"
              src={resolveProfileImageUrl(post.image)}
              alt={post.caption || "Reported post"}
            />
          ) : (
            <span className="text-center text-white">This post has no image</span>
          )}
        </Link>
      ) : (
        <div className="flex min-h-0 w-full items-center justify-center overflow-hidden text-center text-white">
          The reported post is no longer available
        </div>
      )}

      <div className="flex w-full min-w-0 items-center justify-between gap-2 overflow-hidden text-white">
        <div className="min-w-0 flex-1">
          <div className="postTop -mb-1 max-w-full overflow-hidden text-left">
            {post?.userId ? (
              <Link to={`/OtherProfile/${post.userId}`}>
                <h2 className="m-0 max-w-full truncate text-left">
                  {post.postUser ?? post.username ?? "Unknown user"}
                </h2>
              </Link>
            ) : (
              <h2 className="m-0 max-w-full truncate text-left">Unavailable post</h2>
            )}
          </div>
          <h3 className="m-0 line-clamp-2 max-w-full overflow-hidden break-words text-left">
            {post?.caption ?? `Post ID: ${report.postId}`}
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
        {post?.userId && (
          <Link
            to={`/OtherProfile/${post.userId}`}
            className="h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-white"
            state={post}
            aria-label={`View ${post.postUser || "user"}'s profile`}
          >
            <img
              src={resolveProfileImageUrl(profileImage)}
              alt=""
              className="h-full w-full object-cover"
            />
          </Link>
        )}
      </div>

      <div className="w-full max-h-24 overflow-y-auto rounded-lg bg-black/20 p-2 text-sm text-white">
        <p className="m-0 font-bold">Reported for:</p>
        {reasons.length > 0 ? (
          <ul className="m-0 list-inside list-disc">
            {reasons.map((reason, index) => (
              <li key={`${reason}-${index}`} className="break-words">{reason}</li>
            ))}
          </ul>
        ) : (
          <p className="m-0">No reasons listed.</p>
        )}
      </div>
    </article>
  );
}

export default ReportedPostComponent;
