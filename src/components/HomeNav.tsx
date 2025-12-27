import React from "react";
import "./HomeNav.css";
import userAvatar from "../assets/User-Avatar.png";
import bell from "../assets/bell.png";
import logo from "../assets/Servicify.png";

const HomeNav: React.FC = () => {
  return (
    <nav className="Home-Navbar">
      <div className="Home-nav-left">
        <div className="Home-logo-icon" style={{width: "100px", height: "15px"}}>
            <img src={logo} alt="Servicify Logo" />
        </div>
      </div>

      {/* Middle Section: Links */}
      <div className="Home-nav-links">
        <a href="#" className="Home-nav-link active">Home</a>
        <a href="#" className="Home-nav-link">Services</a>
        <a href="#" className="Home-nav-link">History</a>
        <a href="#" className="Home-nav-link">Packages</a>
      </div>

      <div className="Home-nav-right">
        <button className="Home-button icon-btn"  style={{width: "35px", height: "35px"}}>
          <img src={bell} alt="notifications" />
        </button>

        <div className="Home-profile-avatar" style={{marginLeft: "30px"}}>
          <button>
            <img
              src= {userAvatar}
              alt="profile"
            />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default HomeNav;
