import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import SearchInput from "../components/SearchInput";
import Feed from "../components/Feed";
import FeedAlbums from "../components/FeedAlbums";
import HiddenPostsComponent from "../components/HiddenPostsComponent";
import ProfilePreview from "../components/ProfilePreview";
import { useAuth } from "../context/AuthContext";
import blueNote from "../assests/blueNote.png";

function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [content, setContent] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [hiddenPosts, setHiddenPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [friendIds, setFriendIds] = useState([]);
  const [feedUserId, setFeedUserId] = useState("");
  const [feedError, setFeedError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    let isActive = true;
    const getFeedData = async () => {
      try {
        if (!user?.id) {
          return;
        }

        const [profileResponse, postsResponse, albumsResponse, usersResponse, hiddenPostsResponse] =
          await Promise.all([
            fetch(`http://localhost:3000/api/users/${encodeURIComponent(user.id)}`),
            fetch("http://localhost:3000/api/posts"),
            fetch("http://localhost:3000/api/albums"),
            fetch("http://localhost:3000/api/users"),
            fetch("http://localhost:3000/api/hidden-posts"),
          ]);
        const [profile, posts, albumsResult, usersResult, hiddenPostsResult] = await Promise.all([
          profileResponse.json(),
          postsResponse.json(),
          albumsResponse.json(),
          usersResponse.json(),
          hiddenPostsResponse.json(),
        ]);

        if (!profileResponse.ok) {
          throw new Error(profile.message || "Could not fetch your friends");
        }
        if (!postsResponse.ok) {
          throw new Error(posts.message || "Could not fetch posts");
        }
        if (!albumsResponse.ok) {
          throw new Error(albumsResult.message || "Could not fetch albums");
        }
        if (!usersResponse.ok) {
          throw new Error(usersResult.message || "Could not fetch users");
        }
        if (!hiddenPostsResponse.ok) {
          throw new Error(hiddenPostsResult.message || "Could not fetch reported posts");
        }

        if (isActive) {
          const friends = Array.isArray(profile.friends) ? profile.friends : [];
          setFriendIds(
            friends
              .map((friend) => friend?._id ?? friend?.id ?? friend?.username ?? friend)
              .map(String),
          );
          setContent(Array.isArray(posts) ? posts : []);
          setAlbums(Array.isArray(albumsResult) ? albumsResult : []);
          setHiddenPosts(Array.isArray(hiddenPostsResult) ? hiddenPostsResult : []);
          setUsers(Array.isArray(usersResult) ? usersResult : []);
          setFeedUserId(user.id);
          setFeedError("");
        }
      } catch (error) {
        if (isActive) {
          setFeedError(error.message || "Could not load your friends' feed.");
          setFriendIds([]);
          setContent([]);
          setAlbums([]);
          setHiddenPosts([]);
          setFeedUserId(user.id);
        }
      }
    };

    getFeedData();
    return () => {
      isActive = false;
    };
  }, [user?.id]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const query = searchTerm.trim().toLowerCase().replace(/^#/, "");
  const containsQuery = (value) => {
    if (!query) return true;
    if (Array.isArray(value)) return value.some(containsQuery);
    if (value && typeof value === "object") {
      return Object.values(value).some(containsQuery);
    }
    return String(value ?? "").toLowerCase().includes(query);
  };

  const isFriendContent = (item) =>
    friendIds.includes(String(item.userId ?? "")) ||
    friendIds.includes(String(item.postUser ?? item.username ?? ""));
  const friendFeedReady = Boolean(user?.id) && feedUserId === user.id;
  const friendHiddenPosts = hiddenPosts.filter(isFriendContent);
  const hiddenPostIds = new Set(
    friendHiddenPosts.map((post) => String(post._id ?? post.id)),
  );
  const friendPosts = content.filter(
    (post) => isFriendContent(post) && !hiddenPostIds.has(String(post._id ?? post.id)),
  );
  const friendAlbums = albums
    .filter(isFriendContent)
    .map((album) => ({
      ...album,
      postIds: Array.isArray(album.postIds)
        ? album.postIds.filter(
            (postId) =>
              !hiddenPostIds.has(String(postId?._id ?? postId?.id ?? postId)),
          )
        : album.postIds,
    }));
  const hasNoFriendContent =
    friendFeedReady &&
    !feedError &&
    friendPosts.length === 0 &&
    friendAlbums.length === 0 &&
    friendHiddenPosts.length === 0;
  const filteredPosts = friendPosts.filter((post) =>
    containsQuery([post.caption, post.hastags, post.hashtags, post.tags])
  );
  const filteredAlbums = friendAlbums.filter((album) =>
    containsQuery([
      album.name,
      album.title,
      album.description,
      album.hastags,
      album.hashtags,
      album.tags,
    ])
  );
  const filteredUsers = users.filter(
    (person) =>
      person.username?.toLowerCase() !== "admin" &&
      String(person._id ?? person.id) !== String(user?.id) &&
      containsQuery(person.username),
  );

  return (
    <>
      <Navbar name="Home"></Navbar>
      <div className="home-container ">
        <div className="flex justify-center">
          <div className="flex justify-center bg-gray-500 w-1.1/12 rounded-sm text-white rounded-none [&_*:focus]:outline-none translate-y-6">
            <SearchInput onSearch={handleSearch} />
          </div>
        </div>

        {query && filteredUsers.length > 0 && (
          <section className="home-users flex flex-wrap items-center justify-center gap-4">
            <h2>Users</h2>
            {filteredUsers.map((person) => (
              <ProfilePreview key={person._id ?? person.id ?? person.username} user={person} />
            ))}
          </section>
        )}
        {feedError && <p role="alert">{feedError}</p>}
        {hasNoFriendContent ? (
          <div
            className="mx-auto mt-25 flex min-h-95 w-full max-w-md items-center justify-center bg-contain bg-center bg-no-repeat px-12 pb-6 pt-12 text-center font-['Love_Ya_Like_A_Sister'] text-xl text-[#082653]"
            style={{ backgroundImage: `url(${blueNote})` }}
          >
            <p className="text-white">None of your friends have shared anything</p>
          </div>
        ) : (
          <>
            <div className="mt-[50px]">
              <Feed
                posts={feedError || !friendFeedReady ? [] : filteredPosts}
                onDelete={(deletedPostId) =>
                  setContent((current) =>
                    current.filter((post) => String(post._id ?? post.id) !== String(deletedPostId)),
                  )
                }
              />
            </div>
            <section className="home-albums">
              <FeedAlbums
                posts={feedError || !friendFeedReady ? [] : filteredAlbums}
                onDelete={(deletedAlbumId) =>
                  setAlbums((current) =>
                    current.filter((album) => String(album._id ?? album.id) !== String(deletedAlbumId)),
                  )
                }
              />
            </section>
          </>
        )}
        {friendFeedReady && !feedError && (
          <HiddenPostsComponent posts={friendHiddenPosts} />
        )}
      </div>
    </>
  );
}
export default Home;