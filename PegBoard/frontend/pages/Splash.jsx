import Login from "./Login";
import { Link } from "react-router-dom";
import logo from "../assests/logo.png";
import sculpture from "../assests/scultpure.png"
import printing3D from "../assests/3Dprinting.png";
import candle from "../assests/candle.png";
import woodwork from "../assests/woodwork.png";
import "../styles/splash.css"

function Splash() {
  return (
    <>
      <div className="logoSplash">
        <img src={logo} id="Logo" />
        <img src={sculpture} id="sculpture" className="splashImages" />
        <img src={printing3D} id="printing" className="splashImages" />
        <img src={candle} id="candle" className="splashImages" />
        <img src={woodwork} id="wood" className="splashImages" />
        <p>     Share Your Creations</p>
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
