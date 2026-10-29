import { useState } from "react";
import PostComponent from "./PostComponent";
import "../styles/Posts.css";

function HiddenPostsComponent({ posts = [] }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (posts.length === 0) {
    return null;
  }

  return (
    <section
      className=" mx-auto mt-10 w-full max-w-5xl px-4 "
      aria-label="Hidden posts"
    >
      <button
        type="button"
        className="rounded-full bg-sky-900 px-4 py-2 font-['Love_Ya_Like_A_Sister'] text-white hover:bg-sky-800 "
        onClick={() => setIsExpanded((expanded) => !expanded)}
        aria-expanded={isExpanded}
      >
        {isExpanded
          ? "Hide hidden posts"
          : `Show hidden posts (${posts.length})`}
      </button>
      {isExpanded && (
        <div className="posts-list mt-4 flex-row justify-items-center">
          {posts.map((post) => (
            <PostComponent
              key={post._id ?? post.id}
              id={post._id ?? post.id}
              username={post.postUser ?? post.username}
              date={post.createdAt ?? post.date}
              image={post.image}
              caption={post.caption}
              hashtags={post.hastags ?? post.hashtags}
              userId={post.userId}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default HiddenPostsComponent;
