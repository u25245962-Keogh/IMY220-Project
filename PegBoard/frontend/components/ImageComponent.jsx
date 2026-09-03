import "../styles/Posts.css";

function ImageComponent({
  src = "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original",
  alt = "Post image",
}) {
  return (
    <div className="image-component">
      <img src={src} alt={alt} className="post-image" />
    </div>
  );
}

export default ImageComponent;
