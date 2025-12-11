import Bike from "../assets/Bike.png"
import Cancel from "../assets/Cancel.png";
import { useState } from 'react';
import Servicing from "../assets/servicing.png";
import Repair from "../assets/repair.png";
import Checkup from "../assets/check-list.png";
import Wash from "../assets/motorcycle.png";
import "./UserBookTop.css"

const UserBookTop = () => {
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [active, setActive] = useState<string>("Servicing");

    const services = [
        { name: "Servicing", icon: Servicing },
        { name: "Repair", icon: Repair },
        { name: "Check up", icon: Checkup },
        { name: "Wash", icon: Wash },
    ];

    const getStepStatus = (step: number) => {
        if (step < currentStep) return "completed";
        if (step === currentStep) return "current";
        return "upcoming";
    };

    const goToStep = (step: number) => {
        setCurrentStep(step);
    };
  return (
    <>
      <div className="beginning">
          <div className="beginning-top">
              <div className="beginning-vehicle">
                  <img src={Bike} alt="Bike Icon" style={{width: "36px"}}/>
                  <p style={{fontWeight: "700", fontSize: "24px" }}> Servicify</p>
              </div>

              <button>
                  <img src={Cancel} alt="Cancel Icon" className="Cancel-button"/>
              </button>
          </div>       
      </div>
      <div className="middle">
          <div className="options">
              <p style={{fontWeight: "700", fontSize: "20px", marginTop: "-15px" }}>Book a Service</p>
          </div>
          <div className='options-button'>
              {services.map((service) => (
                  <button
                      key={service.name}
                      className={active === service.name ? "active" : "inactive"}
                      onClick={() => setActive(service.name)}
                      >
                      <img src={service.icon} alt={service.name} style={{width: "20px", height: "20px"}}/>
                      <p style={{fontSize: "14px", fontWeight:"700"}}>{service.name}</p>
                  </button>
              ))}
          </div>
          <div className="flow">
            <div className="flow1">
              <p className="OneFlow"> 1 </p>
              <p className="OneFlow-Label"> Vehicle Info</p>
            </div>
            <p style={{color: "#cacaca", fontWeight: "800", marginTop: "-4px"}}>_______________________</p>
            <div className="flow2">
              <p className="OneFlow"> 2 </p>
              <p className="OneFlow-Label1"> Time</p>
            </div>
            <p style={{color: "#cacaca", fontWeight: "800", marginTop: "-4px"}}>_______________________</p>
            <div className="flow3">
              <p className="OneFlow"> 3 </p>
              <p className="OneFlow-Label">User Info</p>
            </div>
          </div>
      </div>
    </>
  )
}

export default UserBookTop
