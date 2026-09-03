import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function SignUp() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const passwordRegex = /^(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (username === "" || password === "" || email === "") {
      setError("Fill in all fields");
      return;
    }

    if (username.length < 3) {
        setError("Username must be at least 3 characters long");
        return;
    }

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
      
    } 

    if(!passwordRegex.test(password)) {
      setError("Password must be at least 8 characters long and contain at least one uppercase letter and one symbol.");
      return;
    }
    try{
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json();

      if(response.ok){
        console.log("SignUp successful:", data);
        setError("SignUp successful");
        navigate("/home");
      }
      else{
        setError(data.message || "SignUp failed");
      }
    }
    catch (error){
      console.error(error);
      setError("failed to connect to the server");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="username">Username</label>
      <input
        type="text"
        placeholder="Username"
        id="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <label htmlFor="email">Email</label>
      <input
        type="text"
        placeholder="email"
        id="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label htmlFor="password">Password</label>      
      <input
        type="password"
        placeholder="Password"
        id="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">SignUp</button>
      {error && <p>{error}</p>}
    </form>
  );
}
export default SignUp;
