import "../styles/profile.css";
import { Link } from "react-router-dom";
import greenNote from "../assests/greenNote.png";
import { resolveProfileImageUrl } from "../utils/profileImage";

function ProfilePreview({ user }) {
  const userId = user?._id ?? user?.id;
  const username = user?.username ?? "Unknown user";
  const cardContent = (
    <article
      className="relative box-border grid aspect-[1543/1786] w-full max-w-[240px] grid-rows-[1fr_auto] justify-items-center gap-3 overflow-hidden bg-center bg-no-repeat bg-[length:100%_100%] px-8 pb-8 pt-24 font-['Love_Ya_Like_A_Sister'] text-white drop-shadow-lg"
      style={{ backgroundImage: `url(${greenNote})` }}
    >
      <img
        src={resolveProfileImageUrl(user?.image)}
        alt={`${username}'s profile`}
        className="h-full min-h-0 w-full rounded-full border-4 border-white object-cover"
      />
      <h2 className="m-0 max-w-full truncate text-center text-xl">{username}</h2>
    </article>
  );

  return (
    <div className="profilePreview">
      {userId ? (
        <Link to={`/OtherProfile/${userId}`} aria-label={`View ${username}'s profile`}>
          {cardContent}
        </Link>
      ) : (
        cardContent
      )}
    </div>
  );
}

export default ProfilePreview;
