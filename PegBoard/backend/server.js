import express from "express";
import cors from "cors";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  res.json({
    message: "Login valid",
    username: { username },
    password: { password },
  });
});

app.post("/api/signup", (req, res) => {
  const { username, email, password } = req.body;
  res.json({
    message: "Registration valid",
    username: { username },
    email: { email },
    password: { password },
  });
});

app.listen(PORT, () => {
  console.log(`server running on http://localhost:${PORT}`);
});
