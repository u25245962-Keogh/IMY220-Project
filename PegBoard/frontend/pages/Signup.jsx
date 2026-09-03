import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function SignUp() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

 const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (username === "" || password === "" || email === "") {
      setError("Fill in all fields");
      return;
    }

    if (username.length < 5) {
        setError("Username must be at least 5 characters long");
        return;
    }
    const regexP = /^(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
    const regexE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!regexE.test(email)) {
      setError("Please enter a valid email address");
      return;
    } 

    if (!regexP.test(password)) {
      setError(
        "Password must be at least 8 characters long, have a symbol and have one uppercase and one lowercase character",
      );
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
        console.log("sign up valid:", data);
        setError("sign up error");
        navigate("/home");
      }
      else{
        setError(data.message || "signing up failed");
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
