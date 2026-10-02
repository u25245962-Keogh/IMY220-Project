import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB, getDB } from "./db.js";
import { ObjectId } from "mongodb"; 
import { MongoClient } from "mongodb";



const  id  = 2; 
dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

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
    const query = { postUser: req.params.user };

    const posts = await collection.find(query).toArray();

    return res.status(200).json(posts);
  } catch (error) {
    // Handle database or server errors
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.post("/api/posts", async (req, res) => {
  try {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({ message: "Post data is required" });
    }

    const newPost = {
      ...req.body,
      likes: 0,
      comments: [],
      reports: [],
    };

    const { postUser, caption, hastags, image } = newPost;
    const validPost =
      typeof postUser === "string" && postUser.trim().length > 0 &&
      typeof caption === "string" && caption.trim().length > 0 &&
      Array.isArray(hastags) && hastags.every((hashtag) => typeof hashtag === "string") 
     // typeof image === "string" && image.trim().length > 0 &&
     // Number.isInteger(newPost.likes) && newPost.likes === 0 &&
     // Array.isArray(newPost.comments);

    if (!validPost) {
      return res.status(400).json({
        message: "Invalid post: expected postUser, caption, hastags, image, and username",
      });
    }

    const db = getDB();
    const collection = db.collection("posts");
    const result = await collection.insertOne(newPost);

    return res.status(201).json({ _id: result.insertedId, ...newPost });
  } catch (error) {
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

    const collection = getDB().collection("posts");
    const query = { _id: new ObjectId(req.params.id) };
    const report = {
      reason: reason.trim(),
      ...(typeof userId === "string" && userId.trim() ? { userId: userId.trim() } : {}),
      createdAt: new Date(),
    };
    const result = await collection.updateOne(query, { $push: { reports: report } });

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Post not found" });
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
    const post = await collection.find().toArray();

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
      return res.status(404).json({ message: "Post not found" });
    }

    return res.status(200).json(post);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
});

app.patch("/api/users/:id", async (req, res) => {
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

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No profile fields provided" });
    }

    const db = getDB();
    const collection = db.collection("users");
    const query = { _id: new ObjectId(req.params.id) };
    const result = await collection.updateOne(query, { $set: updates });

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const profile = await collection.findOne(query, { projection: { password: 0 } });
    return res.status(200).json(profile);
  } catch (error) {
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
    const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.post("/api/signup", async(req, res) => {
  try {
    const db = getDB();

    const collection = db.collection("users");
    //const users = await collection.find().toArray();

   
    let newDocument = req.body;
    let result = await collection.insertOne(newDocument);
    res.send(result).status(204); //success but ntohing to return
}catch (error) {
    // Handle database or server errors
    res.status(500).json({ message: "Server error", error: error.message });
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
    const result = await collection.deleteOne({
      _id: new ObjectId(req.params.id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.status(200).json({ message: "Post deleted successfully" });
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

    const editableFields = ["name", "description", "hashtags"];
    const updates = Object.fromEntries(
      editableFields
        .filter((field) =>
          Object.prototype.hasOwnProperty.call(req.body, field),
        ) //  do any of the allowed fields exist in body
        .map((field) => [field, req.body[field]]), // turn into this ["asdasd" : "sdaas"]
    );

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No profile fields provided" });
    }

    const db = getDB();
    const collection = db.collection("albums");
    const query = { _id: new ObjectId(req.params.id) };
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
    if ((recipient.friends ?? []).some((id) => id.toString() === requesterId)) {
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

    const requestIds = (user.requests ?? []).map((id) =>
      ObjectId.isValid(id) ? new ObjectId(id) : null,
    ).filter(Boolean);
    const requests = requestIds.length
      ? await collection.find({ _id: { $in: requestIds } }, { projection: { password: 0 } }).toArray()
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
    if (!(user.requests ?? []).some((requestId) => requestId.toString() === requesterId)) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    await collection.updateOne(
      { _id: userId },
      { $pull: { requests: senderId }, $addToSet: { friends: senderId } },
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
      collection.updateOne({ _id: userId }, { $pull: { friends: otherId } }),
      collection.updateOne({ _id: otherId }, { $pull: { friends: userId } }),
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







connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      //console.log(getDB())
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB:", error);
  });