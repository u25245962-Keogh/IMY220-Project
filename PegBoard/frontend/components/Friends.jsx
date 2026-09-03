import "../styles/profile.css";

function Friends({ friends = [] }) {
 
  const sampleFriends = [
    {
      id: 1,
      username: "Sarah",
      avatar:
        "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original",
    },
    {
      id: 2,
      username: "Emily",
      avatar:
        "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original",
    },
    {
      id: 3,
      username: "Lisa",
      avatar:
        "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original",
    },
    {
      id: 4,
      username: "Amanda",
      avatar:
        "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original",
    },
  ];

  const displayFriends = friends.length > 0 ? friends : sampleFriends;

  return (
    <div className="friends-container">
      <h3>Friends ({displayFriends.length})</h3>
      <div className="friends-list">
        {displayFriends.map((friend) => (
          <div key={friend.id} className="friend-card">
            <img src={friend.avatar} alt={friend.username} className="friend-avatar" />
            <p>{friend.username}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Friends;
