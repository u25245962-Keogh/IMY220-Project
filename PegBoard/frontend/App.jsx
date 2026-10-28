
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Posts from "./pages/Posts";
import Splash from "./pages/Splash";
import Login from "./pages/Login";
import Post from "./pages/Post";
import Album from "./pages/Album";
import "./styles/main.css"
import Signup from "./pages/Signup";
import OtherProfile from "./pages/OtherProfile";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import logo from "./assests/logo.png";

function HomeLogo() {
  const { pathname } = useLocation();
  const isSplashPage = pathname === "/" || pathname === "/splash";

  return (
    <Link
      to="/"
      className={`fixed top-4 z-[100] block ${
        isSplashPage
          ? "left-1/2 w-80 max-w-[calc(100vw-2rem)] -translate-x-1/2 sm:w-96"
          : "left-4 w-48"
      }`}
      aria-label="PegBoard home"
    >
      <img src={logo} alt="PegBoard" className="h-auto w-full" />
    </Link>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="bg">
        <BrowserRouter>
          <HomeLogo />
          <Routes>
            <Route path="/" element={<Splash />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/home" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/OtherProfle" element={<OtherProfile />} />
              <Route path="/OtherProfile/:id" element={<OtherProfile />} />
              <Route path="/posts" element={<Posts />} />
              <Route path="/posts/:id" element={<Post />} />
              <Route path="/albums/:id" element={<Album />} />
              <Route path="/splash" element={<Splash />} />
            </Route>

            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route path="*" element={<h2>Page Not Found</h2>} />
          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;