import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import SearchInput from "../components/SearchInput";
import Feed from "../components/Feed";

function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [content, setContent] = useState({ posts: [], albums: [] });

  useEffect(() => {
    const getContent = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/content");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch content");
        }

        setContent({
          posts: Array.isArray(data.posts) ? data.posts : [],
          albums: Array.isArray(data.albums) ? data.albums : [],
        });
      } catch (error) {
        console.error("Error fetching content:", error);
      }
    };

    getContent();
  }, []);

  const handleSearch = (term) => {
    setSearchTerm(term);
    // Search functionality implemented ltr not rn
    console.log("Searching for:", term);
  };

  return (
    <>
      <Navbar name="Home"></Navbar>
      <div className="home-container">
        <SearchInput onSearch={handleSearch} />
        <Feed posts={content.posts} />
        <section className="home-albums">
          <h2>Albums</h2>
          {content.albums.length > 0 ? (
            <div className="albums-list">
              {content.albums.map((album, index) => (
                <article key={album._id ?? album.id ?? index} className="album">
                  <h3>{album.name || "Untitled album"}</h3>
                  {album.description && <p>{album.description}</p>}
                  {Array.isArray(album.hashtags) && album.hashtags.length > 0 && (
                    <p>{album.hashtags.join(" ")}</p>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <p>No albums yet.</p>
          )}
        </section>
      </div>
    </>
  );
}
export default Home;