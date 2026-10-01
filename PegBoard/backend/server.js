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

app.get("/api/posts:id", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const db = getDB();

    const collection = db.collection("posts");
    const query = { _id: new ObjectId(req.params.id) };

    const post = await collection.findOne(query, { projection: { password: 0 } });

    res.status(200).json(post);
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
      res.status(200).json("success");
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