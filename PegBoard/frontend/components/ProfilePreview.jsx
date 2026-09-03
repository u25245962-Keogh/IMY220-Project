import "../styles/profile.css";
import ImageComponent from "./ImageComponent";
function ProfilePreview() {
  return (
    <div className="profilePreview">
      <ImageComponent/>
      <p>username</p>
    </div>
  );
}

export default ProfilePreview;
