import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { connectDB, getDB } from "./db.js";
import { ObjectId } from "mongodb"; 
import { MongoClient } from "mongodb";
import multer from "multer";



const  id  = 2; 
dotenv.config();

const app = express();
const PORT = 3000;
const backendDirectory = dirname(fileURLToPath(import.meta.url));
const profilePicturesDirectory = join(backendDirectory, "uploads", "profile-pictures");
const postImagesDirectory = join(backendDirectory, "uploads", "posts");
const postImageExtensions = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
};
const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!Object.hasOwn(postImageExtensions, file.mimetype)) {
      const error = new Error("Image must be a JPEG, PNG, GIF, or WebP image");
      error.code = "INVALID_IMAGE_TYPE";
      callback(error);
      return;
    }
    callback(null, true);
  },
});
const defaultReportReasons = [
  "Spam or misleading content",
  "Harassment or hate speech",
  "Inappropriate content",
  "Violence or dangerous content",
  "Other",
];

async function isAdminUser(userId) {
  if (typeof userId !== "string" || !ObjectId.isValid(userId)) {
    return false;
  }

  const user = await getDB()
    .collection("users")
    .findOne({ _id: new ObjectId(userId) }, { projection: { username: 1 } });
  return user?.username === "Admin";
}

async function canManageContent(userId, ownerId) {
  if (typeof userId !== "string" || !ObjectId.isValid(userId)) {
    return false;
  }
  if (userId === ownerId || userId.toLowerCase() === ownerId?.toLowerCase()) {
    const user = await getDB()
      .collection("users")
      .findOne({ _id: new ObjectId(userId) }, { projection: { _id: 1 } });
    if (user) return true;
  }
  return isAdminUser(userId);
}

async function getReportReasons() {
  const settings = await getDB()
    .collection("reportSettings")
    .findOne({ _id: "reasons" });
  return settings?.reasons ?? defaultReportReasons;
}

app.use(cors());
app.use(express.json({ limit: "28mb" }));
app.use("/uploads/profile-pictures", express.static(profilePicturesDirectory));
app.use("/uploads/posts", express.static(postImagesDirectory));

