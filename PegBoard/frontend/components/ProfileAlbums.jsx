import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/Albums.css";
import FeedAlbums from "./FeedAlbums";

function ProfileAlbums() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const username = user?.username ?? "";
  const [albums, setAlbums] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [hashtagInput, setHashtagInput] = useState("");
  const [selectedPostIds, setSelectedPostIds] = useState([]);
  const [showCreateAlbum, setShowCreateAlbum] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingAlbumId, setDeletingAlbumId] = useState("");

  useEffect(() => {
    let active = true;

    const fetchProfileAlbums = async () => {
      setLoading(true);
      setError("");

      if (!userId || !username) {
        setAlbums([]);
        setUserPosts([]);
        setLoading(false);
        return;
      }

      try {
        const [albumsResponse, postsResponse] = await Promise.all([
          fetch("http://localhost:3000/api/albums"),
          fetch(`http://localhost:3000/api/users/${encodeURIComponent(username)}/posts`),
        ]);
        const [allAlbums, posts] = await Promise.all([
          albumsResponse.json(),
          postsResponse.json(),
        ]);

        if (!albumsResponse.ok) {
          throw new Error(allAlbums.message || "Could not fetch albums.");
        }
        if (!postsResponse.ok) {
          throw new Error(posts.message || "Could not fetch your posts.");
        }
        if (active) {
          setAlbums(
            (Array.isArray(allAlbums) ? allAlbums : []).filter(
              (album) => String(album.userId) === userId,
            ),
          );
          setUserPosts(Array.isArray(posts) ? posts : []);
        }
      } catch (fetchError) {
        if (active) {
          setError(fetchError.message || "Could not load your albums.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchProfileAlbums();
    return () => {
      active = false;
    };
  }, [userId, username]);

  const togglePost = (postId) => {
    setSelectedPostIds((selected) =>
      selected.includes(postId)
        ? selected.filter((id) => id !== postId)
        : [...selected, postId],
    );
  };

  const handleDeleteAlbum = async (albumId) => {
    setError("");
    setDeletingAlbumId(albumId);

    try {
      const response = await fetch(`http://localhost:3000/api/albums/${albumId}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not delete album.");
      }

      setAlbums((currentAlbums) =>
        currentAlbums.filter((album) => String(album._id ?? album.id) !== albumId),
      );
    } catch (deleteError) {
      setError(deleteError.message || "Could not delete album.");
    } finally {
      setDeletingAlbumId("");
    }
  };

  const handleUpdateAlbum = async (albumId, updates) => {
    const response = await fetch(`http://localhost:3000/api/albums/${albumId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      throw new Error(`The album API returned a non-JSON response (HTTP ${response.status}).`);
    }

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Could not update album.");
    }

    setAlbums((currentAlbums) =>
      currentAlbums.map((album) =>
        String(album._id ?? album.id) === albumId ? result : album,
      ),
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const hashtags = hashtagInput
      .split(/[\s,]+/)
      .filter(Boolean)
      .map((hashtag) => (hashtag.startsWith("#") ? hashtag : `#${hashtag}`));

    try {
      const response = await fetch("http://localhost:3000/api/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          username,
          hastags: hashtags,
          postIds: selectedPostIds,
          userId,
        }),
      });
      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        throw new Error(
          `The album API returned a non-JSON response (HTTP ${response.status}). Restart the backend from the PegBoard folder with "node backend/server.js" and try again.`,
        );
      }
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not create album.");
      }

      setAlbums((currentAlbums) => [...currentAlbums, result]);
      setName("");
      setDescription("");
      setHashtagInput("");
      setSelectedPostIds([]);
      setShowCreateAlbum(false);
    } catch (submitError) {
      setError(submitError.message || "Could not create album.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="profile-albums">
      <h2>My Albums</h2>
      {userId && username ? (
        <section className="create-post-section">
          <button
            type="button"
            className="create-post-toggle-btn"
            onClick={() => setShowCreateAlbum((showing) => !showing)}
          >
            {showCreateAlbum ? "Cancel" : "Create New Album"}
          </button>
          {showCreateAlbum && (
            <form className="album-form" onSubmit={handleSubmit}>
              <h3>Create New Album</h3>
              <label htmlFor="album-name">Name</label>
              <input
                id="album-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />

              <label htmlFor="album-description">Description</label>
              <textarea
                id="album-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
              />

              <label htmlFor="album-hashtags">Hashtags</label>
              <input
                id="album-hashtags"
                value={hashtagInput}
                onChange={(event) => setHashtagInput(event.target.value)}
                placeholder="#art, #paintings"
              />

              {userPosts.length > 0 && (
                <fieldset className="album-post-selection">
                  <legend>Include your posts</legend>
                  {userPosts.map((post) => (
                    <label key={post._id} className="album-post-option">
                      <input
                        type="checkbox"
                        checked={selectedPostIds.includes(post._id)}
                        onChange={() => togglePost(post._id)}
                      />
                      {post.caption || "Untitled post"}
                    </label>
                  ))}
                </fieldset>
              )}

              <button className="profile-submit-button" type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create Album"}
              </button>
            </form>
          )}
        </section>
      ) : (
        <p>Log in to create and view your albums.</p>
      )}

      {loading ? (
        <p>Loading albums...</p>
      ) : albums.length > 0 ? (
        <FeedAlbums
          posts={albums}
          onDelete={handleDeleteAlbum}
          deletingAlbumId={deletingAlbumId}
          onUpdate={handleUpdateAlbum}
          userPosts={userPosts}
        />
      ) : (
        <p>You have not created any albums yet.</p>
      )}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}

export default ProfileAlbums;
