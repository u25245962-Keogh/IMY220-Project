import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import SearchInput from "../components/SearchInput";
import Feed from "../components/Feed";
import FeedAlbums from "../components/FeedAlbums";

function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [content, setContent] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const getContent = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/posts`, {
          method: "GET",
        });
        const posts = await response.json();
        

        if (!response.ok) {
          throw new Error(posts.message || "Could not fetch posts");
        }

        setContent(Array.isArray(posts) ? posts : []);
      } catch (error) {
        console.error("Error fetching content:", error);
      }
    };

    const getAlbums = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/albums`, {
          method: "GET",
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Could not fetch posts");
        }

    
        setAlbums(Array.isArray(result) ? result : []);
        
      
      } catch (error) {
        console.error("Error fetching content:", error);
      }
    };

    const getUsers = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/users");
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Could not fetch users");
        }
        setUsers(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    getAlbums();
    getContent();
    getUsers();
  }, []);

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

  const filteredPosts = content.filter((post) =>
    containsQuery([post.caption, post.hastags, post.hashtags, post.tags])
  );
  const filteredAlbums = albums.filter((album) =>
    containsQuery([
      album.name,
      album.title,
      album.description,
      album.hastags,
      album.hashtags,
      album.tags,
    ])
  );
  const filteredUsers = users.filter((user) =>
    containsQuery(user.username)
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
          <section className="home-users flex">
            <h2>Users</h2>
            {filteredUsers.map((user) => (
              <p key={user._id || user.id || user.username}>{user.username}</p>
            ))}
          </section>
        )}
        <Feed posts={filteredPosts} />
        <section className="home-albums">
          <FeedAlbums posts={filteredAlbums} />
        </section>
      </div>
    </>
  );
}
export default Home;