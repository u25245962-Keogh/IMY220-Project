import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "../styles/Signup.css";

import logo from "../assests/logo.png";
import sculpture from "../assests/scultpure.png";
import printing3D from "../assests/3Dprinting.png";
import candle from "../assests/candle.png";
import woodwork from "../assests/woodwork.png";

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
    <>
      <div id="signupDiv">
        <h1 id="SUh1">Join Pegboard</h1>
        <h2 id="SUh2">Sign up</h2>
        <form onSubmit={handleSubmit} id="signupForm">
          <div id="signupFormDiv">
            <h3 id="SUh3">Sign up for pegboard</h3>
            <label htmlFor="username" className="signupLabel">
              Username
            </label>
            <input
              type="text"
              placeholder="user123"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="signupInput"
            />

            <label htmlFor="email" className="signupLabel">
              Email
            </label>
            <input
              type="text"
              placeholder="example@mail.com"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="signupInput"
            />

            <label htmlFor="password" className="signupLabel">
              Password
            </label>
            <input
              type="password"
              placeholder="**********"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="signupInput"
            />
          </div>
          <div id="signupButtonDiv">
            <button type="submit" id="signupButton">
              Sign up
            </button>
          </div>
          {error && <p id="signupError">{error}</p>}
        </form>
        <p id="haveAccount">
          already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
      <img src={logo} id="signUpLogo" />
      <img src={sculpture} id="SUsculpture" className="splashImages" />
      <img src={printing3D} id="SUprinting" className="splashImages" />
      <img src={candle} id="SUcandle" className="splashImages" />
      <img src={woodwork} id="SUwood" className="splashImages" />
    </>
  );
}
export default SignUp;
