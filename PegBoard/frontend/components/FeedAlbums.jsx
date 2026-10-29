import "../styles/Posts.css";
import AlbumComponent from "./AlbumComponent";
import EditAlbum from "./EditAlbum";
import sortByDateDescending from "../utils/sortByDate";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

function FeedAlbums({ posts, onDelete, deletingAlbumId, onUpdate, userPosts = [] }) {
  const { user } = useAuth();
  const [deleteError, setDeleteError] = useState("");
  const [adminDeletingAlbumId, setAdminDeletingAlbumId] = useState("");
  const sortedAlbums = sortByDateDescending(posts);

  const deleteAlbum = async (albumId) => {
    setDeleteError("");
    setAdminDeletingAlbumId(albumId);
    try {
      const response = await fetch(`http://localhost:3000/api/albums/${albumId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Could not delete album");
      }
      onDelete?.(albumId);
    } catch (error) {
      setDeleteError(error.message || "Could not delete album");
    } finally {
      setAdminDeletingAlbumId("");
    }
  };

  return (
    <div className="albums">
      {deleteError && <p role="alert">{deleteError}</p>}
      <div className="albums-list">
        {sortedAlbums.map((post, index) => {
          const albumId = post._id ?? post.id;
          const canDeleteAlbum =
            user?.username === "Admin" ||
            (Boolean(user?.id) && String(post.userId) === user.id);
          return (
            <article
              className="profile-album-item flex-row justify-items-center"
              key={albumId ?? index}
            >
              <AlbumComponent
                id={albumId}
                username={post.username}
                description={post.description}
                name={post.name}
                hashtags={post.hastags ?? post.hashtags}
                postIds={post.postIds}
                userId={post.userId}
                delete={canDeleteAlbum && albumId && (
                <div className="card-delete-overlay">
                  <button
                    type="button"
                    className="delete-cross-button"
                    onClick={() => deleteAlbum(String(albumId))}
                    disabled={
                      adminDeletingAlbumId === String(albumId) ||
                      deletingAlbumId === albumId
                    }
                    aria-label="Delete album"
                    title="Delete album"
                  >
                    ×
                  </button>
                </div>
                )}
              />
              {(onUpdate || onDelete) && (
                <div className="album-card-actions">
                  {onUpdate && albumId && (
                    <EditAlbum
                      albumId={String(albumId)}
                      initialName={post.name ?? ""}
                      initialDescription={post.description ?? ""}
                      initialPostIds={post.postIds ?? []}
                      userPosts={userPosts}
                      onSave={onUpdate}
                    />
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );

 
}

export default FeedAlbums;
