import "../styles/Posts.css";

function PostDisplay({ username, caption, date }) {
  return (
    <div className="flex w-full flex-col gap-3 text-center">
      <div className="flex flex-col items-center">
        <h2 className="m-0 break-words text-2xl">{username}</h2>
        {date}
      </div>
      <p className="m-0 max-w-full break-words text-lg">{caption}</p>
    </div>
  );
}

export default PostDisplay;
