import React from "react";
import "./HomeNav.css";
import userAvatar from "../assets/User-Avatar.png";
import bell from "../assets/bell.png";
import logo from "../assets/Servicify.png";
import { useNavigate } from "react-router-dom";

const HomeNav: React.FC = () => {
  const navigate = useNavigate();
  return (
    <nav className="Home-Navbar">
      <div className="Home-nav-left">
        <div className="Home-logo-icon" style={{width: "100px", height: "15px"}}>
            <img src={logo} alt="Servicify Logo" />
        </div>
      </div>

      {/* Middle Section: Links */}
      <div className="Home-nav-links">
        <button className="Home-nav-link active" onClick={() => navigate("/home")}>Home</button>
        <button className="Home-nav-link" onClick={() => navigate("/services")}>Services</button>
        <button className="Home-nav-link" onClick={() => navigate("/history")}>History</button>
        <button className="Home-nav-link" onClick={() => navigate("/packages")}>Packages</button>
      </div>

      <div className="Home-nav-right">

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
