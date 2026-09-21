import { useEffect, useState } from "react";
import "../styles/login.css";
import { Navigate, useNavigate } from "react-router-dom";
import loginTools from "../assests/logintools.png";
import woodgrain from "../assests/grain.jpeg.jpg"
import logo from "../assests/logo.png";
import { Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  const handleEmail =  (e) => {
    e.preventDefault();
    setEmail(e.target.value);
  //  console.log(email)
  }
  const handlePassword =  (e) => {
    e.preventDefault();
    setPassword(e.target.value);
   // console.log(password);
  }

  const navigate = useNavigate();
    const handleSubmit = async (e) => {
      e.preventDefault();

      if (email === "" || password === "") {
        setError("Fill in all fields");
        return;
      }

      if (!email.includes("@")) {
        setError("Please enter a valid email address.");
        return;
      }

      setError("Login details are valid.");

      try {
        const response = await fetch("http://localhost:3000/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (response.ok) {
          console.log("Login successful:", data);
          setError("Login successful");
          navigate("/home")
          
        } else {
          setError(data.message || "Invalid username or password");
        }
      } catch (error) {
        console.error(error);
        setError("failed to connect to the server");
      }

     
        
      
    };

  return (
    <div id="loginSplit">
      <div className="loginForm">
        <img src={logo} id="Logo" />
        <img src={woodgrain} id="grain"></img>
        <h1 id="welcomeBack">Welcome back!</h1>

        <form onSubmit={handleSubmit} noValidate id="loginForm">
          <div id="orangeBox">
            <p id="loginTo">login to pegboard</p>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              onChange={handleEmail}
            />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              onChange={handlePassword}
            />
          </div>
          <button type="submit">Login</button>
          {error && <p role="alert">{error}</p>}
        </form>

        <p id="dontHaveAccount">
          Dont have an account? <Link to="/signup">Sign-up </Link>
        </p>
      </div>
      <div id="loginTools">
        <img src={loginTools}></img>
      </div>
    </div>
  );
}

export default Login;