//import "navbar.css"; // Import as an object
import { Link } from "react-router-dom";
import "../styles/nav.css";
import React from "react";
import nails from "../assests/Nails.png";

function Navbar(props) {
  return (
    <>
      <h1 className="pageName">{props.name}</h1>
      <div className="header">
        <h1>PegBoard</h1>
        <div className="Navigation">
          <div className="navImage">
            <img
              src={nails}
              alt="3 nails"
              className="nails"
              
            />
          </div>
          <div className="navList">
            <ul>
              <Link to="/">Home </Link>
              <Link to="/posts">Posts </Link>
              <Link to="/profile">Profile </Link>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;
