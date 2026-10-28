import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import PostComponent from "../components/PostComponent";
import "../styles/Albums.css";

function Album() {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchAlbum = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`http://localhost:3000/api/albums/${id}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Could not load this album.");
        }
        if (!result) {
          throw new Error("Album not found.");
        }

        const postResults = await Promise.allSettled(
          (Array.isArray(result.postIds) ? result.postIds : []).map(async (postId) => {
            const postResponse = await fetch(`http://localhost:3000/api/posts/${postId}`);
            const post = await postResponse.json();
            if (!postResponse.ok) {
              throw new Error(post.message || `Could not load post ${postId}.`);
            }
            return post;
          }),
        );

        if (!active) return;

        setAlbum(result);
        setPosts(
          postResults
            .filter((postResult) => postResult.status === "fulfilled")
            .map((postResult) => postResult.value),
        );
        if (postResults.some((postResult) => postResult.status === "rejected")) {
          setError("Some posts in this album could not be loaded.");
        }
      } catch (fetchError) {
        if (active) {
          setError(fetchError.message || "Could not load this album.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchAlbum();
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <>
      <Navbar name={album?.name ?? "Album"} />
      <main className="album-page">
        {loading ? (
          <p>Loading album...</p>
        ) : error && !album ? (
          <p role="alert">{error}</p>
        ) : album ? (
          <div className="album-detail-layout">
            <article className="album-detail">
              <header className="album-detail-header album-detail-green-note">
                <h2>{album.name}</h2>
                <p className="album-description">{album.description || "No description yet."}</p>
                <p className="album-owner">
                  Created by{" "}
                  <Link to={`/OtherProfile/${album.userId}`}>
                    {album.username}
                  </Link>
                </p>
                <div className="album-detail-hashtags">
                  {(album.hastags ?? album.hashtags ?? []).map(
                    (hashtag, index) => (
                      <span key={`${hashtag}-${index}`}>{hashtag}</span>
                    ),
                  )}
                  {!(album.hastags ?? album.hashtags ?? []).length && (
                    <span>No hashtags</span>
                  )}
                </div>
                <p className="album-post-count">
                  {posts.length} {posts.length === 1 ? "post" : "posts"}
                </p>
              </header>
            </article>

            <section className="album-detail-posts">
              <h3>Posts in this album</h3>
              {error && <p role="alert">{error}</p>}
              {posts.length > 0 ? (
                <div className="album-detail-post-list">
                  {posts.map((post) => (
                    <PostComponent
                      key={post._id ?? post.id}
                      id={post._id ?? post.id}
                      username={post.username ?? post.postUser}
                      image={post.image}
                      caption={post.caption}
                      hashtags={post.hastags ?? post.hashtags}
                      userId={post.userId}
                    />
                  ))}
                </div>
              ) : (
                !error && <p>This album has no posts yet.</p>
              )}
            </section>
          </div>
        ) : null}
      </main>
    </>
  );
}

export default Album;
