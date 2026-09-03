import Login from "./Login";
import { Link } from "react-router-dom";
import logo from "../assests/logo.png";
import "../styles/splash.css"

function Splash() {
  return (
    <>
      <div className="logoSplash">
        <img src={logo} />
        <p>Share Your Creations</p>
      </div>
      <div className="SL-buttons">
        <div className="L-button">
          {" "}
          <Link to="/login">Login</Link>
        </div>
        <div className="S-button">
          <Link to="/signup">Sign-up</Link>
        </div>
      </div>
    </>
  );
}
export default Splash;
