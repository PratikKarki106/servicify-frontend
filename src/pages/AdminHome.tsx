import React from "react";
import "./AdminHome.css";
import HomeNav from "../components/HomeNav";
import User from "../assets/user.png";
import Package from "../assets/package.png";
import Catalogue from "../assets/catalogue.png";
import Calendar from "../assets/calendar.png";
import History from "../assets/history.png";

const AdminHome: React.FC = () => {
  return (
    <>
      <HomeNav />
      <div className="admin-main-container">
        <div className="greetings-container">
          <img
            src={User}
            alt="Admin"
            style={{ width: "120px", height: "120px", borderRadius: "60px" }}
          />
          <div className="greetings-text">
            <h1> Welcome, Admin 👋</h1>
            <p style={{ color: "#888", marginTop: "10px" }}>
              Manage Servicify dashboard
            </p>
          </div>
        </div>

        <div className="quick-action">
          <h1 className="title">Admin Actions</h1>
        </div>

        <div className="services-container">
          <div className="service-card">
            <button>
              <img src={Package} style={{ width: "25px", height: "25px" }} />
              <h3 style={{ marginTop: "15px" }}>Create Package</h3>
              <p> Add new service packages</p>
            </button>
          </div>
          <div className="service-card">
            <button>
              <img src={Catalogue} style={{ width: "25px", height: "25px" }} />
              <h3 style={{ marginTop: "15px" }}>Manage Catalog</h3>
              <p> Update parts & pricing</p>
            </button>
          </div>
          <div className="service-card">
            <button>
              <img src={Calendar} style={{ width: "25px", height: "25px" }} />
              <h3 style={{ marginTop: "15px" }}>View Bookings</h3>
              <p> See upcoming services</p>
            </button>
          </div>
          <div className="service-card">
            <button>
              <img src={History} style={{ width: "25px", height: "25px" }} />
              <h3 style={{ marginTop: "15px" }}>User History</h3>
              <p> Track customer records</p>
            </button>
          </div>
        </div>

        <div className="quick-action">
          <h1 className="title">Recent Packages</h1>
          <div className="offers">
            <table className="offers-table">
              <thead>
                <tr>
                  <th>Package Name</th>
                  <th>Price</th>
                  <th>Benefit</th>
                  <th>Expires In</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Starter Pack</td>
                  <td>Rs 2000</td>
                  <td>10 months free servicing</td>
                  <td>30 Nov 2025</td>
                  <td>
                    <button className="button">Edit</button>
                  </td>
                </tr>
                <tr>
                  <td>Premium Care</td>
                  <td>Rs 5000</td>
                  <td>Free pickup & delivery</td>
                  <td>15 Dec 2025</td>
                  <td>
                    <button className="button">Edit</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
        <footer className="footer">
          <p>© 2025 Servicify Admin. All rights reserved.</p>
        </footer>
    </>
  );
};

export default AdminHome;