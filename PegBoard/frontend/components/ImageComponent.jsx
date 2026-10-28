import "../styles/Posts.css";

function ImageComponent({
  src = "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original",
  alt = "Post image",
}) {
  return (
    <div className="flex w-full justify-center">
      <img
        src={src}
        alt={alt}
        className="max-h-[32rem] max-w-full rounded-xl object-contain"
      />
    </div>
  );
}

export default ImageComponent;
