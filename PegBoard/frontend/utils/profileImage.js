const defaultProfileImage =
  "https://static.vecteezy.com/system/resources/thumbnails/008/695/917/small/no-image-available-icon-simple-two-colors-template-for-no-image-or-picture-coming-soon-and-placeholder-illustration-isolated-on-white-background-vector.jpg";

const profileImageRequests = new Map();

export function getCachedProfileImage(userId) {
  if (!userId) {
    return "";
  }

  try {
    return localStorage.getItem(`profileImage:${userId}`) || "";
  } catch (storageError) {
    console.error("Could not read the cached profile picture:", storageError);
    return "";
  }
}

export function getUserProfileImage(userId) {
  if (!userId) {
    return Promise.resolve("");
  }

  if (!profileImageRequests.has(userId)) {
    const request = fetch(
      `http://localhost:3000/api/users/${encodeURIComponent(userId)}`,
    )
      .then(async (response) => {
        const profile = await response.json();
        if (!response.ok) {
          throw new Error(profile.message || "Could not load post author's profile picture.");
        }
        return profile.image || "";
      })
      .catch((error) => {
        profileImageRequests.delete(userId);
        throw error;
      });

    profileImageRequests.set(userId, request);
  }

  return profileImageRequests.get(userId);
}

export function resolveProfileImageUrl(image) {
  if (!image) {
    return defaultProfileImage;
  }

  if (/^(data:image\/|https?:\/\/)/i.test(image)) {
    return image;
  }

  return new URL(image, "http://localhost:3000").href;
}
