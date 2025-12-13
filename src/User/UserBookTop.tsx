import Bike from "../assets/Bike.png"
import Cancel from "../assets/Cancel.png";
import Servicing from "../assets/servicing.png";
import Repair from "../assets/repair.png";
import Checkup from "../assets/check-list.png";
import Wash from "../assets/motorcycle.png";
import "./UserBookTop.css"

interface UserBookTopProps {
  currentStep: number;
  selectedService: string;
  onServiceChange: (service: string) => void;
}

const UserBookTop: React.FC<UserBookTopProps> = ({ 
  currentStep, 
  selectedService, 
  onServiceChange 
}) => {
    const services = [
        { name: "Servicing", icon: Servicing },
        { name: "Repair", icon: Repair },
        { name: "Check up", icon: Checkup },
        { name: "Wash", icon: Wash },
    ];

    const handleServiceClick = (serviceName: string) => {
        onServiceChange(serviceName);
    };

    const getStepClass = (stepNumber: number) => {
        if (currentStep > stepNumber) {
            return "completed-step";
        } else if (currentStep === stepNumber) {
            return "current-step";
        } else {
            return "upcoming-step";
        }
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
                      className={selectedService === service.name ? "active" : "inactive"}
                      onClick={() => handleServiceClick(service.name)}
                      >
                      <img src={service.icon} alt={service.name} style={{width: "20px", height: "20px"}}/>
                      <p style={{fontSize: "14px", fontWeight:"700"}}>{service.name}</p>
                  </button>
              ))}
          </div>
          <div className="flow">
            <div className="flow-step">
              <p className={`step-circle ${getStepClass(1)}`}>1</p>
              <p className="step-label">Vehicle Info</p>
            </div>
            <div className="progress-line-container">
              <div className={`progress-line ${currentStep > 1 ? 'completed' : ''}`}></div>
            </div>
            <div className="flow-step">
              <p className={`step-circle ${getStepClass(2)}`}>2</p>
              <p className="step-label">Time</p>
            </div>
            <div className="progress-line-container">
              <div className={`progress-line ${currentStep > 2 ? 'completed' : ''}`}></div>
            </div>
            <div className="flow-step">
              <p className={`step-circle ${getStepClass(3)}`}>3</p>
              <p className="step-label">User Info</p>
            </div>
          </div>
      </div>
    </>
  )
}

export default UserBookTop;