import "../styles/Posts.css";
import AlbumComponent from "./AlbumComponent";
import EditAlbum from "./EditAlbum";
import sortByDateDescending from "../utils/sortByDate";

function FeedAlbums({ posts, onDelete, deletingAlbumId, onUpdate, userPosts = [] }) {
  const sortedAlbums = sortByDateDescending(posts);

  return (
    <div className="albums">
      <div className="albums-list">
        {sortedAlbums.map((post, index) => {
          const albumId = post._id ?? post.id;
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
                  {onDelete && albumId && (
                    <button
                      type="button"
                      className="delete-album-btn"
                      onClick={() => onDelete(albumId)}
                      disabled={deletingAlbumId === albumId}
                    >
                      {deletingAlbumId === albumId ? "Deleting..." : "Delete Album"}
                    </button>
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
