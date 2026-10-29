//import "navbar.css"; // Import as an object
import { Link } from "react-router-dom";
import "../styles/nav.css";
import nails from "../assests/Nails.png";
import { useAuth } from "../context/AuthContext";

function Navbar(props) {
  const { user } = useAuth();
  return (
    <header className="site-navbar">
      <div className="header">
        <h1 className="pageName">{props.name}</h1>
        <nav className="Navigation" aria-label="Main navigation">
          <div className="navImage">
            <img src={nails} alt="" className="nails" />
          </div>
          <div className="navList">
            <ul>
              <li><Link to="/home" className="navLink">Home</Link></li>
              <li><Link to="/posts" className="navLink">Posts</Link></li>
              <li><Link to="/profile" className="navLink">Profile</Link></li>
              {user?.username === "Admin" && <li><Link to="/reports" className="navLink">Reports</Link></li>}
            </ul>
          </div>
        </nav>
        </div>
    </header>
  );
}

export default Navbar;
