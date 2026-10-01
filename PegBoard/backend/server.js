import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB, getDB } from "./db.js";

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

app.get("api/posts/:id", async (req, res) => {
 const id = 0///                                          NOT WORKING YET
    let collection = await db.collection("posts");
    let query = {_id: ObjectId(req.params.id)};
    let result = await collection.findOne(query);
    if (!result) res.send("Not found").status(404);
    else res.send(result).status(200);

})

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