app.get("/api/report-reasons", async (req, res) => {
  try {
    return res.status(200).json({ reasons: await getReportReasons() });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.put("/api/report-reasons", async (req, res) => {
  try {
    const { userId, reasons } = req.body ?? {};
    if (!(await isAdminUser(userId))) {
      return res.status(403).json({ message: "Admin access is required" });
    }

    if (
      !Array.isArray(reasons) ||
      reasons.length === 0 ||
      reasons.some((reason) => typeof reason !== "string" || !reason.trim()) ||
      new Set(reasons.map((reason) => reason.trim().toLowerCase())).size !== reasons.length
    ) {
      return res.status(400).json({
        message: "Provide at least one unique, non-empty report reason",
      });
    }

    const cleanReasons = reasons.map((reason) => reason.trim());
    await getDB().collection("reportSettings").updateOne(
      { _id: "reasons" },
      { $set: { reasons: cleanReasons } },
      { upsert: true },
    );
    return res.status(200).json({ reasons: cleanReasons });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get("/api/reports", async (req, res) => {
  try {
    if (!(await isAdminUser(req.query.userId))) {
      return res.status(403).json({ message: "Admin access is required" });
    }

    const db = getDB();
    const reports = await db.collection("reports").find().toArray();
    const postIds = [...new Set(reports
      .map((report) => report.postId)
      .filter((postId) => typeof postId === "string" && ObjectId.isValid(postId)))];
    const posts = postIds.length
      ? await db.collection("posts")
        .find({ _id: { $in: postIds.map((postId) => new ObjectId(postId)) } })
        .toArray()
      : [];
    const postsById = new Map(posts.map((post) => [post._id.toString(), post]));

    const reportsWithPosts = reports.map((report) => ({
      ...report,
      post: postsById.get(report.postId) ?? null,
    }));
    return res.status(200).json(reportsWithPosts);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get("/api/hidden-posts", async (_req, res) => {
  //console.log("sdasdasdasd")
  try {
    const db = getDB();
    const reports = await db.collection("reports")
      .find({ "userIds.1": { $exists: true } })
      .toArray();
    const postIds = reports
      .map((report) => report.postId)
      .filter((postId) => typeof postId === "string" && ObjectId.isValid(postId));
    const posts = postIds.length
      ? await db.collection("posts")
        .find({ _id: { $in: postIds.map((postId) => new ObjectId(postId)) } })
        .toArray()
      : [];
    const reportsByPostId = new Map(
      reports.map((report) => [report.postId, report.userIds.length]),
    );

    return res.status(200).json(
      posts.map((post) => ({
        ...post,
        reportCount: reportsByPostId.get(post._id.toString()) ?? 0,
      })),
    );
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get("/api/posts", async (req, res) => {
  if (res.status(404)) {
    //console.log("dsafds")
  }
  try {
    const db = getDB();

    const collection = db.collection("posts");
    const posts = await collection.find().toArray();

    res.status(200).json(posts);
  } catch (error) {
    // Handle database or server errors
    res.status(500).json({ message: "Server error", error: error.message });
  }

});

app.get("/api/posts/:id", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const db = getDB();

    const collection = db.collection("posts");
    const query = { _id: new ObjectId(req.params.id) };

    const post = await collection.findOne(query, { projection: { password: 0 } });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(post);
  } catch (error) {
    // Handle database or server errors
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get("/api/users/:user/posts", async (req, res) => {
  try {
    const db = getDB();

    const collection = db.collection("posts");
    const userIdentifier = req.params.user;
    const query = {
      $or: [
        { postUser: userIdentifier },
        { username: userIdentifier },
        { userId: userIdentifier },
      ],
    };

    const posts = await collection.find(query).toArray();

    return res.status(200).json(posts);
  } catch (error) {
    // Handle database or server errors
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.post("/api/posts", uploadImage.single("image"), async (req, res) => {
  let uploadedImagePath;

  try {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({ message: "Post data is required" });
    }

    let hastags;
    try {
      hastags = Array.isArray(req.body.hastags)
        ? req.body.hastags
        : JSON.parse(req.body.hastags ?? "[]");
    } catch {
      return res.status(400).json({ message: "Post hashtags must be a valid JSON array" });
    }

    const { postUser, userId, caption } = req.body;
    const validPost =
      typeof postUser === "string" && postUser.trim().length > 0 &&
      typeof userId === "string" && userId.trim().length > 0 && ObjectId.isValid(userId.trim()) &&
      typeof caption === "string" && caption.trim().length > 0 &&
      Array.isArray(hastags) && hastags.every((hashtag) => typeof hashtag === "string");

    if (!validPost) {
      return res.status(400).json({
        message: "Invalid post: expected postUser, userId, caption, and an array of hashtags",
      });
    }

    const createdAt = new Date();
    const date = [
      String(createdAt.getDate()).padStart(2, "0"),
      String(createdAt.getMonth() + 1).padStart(2, "0"),
      createdAt.getFullYear(),
    ].join("-");

    const newPost = {
      postUser: postUser.trim(),
      userId: userId.trim(),
      caption: caption.trim(),
      hastags,
      image: "",
      likes: 0,
      comments: [],
      date,
    };

    if (req.file) {
      const filename = `${randomUUID()}.${postImageExtensions[req.file.mimetype]}`;
      await mkdir(postImagesDirectory, { recursive: true });
      uploadedImagePath = join(postImagesDirectory, filename);
      await writeFile(uploadedImagePath, req.file.buffer, { flag: "wx" });
      newPost.image = `/uploads/posts/${filename}`;
    }

    const db = getDB();
    const collection = db.collection("posts");
    const result = await collection.insertOne(newPost);

    return res.status(201).json({ _id: result.insertedId, ...newPost });
  } catch (error) {
    if (uploadedImagePath) {
      try {
        await unlink(uploadedImagePath);
      } catch (cleanupError) {
        if (cleanupError.code !== "ENOENT") {
          console.error("Could not remove the failed post image upload:", cleanupError);
        }
      }
    }
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.post("/api/posts/:id/comments", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const comment = req.body?.comment;
    const validComment =
      (typeof comment === "string" && comment.trim().length > 0) ||
      (comment !== null && typeof comment === "object" && !Array.isArray(comment));

    if (!validComment) {
      return res.status(400).json({ message: "Please put a valid comment" });
    }

    const collection = getDB().collection("posts");
    const query = { _id: new ObjectId(req.params.id) };
    const result = await collection.updateOne(query, { $push: { comments: comment } });//finds post and appends to comments array

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    const post = await collection.findOne(query, { projection: { password: 0 } });
    return res.status(200).json(post);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.post("/api/posts/:id/reports", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const { reason, userId } = req.body ?? {};
    if (typeof reason !== "string" || reason.trim().length === 0) {
      return res.status(400).json({ message: "A report reason is required" });
    }
    if (typeof userId !== "string" || !ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "A valid reporting user ID is required" });
    }

    const db = getDB();
    const reporterId = userId.trim();
    const reporter = await db.collection("users").findOne({
      _id: new ObjectId(reporterId),
    });
    if (!reporter) {
      return res.status(404).json({ message: "Reporting user not found" });
    }

    const reasons = await getReportReasons();
    const selectedReason = reasons.find((item) => item === reason.trim());
    if (!selectedReason) {
      return res.status(400).json({ message: "Choose a valid report reason" });
    }

    const postId = req.params.id;
    const post = await db.collection("posts").findOne(
      { _id: new ObjectId(postId) },
      { projection: { userId: 1 } },
    );
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.userId === reporterId) {
      return res.status(400).json({ message: "You cannot report your own post" });
    }

    const reportsCollection = db.collection("reports");
    const existingReport = await reportsCollection.findOne({ postId });
    if (existingReport?.userIds?.includes(reporterId)) {
      return res.status(409).json({ message: "You have already reported this post" });
    }

    const update = {
      $setOnInsert: { postId },
      $push: { reason: selectedReason },
      $addToSet: { userIds: reporterId },
    };
    try {
      await reportsCollection.updateOne(
        { postId, userIds: { $ne: reporterId } },
        update,
        { upsert: true },
      );
    } catch (error) {
      if (error.code === 11000) {
        const retry = await reportsCollection.updateOne(
          { postId, userIds: { $ne: reporterId } },
          update,
        );
        if (retry.matchedCount === 0) {
          return res.status(409).json({ message: "You have already reported this post" });
        }
      } else {
        throw error;
      }
    }

    return res.status(201).json({ message: "Post reported successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.post("/api/posts/:id/likes", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid post id" });
    }

    const collection = getDB().collection("posts");
    const query = { _id: new ObjectId(req.params.id) };
    const result = await collection.updateOne(query, { $inc: { likes: 1 } });

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.status(200).json(await collection.findOne(query));
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.delete("/api/posts/:id/likes", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid post id" });
    }

    const collection = getDB().collection("posts");
    const query = { _id: new ObjectId(req.params.id) };
    const result = await collection.updateOne(
      { ...query, likes: { $gt: 0 } }, //if the likes are at 0 already, dont decement
      { $inc: { likes: -1 } }//decrement
    );

    const post = await collection.findOne(query);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.status(200).json(post);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get(`/api/users`, async (req, res) => {
  try {
    const db = getDB();
    const collection = db.collection("users");
    const { id } = req.params;

    // Add the post query here, using the route id as needed.
   // const query = {id : id};
    const post = await collection.find(
      {},
      { projection: { _id: 1, username: 1, image: 1 } },
    ).toArray();

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.status(200).json(post);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
})

app.get(`/api/users/:id`, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const db = getDB();
    const collection = db.collection("users");
    const query = { _id: new ObjectId(req.params.id) };

    const post = await collection.findOne(query);

    if (!post) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(post);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
});

app.patch("/api/users/:id", uploadImage.single("image"), async (req, res) => {
  let newImagePath;

  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const editableFields = ["name", "surname", "username", "email", "bio"];
    const updates = Object.fromEntries(
      editableFields
        .filter((field) => Object.prototype.hasOwnProperty.call(req.body, field))//  do any of the allowed fields exist in body
        .map((field) => [field, req.body[field]])// turn into this ["asdasd" : "sdaas"]
    );

    if (Object.keys(updates).length === 0 && !req.file) {
      return res.status(400).json({ message: "No profile fields provided" });
    }

    const db = getDB();
    const collection = db.collection("users");
    const query = { _id: new ObjectId(req.params.id) };
    const existingProfile = await collection.findOne(query, { projection: { image: 1 } });
    if (!existingProfile) {
      return res.status(404).json({ message: "User not found" });
    }

    const previousImagePath = existingProfile.image;
    if (req.file) {
      await mkdir(profilePicturesDirectory, { recursive: true });
      const filename = `${req.params.id}-${randomUUID()}.${postImageExtensions[req.file.mimetype]}`;
      newImagePath = `/uploads/profile-pictures/${filename}`;
      await writeFile(join(profilePicturesDirectory, filename), req.file.buffer, { flag: "wx" });
      updates.image = newImagePath;
    }

    const result = await collection.updateOne(query, { $set: updates });

    if (result.matchedCount === 0) {
      if (newImagePath) {
        await unlink(join(profilePicturesDirectory, basename(newImagePath)));
      }
      return res.status(404).json({ message: "User not found" });
    }

    const profile = await collection.findOne(query, { projection: { password: 0 } });

    if (
      newImagePath &&
      typeof previousImagePath === "string" &&
      previousImagePath.startsWith("/uploads/profile-pictures/") &&
      basename(previousImagePath) === previousImagePath.slice("/uploads/profile-pictures/".length)
    ) {
      try {
        await unlink(join(profilePicturesDirectory, basename(previousImagePath)));
      } catch (cleanupError) {
        if (cleanupError.code !== "ENOENT") {
          console.error("Could not remove the previous profile picture:", cleanupError);
        }
      }
    }

    return res.status(200).json(profile);
  } catch (error) {
    if (newImagePath) {
      try {
        await unlink(join(profilePicturesDirectory, basename(newImagePath)));
      } catch (cleanupError) {
        if (cleanupError.code !== "ENOENT") {
          console.error("Could not remove an unsaved profile picture:", cleanupError);
        }
      }
    }
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.post("/api/login", async (req, res) => {
 

  const { email, password } = req.body;

  try {
    const db = getDB();

    const collection = db.collection("users");
    const users = await collection.find().toArray();

    let query = { email: email };
    let result = await collection.findOne(query);
    if (!result) {
      res.send("email not found").status(404);
      return;
    }
    if (result.password == password) {
      res.status(200).json({ userId: result._id.toString(), user : result.username });
      return;
      
    } else {
      res.status(401).json("password is incorrect");
}
   
    //console.log("result" + result)
  } catch (error) {
    // Handle database or server errors
    res.status(500).json({ message: "Server error", error: error.message });
  }

  
});

app.post("/api/logout", (req, res) => {
  res.status(200).json({ message: "Logout successful" });
});

app.delete("/api/posts/:id", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const db = getDB();
    const collection = db.collection("posts");
    const post = await collection.findOne(
      { _id: new ObjectId(req.params.id) },
      { projection: { userId: 1, image: 1 } },
    );
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (!(await canManageContent(req.body?.userId, post.userId))) {
      return res.status(403).json({ message: "Only the post owner or an admin can delete this post" });
    }

    const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Post not found" });
    }
    await db.collection("reports").deleteOne({ postId: req.params.id });

    if (
      typeof post.image === "string" &&
      post.image.startsWith("/uploads/posts/") &&
      basename(post.image) === post.image.slice("/uploads/posts/".length)
    ) {
      try {
        await unlink(join(postImagesDirectory, basename(post.image)));
      } catch (cleanupError) {
        if (cleanupError.code !== "ENOENT") {
          console.error("Could not remove the deleted post's image:", cleanupError);
        }
      }
    }

    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.post("/api/signup", async(req, res) => {
  try {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({ message: "User data is required" });
    }

    const db = getDB();

    const collection = db.collection("users");
    const userId = new ObjectId();
    const newDocument = {
      ...req.body,
      userId: userId.toString(),
      _id: userId,
    };
    await collection.insertOne(newDocument);
    return res.status(201).json({ userId: userId.toString() });
}catch (error) {
    // Handle database or server errors
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
 
app.post("/api/albums", async (req, res) => {
  try {
    const { name, description, username, userId, hastags, hashtags, postIds } = req.body ?? {};
    const albumHashtags = hastags ?? hashtags;
    const albumPostIds = postIds ?? [];
    const validAlbum =
      typeof name === "string" && name.trim().length > 0 &&
      typeof description === "string" &&
      typeof username === "string" && username.trim().length > 0 &&
      typeof userId === "string" && ObjectId.isValid(userId.trim()) &&
      Array.isArray(albumHashtags) && albumHashtags.every((hashtag) => typeof hashtag === "string") &&
      Array.isArray(albumPostIds) && albumPostIds.every((postId) => typeof postId === "string" && ObjectId.isValid(postId));

    if (!validAlbum) {
      return res.status(400).json({
        message: "Invalid album: expected name, description, username, userId, hastags, and postIds",
      });
    }

    const createdAt = new Date();
    const date = [
      String(createdAt.getDate()).padStart(2, "0"),
      String(createdAt.getMonth() + 1).padStart(2, "0"),
      createdAt.getFullYear(),
    ].join("-");

    const newAlbum = {
      name: name.trim(),
      description: description.trim(),
      username: username.trim(),
      hastags: albumHashtags,
      postIds: albumPostIds,
      userId: userId.trim(),
      date,
    };
    const result = await getDB().collection("albums").insertOne(newAlbum);
    return res.status(201).json({ _id: result.insertedId, ...newAlbum });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get("/api/albums", async (req, res) => {
 
  try {
    const db = getDB();

    const collection = db.collection("albums");
    const albums = await collection.find().toArray();

    res.status(200).json(albums);
  } catch (error) {
    // Handle database or server errors
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get("/api/albums/:id", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const db = getDB();

    const collection = db.collection("albums");
    const query = { _id: new ObjectId(req.params.id) };

    const album = await collection.findOne(query);

    res.status(200).json(album);
  } catch (error) {
    // Handle database or server errors
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
app.delete("/api/albums/:id", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const db = getDB();
    const collection = db.collection("albums");
    const album = await collection.findOne(
      { _id: new ObjectId(req.params.id) },
      { projection: { userId: 1 } },
    );
    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }
    if (!(await canManageContent(req.body?.userId, album.userId))) {
      return res.status(403).json({ message: "Only the album owner or an admin can delete this album" });
    }

    const result = await collection.deleteOne({
      _id: new ObjectId(req.params.id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.status(200).json({ message: "Album deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
});
app.patch("/api/albums/:id", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({ message: "Album updates are required" });
    }

    const updates = {};
    if (Object.prototype.hasOwnProperty.call(req.body, "name")) {
      if (typeof req.body.name !== "string" || !req.body.name.trim()) {
        return res.status(400).json({ message: "Album name cannot be empty" });
      }
      updates.name = req.body.name.trim();
    }
    if (Object.prototype.hasOwnProperty.call(req.body, "description")) {
      if (typeof req.body.description !== "string") {
        return res.status(400).json({ message: "Album description must be text" });
      }
      updates.description = req.body.description.trim();
    }
    if (Object.prototype.hasOwnProperty.call(req.body, "postIds")) {
      if (
        !Array.isArray(req.body.postIds) ||
        !req.body.postIds.every((postId) => typeof postId === "string" && ObjectId.isValid(postId))
      ) {
        return res.status(400).json({ message: "Album post IDs must be a list of valid IDs" });
      }
      updates.postIds = [...new Set(req.body.postIds)];
    }
    if (Object.prototype.hasOwnProperty.call(req.body, "hashtags")) {
      if (
        !Array.isArray(req.body.hashtags) ||
        !req.body.hashtags.every((hashtag) => typeof hashtag === "string")
      ) {
        return res.status(400).json({ message: "Album hashtags must be a list of text values" });
      }
      updates.hashtags = req.body.hashtags;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No profile fields provided" });
    }

    const db = getDB();
    const collection = db.collection("albums");
    const query = { _id: new ObjectId(req.params.id) };
    const existingAlbum = await collection.findOne(query);
    if (!existingAlbum) {
      return res.status(404).json({ message: "Album not found" });
    }

    if (updates.postIds) {
      const selectedPosts = await db.collection("posts")
        .find({
          _id: { $in: updates.postIds.map((postId) => new ObjectId(postId)) },
          userId: existingAlbum.userId,
        })
        .project({ _id: 1 })
        .toArray();
      if (selectedPosts.length !== updates.postIds.length) {
        return res.status(400).json({
          message: "Albums can only include posts owned by their creator",
        });
      }
    }

    const result = await collection.updateOne(query, { $set: updates });

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Album not found" });
    }

    const album = await collection.findOne(query, {
      projection: { password: 0 },
    });
    return res.status(200).json(album);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
});

app.post("/api/users/:id/requests", async (req, res) => {
  try {
    const recipientId = req.params.id;
    const requesterId = req.body?.requesterId;
    if (!ObjectId.isValid(recipientId) || !ObjectId.isValid(requesterId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    if (recipientId === requesterId) {
      return res.status(400).json({ message: "You cannot send a friend request to yourself" });
    }

    const collection = getDB().collection("users");
    const recipientObjectId = new ObjectId(recipientId);
    const requesterObjectId = new ObjectId(requesterId);
    const [recipient, requester] = await Promise.all([
      collection.findOne({ _id: recipientObjectId }),
      collection.findOne({ _id: requesterObjectId }),
    ]);
    if (!recipient || !requester) {
      return res.status(404).json({ message: "User not found" });
    }
    if (
      (recipient.friends ?? []).some(
        (id) => id.toString() === requesterId || id.toString() === requester.username,
      )
    ) {
      return res.status(409).json({ message: "Users are already friends" });
    }

    await collection.updateOne(
      { _id: recipientObjectId },
      { $addToSet: { requests: requesterObjectId } },
    );
    return res.status(201).json({ message: "Friend request sent" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get("/api/users/:id/requests", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const collection = getDB().collection("users");
    const user = await collection.findOne(
      { _id: new ObjectId(req.params.id) },
      { projection: { requests: 1 } },
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const requestReferences = user.requests ?? [];
    const requestIds = requestReferences
      .filter((id) => ObjectId.isValid(id))
      .map((id) => new ObjectId(id));
    const requestUsernames = requestReferences
      .filter((reference) => typeof reference === "string" && !ObjectId.isValid(reference));
    const requestQuery = [];
    if (requestIds.length) {
      requestQuery.push({ _id: { $in: requestIds } });
    }
    if (requestUsernames.length) {
      requestQuery.push({ username: { $in: requestUsernames } });
    }
    const requests = requestQuery.length
      ? await collection.find(
          { $or: requestQuery },
          { projection: { password: 0 } },
        ).toArray()
      : [];
    return res.status(200).json(requests);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.post("/api/users/:id/requests/:requesterId/accept", async (req, res) => {
  try {
    const { id, requesterId } = req.params;
    if (!ObjectId.isValid(id) || !ObjectId.isValid(requesterId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    if (id === requesterId) {
      return res.status(400).json({ message: "Invalid friend request" });
    }

    const collection = getDB().collection("users");
    const userId = new ObjectId(id);
    const senderId = new ObjectId(requesterId);
    const [user, sender] = await Promise.all([
      collection.findOne({ _id: userId }),
      collection.findOne({ _id: senderId }),
    ]);
    if (!user || !sender) {
      return res.status(404).json({ message: "User not found" });
    }
    if (
      !(user.requests ?? []).some(
        (requestId) =>
          requestId.toString() === requesterId ||
          requestId.toString() === sender.username,
      )
    ) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    await collection.updateOne(
      { _id: userId },
      {
        $pull: { requests: { $in: [senderId, sender.username] } },
        $addToSet: { friends: senderId },
      },
    );
    await collection.updateOne(
      { _id: senderId },
      { $addToSet: { friends: userId } },
    );
    return res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.delete("/api/users/:id/requests/:requesterId", async (req, res) => {
  try {
    const { id, requesterId } = req.params;
    if (!ObjectId.isValid(id) || !ObjectId.isValid(requesterId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const collection = getDB().collection("users");
    const userId = new ObjectId(id);
    const senderId = new ObjectId(requesterId);
    const [user, sender] = await Promise.all([
      collection.findOne({ _id: userId }),
      collection.findOne({ _id: senderId }),
    ]);
    if (!user || !sender) {
      return res.status(404).json({ message: "User not found" });
    }
    if (
      !(user.requests ?? []).some(
        (requestId) =>
          requestId.toString() === requesterId ||
          requestId.toString() === sender.username,
      )
    ) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    await collection.updateOne(
      { _id: userId },
      { $pull: { requests: { $in: [senderId, sender.username] } } },
    );
    return res.status(200).json({ message: "Friend request rejected" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.delete("/api/users/:id/friends/:friendId", async (req, res) => {
  try {
    const { id, friendId } = req.params;
    if (!ObjectId.isValid(id) || !ObjectId.isValid(friendId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const collection = getDB().collection("users");
    const userId = new ObjectId(id);
    const otherId = new ObjectId(friendId);
    const [user, friend] = await Promise.all([
      collection.findOne({ _id: userId }),
      collection.findOne({ _id: otherId }),
    ]);
    if (!user || !friend) {
      return res.status(404).json({ message: "User not found" });
    }

    await Promise.all([
      collection.updateOne(
        { _id: userId },
        { $pull: { friends: { $in: [otherId, friend.username] } } },
      ),
      collection.updateOne(
        { _id: otherId },
        { $pull: { friends: { $in: [userId, user.username] } } },
      ),
    ]);
    return res.status(200).json({ message: "Friend removed" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get("/api/content", async (req, res) => {
  try {
    const db = getDB();
    const [albums, posts] = await Promise.all([
      db.collection("albums").find().toArray(),
      db.collection("posts").find().toArray(),
    ]);

    return res.status(200).json({ albums, posts });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      message: "Uploaded images must be no larger than 20 MB.",
    });
  }

  if (error.code === "INVALID_IMAGE_TYPE") {
    return res.status(400).json({ message: error.message });
  }

  if (error.type === "entity.too.large") {
    return res.status(413).json({
      message: "The post image is too large. Please upload a smaller image.",
    });
  }

  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ message: "The request body contains invalid JSON." });
  }

  return next(error);
});






connectDB()
  .then(() => {
    return getDB().collection("reports").createIndex({ postId: 1 }, { unique: true });
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB:", error);
  });