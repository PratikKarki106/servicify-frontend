import React, { useState, useEffect } from "react";
import "./Home.css";
import HomeNav from "../components/HomeNav";
import User from "../assets/user.png";
import Calendar from "../assets/calendar.png";
import History from "../assets/history.png";
import Package1 from "../assets/package.png";
import Catalogue from "../assets/catalogue.png";
import Circle from "../components/Circle";
import Contact from "../components/Contact";
import { useNavigate } from "react-router-dom";
import { packageService } from "../services/Package";
import type { Package } from "../services/Package";

type Status = 'Pending' | 'Confirmed' | 'In Progress' | 'Pickup' | 'Completed';

interface Props {
  currentStatus: Status;
}

const stages: { name: Status; icon: string }[] = [
  {name: 'Pending', icon: '⏳'}, 
  {name: 'Confirmed', icon: '✅'}, 
  {name: 'In Progress', icon: '🔧'}, 
  {name: 'Pickup', icon: '🚚'}, 
  {name: 'Completed', icon: '🎉'}
];

const Home: React.FC<Props> = ({ currentStatus }) => {
  const currentIndex = stages.findIndex(stage => stage.name === currentStatus);
  const navigate = useNavigate();
  const [offers, setOffers] = useState<Package[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Fetch packages on component mount
  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch all packages from backend
      const response = await packageService.getAllPackages();
      
      // Handle different response structures
      let packagesData: Package[] = [];
      
      // Check if response is an array first
      if (Array.isArray(response)) {
        packagesData = response;
      } 
      // Check if response is an object with packages property
      else if (response && typeof response === 'object' && response !== null) {
        const respObj = response as Record<string, any>;
        
        // Check for 'packages' property
        if ('packages' in respObj && Array.isArray(respObj.packages)) {
          packagesData = respObj.packages;
        }
        // Check for 'data' property (array)
        else if ('data' in respObj && Array.isArray(respObj.data)) {
          packagesData = respObj.data;
        }
        // Check for nested structure: { data: { packages: [...] } }
        else if ('data' in respObj && respObj.data && typeof respObj.data === 'object') {
          const dataObj = respObj.data as Record<string, any>;
          if ('packages' in dataObj && Array.isArray(dataObj.packages)) {
            packagesData = dataObj.packages;
          }
        }
      }
      
      // Filter to only show active and not expired packages
      const availablePackages = packagesData.filter(pkg => 
        pkg.isActive && 
        new Date(pkg.purchaseDeadline) > new Date()
      );
      
      setOffers(availablePackages);
      
    } catch (error: any) {
      console.error('Error fetching packages:', error);
      setError('Failed to load offers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format price with Rs symbol
  const formatPrice = (price: number) => {
    return `Rs ${price.toLocaleString('en-IN')}`;
  };

  // Calculate days remaining until expiry
  const getDaysRemaining = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Expired';
    if (diffDays === 1) return '1 day';
    return `${diffDays} days`;
  };

  // Get first benefit as preview
  const getFirstBenefit = (benefits: string[]) => {
    if (!benefits || benefits.length === 0) return 'No benefits listed';
    return benefits[0];
  };

  // Handle details button click
  const handleDetailsClick = (packageId: string) => {
    // Navigate to package details page
    navigate(`/package/${packageId}`);
  };

  // Handle purchase button click
  const handlePurchaseClick = async (packageId: string, packageName: string) => {
    if (window.confirm(`Are you sure you want to purchase "${packageName}"?`)) {
      try {
        await packageService.purchasePackage(packageId);
        alert('Package purchased successfully!');
        // Refresh offers
        fetchPackages();
      } catch (error: any) {
        console.error('Purchase error:', error);
        alert(error.response?.data?.message || 'Failed to purchase package');
      }
    }
  };

  return (
    <>
      <HomeNav />
      <div className="home-main-container">
        <div className="greetings-container">
          <img src={User} style={{width: "120px", height: "120px", borderRadius: "60px"}} alt="User" />
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
              <img src={Calendar} style={{width: "25px", height: "25px"}} alt="Calendar" />
              <h3 style={{ marginTop: "15px", marginRight: "42px"}}> Book Service </h3>
              <p> Schedule a new service</p>
            </button>
          </div>
          <div className="service-card">
            <button onClick={() => navigate('/catalog')}>
              <img src={Catalogue} style={{width: "25px", height: "25px"}} alt="Catalogue" />
              <h3 style={{ marginTop: "15px"}}>Browse Catalog</h3>
              <p style={{marginRight: "10px"}}>Find parts and price</p>
            </button>
          </div>
          <div className="service-card">
            <button>
              <img src={History} style={{width: "25px", height: "25px"}} alt="History" />
              <h3 style={{ marginTop: "15px"}}> Service History </h3>
              <p style={{ marginRight: "20px"}}> View Past Records</p>
            </button>
          </div>
          <div className="service-card">
            <button>
              <img src={Package1} style={{width: "25px", height: "25px"}} alt="Package" />
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
          
          {loading ? (
            <div className="loading-state">
              <p>Loading offers...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p className="error-text">{error}</p>
              <button 
                onClick={fetchPackages}
                className="retry-button"
              >
                Retry
              </button>
            </div>
          ) : offers.length === 0 ? (
            <div className="empty-state">
              <p>No offers available at the moment. Check back soon!</p>
            </div>
          ) : (
            <div className="offers">
              <table className="offers-table">
                <thead>
                  <tr>
                    <th>Package Name</th>
                    <th>Price</th>
                    <th>Benefit</th>
                    <th>Services</th>
                    <th>Expires In</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {offers.map((offer) => (
                    <tr key={offer._id}>
                      <td>
                        <div className="package-name-cell">
                          <strong>{offer.name}</strong>
                          {offer.serviceType !== 'general' && (
                            <span className="package-badge">{offer.serviceType}</span>
                          )}
                        </div>
                      </td>
                      <td className="price-cell">
                        {formatPrice(offer.price)}
                      </td>
                      <td className="benefit-cell">
                        {getFirstBenefit(offer.benefits)}
                      </td>
                      <td className="services-cell">
                        {offer.serviceCount} service{offer.serviceCount !== 1 ? 's' : ''}
                      </td>
                      <td className="expiry-cell">
                        <span className={`expiry-badge ${getDaysRemaining(offer.purchaseDeadline) === 'Expired' ? 'expired' : ''}`}>
                          {getDaysRemaining(offer.purchaseDeadline)}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="button details-btn"
                            onClick={() => handleDetailsClick(offer._id)}
                          >
                            Details
                          </button>
                          <button 
                            className="button purchase-btn"
                            onClick={() => handlePurchaseClick(offer._id, offer.name)}
                          >
                            Buy
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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