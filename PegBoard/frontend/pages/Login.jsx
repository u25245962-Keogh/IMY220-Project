import { useState } from "react";

function Login() {
      const [username, setUsername] = useState("");
      const [password, setPassword] = useState("");
      const [error, setError] = useState("");
    

    const handleSubmit = async (e) => {
      e.preventDefault();

      if (username === "" || password === "") {
        setError("Fill in all fields");
        return;
      }

      if (!email.includes("@")) {
        setError("Please enter a valid email address.");
        return;
      }

      setError("Login details are valid.");

      try {
        const response = await fetch("/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        });
        const data = await response.json();
        if (response.ok) {
          console.log("Login successful:", data);
          setError("Login successful");
          navigate("/home");
        } else {
          setError(data.message || "Invalid username or password");
        }
      } catch (error) {
        console.error(error);
        setError("failed to connect to the server");
      }
    };

    return (
        <main className="loginForm">
            <h1>Login</h1>
            <form onSubmit={handleSubmit} noValidate>
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" required />

                <label htmlFor="password">Password</label>
                <input id="password" name="password" type="password" required />

                <button type="submit">Login</button>
                {error && <p role="alert">{error}</p>}
            </form>
        </main>
    );
}

export default Login;