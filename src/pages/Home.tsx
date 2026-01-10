import React from "react";
import "./Home.css";
import HomeNav from "../components/HomeNav";
import User from "../assets/user.png";
import Calendar from "../assets/calendar.png";
import History from "../assets/history.png";
import Package from "../assets/package.png";
import Catalogue from "../assets/catalogue.png";
import Circle from "../components/Circle";
import Contact from "../components/Contact";
import { useNavigate } from "react-router-dom";

type Status = 'Pending' | 'Confirmed' | 'In Progress' | 'Pickup' | 'Completed';

interface Props {
  currentStatus: Status;
}

const stages: { name: Status; icon: string } [] = [
  {name: 'Pending', icon: '⏳'}, 
  {name: 'Confirmed', icon: '✅'}, 
  {name: 'In Progress', icon: '🔧'}, 
  {name: 'Pickup', icon: '🚚'}, 
  {name: 'Completed', icon: '🎉'}
];

const offers = [
  { name: "Starter Pack", price: "Rs 2000", benefit: "10 months free servicing", expiry: "30 Nov 2025" },
  { name: "Premium Care", price: "Rs 5000", benefit: "Free pickup & delivery", expiry: "15 Dec 2025" },
]

const Home: React.FC<Props> = ({ currentStatus }) => {
  const currentIndex = stages.findIndex(stage => stage.name === currentStatus);
  const navigate = useNavigate();

  return (
    <>
      <HomeNav />
      <div className="home-main-container">
        <div className="greetings-container">
          <img src={User} style={{width: "120px", height: "120px", borderRadius: "60px"}} />
          <div className="greetings-text">
            <h1> Hi, Pratik 👋</h1>
            <p style={{color: "#888", marginTop: "10px"}}> Welcome to your dashboard </p>
          </div>
        </div>

        <div className="quick-action">
          <h1 style={{fontSize: "24px"}}> Quick Actions</h1>
        </div>

        <div className="services-container">
          <div className="service-card">
            <button onClick={() => navigate('/book-appointment')}>
              <img src={Calendar} style={{width: "25px", height: "25px"}} />
              <h3 style={{ marginTop: "15px", marginRight: "42px"}}> Book Service </h3>
              <p> Schedule a new service</p>
            </button>
          </div>
          <div className="service-card">
            <button onClick={() => navigate('/catalog')}>
              <img src={Catalogue} style={{width: "25px", height: "25px"}} />
              <h3 style={{ marginTop: "15px"}}>Browse Catalog</h3>
              <p style={{marginRight: "10px"}}>Find parts and price</p>
              {/* <h3 style={{ marginTop: "15px", marginRight: "85px"}}> BrowseCatalogue </h3>
              <p style={{marginRight: "15px"}}> Find parts and price</p> */}
            </button>
          </div>
          <div className="service-card">
            <button>
              <img src={History} style={{width: "25px", height: "25px"}} />
              <h3 style={{ marginTop: "15px"}}> Service History </h3>
              <p style={{ marginRight: "20px"}}> View Past Records</p>
            </button>
          </div>
          <div className="service-card">
            <button>
              <img src={Package} style={{width: "25px", height: "25px"}} />
              <h3 style={{ marginTop: "20px", marginRight: "75px"}}> Packages </h3>
              <p> View service packages</p>
            </button>
          </div>
        </div>

        <div className="quick-action">
          <h1 style={{fontSize: "24px"}}> Active Service Progress </h1>
<div className="home-progress-container">
  {stages.map((stage, index) => {
    const isCompleted = index < currentIndex;
    const isActive = index === currentIndex;

    return (
      <div key={stage.name} className="home-stage">
        <div
          className={`home-progress-icon-wrapper ${
            isCompleted ? 'home-progress-completed' : isActive ? 'home-progress-active' : 'home-progress-inactive'
          }`}
        >
          {isCompleted ? (
            <span className="home-progress-icon">&#10003;</span> 
          ) : (
            <span className="home-progress-icon">{stage.icon}</span> 
          )}
        </div>

        <div className="home-progress-label">{stage.name}</div>
        {index < stages.length - 1 && (
          <div
            className={`home-progress-line ${
              index < currentIndex ? 'home-progress-line-completed' : 'home-progress-line-inactive'
            }`}
          />
        )}
      </div>
    );
  })}
</div>
          <div className="days-vehicle">
            <div className="circle">
              <Circle startDate={new Date("2025-11-01")} totalDays={90} size={200} strokeWidth={15} />
              <div>
                <h1 style={{marginBottom: "15px", fontSize: "24px"}}>Next service Due Soon</h1>
                <p style={{color: "#888"}}>Your next schedule maintainence is approaching. </p>
                <p style={{color: "#888", marginBottom: "15px"}}>Don't forget to book an appointment.</p>
                <p style={{color: "#888"}}>Last Serviced &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Next Service Due</p>
                <p style={{fontWeight: "600"}}>Oct 15, 2023 &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Jan 15, 2024</p>
              </div>
            </div>
            <div className="vehicle-overview">
              <h1 style={{marginBottom: "15px", fontSize: "24px"}}>Vehicle Overview</h1>
              <div className="vehicle-data">
                <div className="vehicle-row">
                  <span className="label">Make:</span>
                  <p className="value">2010</p>
                </div>
                <div className="vehicle-row">
                  <span className="label">Model:</span>
                  <p className="value">Camry</p>
                </div>
                <div className="vehicle-row">
                  <span className="label">Plate:</span>
                  <p className="value">Ba 2 Pa 9549</p>
                </div>
                <div className="vehicle-row">
                  <span className="label">Year:</span>
                  <p className="value">2023</p>
                </div>
              </div>
            </div>
            </div>
          </div>
          <div className="quick-action">
              <h1 className="title">Offers and Announcement</h1>
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
                    
                      {offers.map((offer, idx) => (
                        <tr key ={idx}>
                          <td>{offer.name}</td>
                          <td>{offer.price}</td>
                          <td>{offer.benefit}</td>
                          <td>{offer.expiry}</td>
                          <td>
                            <button className="button">Details</button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
      </div>
      <Contact />
      <footer className="footer">
        <p>© 2025 Servicify. All rights reserved.</p>
      </footer>
    </>
  );
};

export default Home;