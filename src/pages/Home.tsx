import React from "react";
import "./Home.css";
import HomeNav from "../components/HomeNav";
import User from "../assets/user.png";
import Calendar from "../assets/calendar.png";
import History from "../assets/history.png";
import Package from "../assets/package.png";
import Catalogue from "../assets/catalogue.png";

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

const Home: React.FC<Props> = ({ currentStatus }) => {
  const currentIndex = stages.findIndex(stage => stage.name === currentStatus);

  return (
    <>
      <HomeNav />
      <div className="home-main-container">
        <div className="greetings-container">
          <img src={User} style={{width: "120px", height: "120px", borderRadius: "60px"}} />
          <div className="greetings-text">
            <h1 style={{fontSize: "24px"}}> Hi, Pratik 👋</h1>
            <p> Welcome to your dashboard </p>
          </div>
        </div>

        <div className="quick-action">
          <h1 style={{fontSize: "24px"}}> Quick Actions</h1>
        </div>

        <div className="services-container">
          <div className="service-card">
            <img src={Calendar} style={{width: "25px", height: "25px"}} />
            <h2 style={{fontWeight: "700", marginTop: "15px"}}> Book Service </h2>
            <p> Schedule a new service</p>
          </div>
          <div className="service-card">
            <img src={Catalogue} style={{width: "25px", height: "25px"}} />
            <h2 style={{fontWeight: "700", marginTop: "15px"}}> Browse Catalogue </h2>
            <p> Find parts and price</p>
          </div>
          <div className="service-card">
            <img src={History} style={{width: "25px", height: "25px"}} />
            <h2 style={{fontWeight: "700", marginTop: "15px"}}> Service History </h2>
            <p> View Past Records</p>
          </div>
          <div className="service-card">
            <img src={Package} style={{width: "25px", height: "25px"}} />
            <h2 style={{fontWeight: "700", marginTop: "15px"}}> Packages </h2>
            <p> View service packages</p>
          </div>
        </div>

        <div className="quick-action">
          <h1 style={{fontSize: "24px"}}> Active Service Progress </h1>
          <div className="progress-container">
            {stages.map((stage, index) => {
              const isCompleted = index < currentIndex;
              const isActive = index === currentIndex;

              return (
                <div key={stage.name} className="stage">
                  <div
                    className={`progress-icon-wrapper ${
                      isCompleted ? 'progress-completed' : isActive ? 'progress-active' : 'progress-inactive'
                    }`}
                  >
                    {isCompleted ? (
                                <span className="progress-icon">&#10003;</span> 
                              ) : (
                                <span className="progress-icon">{stage.icon}</span> 
                              )}
                            </div>

                  <div className="progress-label">{stage.name}</div>
                  {index < stages.length - 1 && (
                    <div
                      className={`progress-line ${
                        index < currentIndex ? 'progress-line-completed' : 'progress-line-inactive'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </>
  );
};

export default Home;