import "../styles/profile.css";

function Profile({ username = "JessicaPin", bio = "Photography enthusiast", followers = 234, following = 156 }) {
  return (
    <div className="profile-info">
      <div className="profile-header">
        <div className="profile-avatar">
          <img
            src="https://static.vecteezy.com/system/resources/thumbnails/008/695/917/small/no-image-available-icon-simple-two-colors-template-for-no-image-or-picture-coming-soon-and-placeholder-illustration-isolated-on-white-background-vector.jpg"
            alt={username}
            className="avatar-image"
          />
        </div>
        <div className="profile-details">
          <h2>{username}</h2>
          <p className="bio">{bio}</p>
          <div className="profile-stats">
            <div className="stat">
              <span className="stat-number">{followers}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat">
              <span className="stat-number">{following}</span>
              <span className="stat-label">Following</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
