import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGift, faCheckCircle, faClock } from '@fortawesome/free-solid-svg-icons';
import type{ Package } from '../../types/dashboardTypes';
import PayNow from '../Payment/PayNow';

interface ServicePackagesProps {
  onViewAllPackages: () => void;
  onPurchasePackage: (id: string) => void;
}

const ServicePackages: React.FC<ServicePackagesProps> = ({
  onViewAllPackages,
  onPurchasePackage
}) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isPayNowOpen, setIsPayNowOpen] = useState(false);

  // Handle Buy Now click
  const handleBuyNow = (pkg: Package) => {
    console.log('Selected package for payment:', pkg);
    setSelectedPackage(pkg);
    setIsPayNowOpen(true);
  };

  // Handle payment success
  const handlePaymentSuccess = () => {
    if (selectedPackage) {
      onPurchasePackage(selectedPackage.id);
    }
    setIsPayNowOpen(false);
    setSelectedPackage(null);
  };

  // Fetch packages data from backend
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/packages');
        if (!response.ok) {
          throw new Error('Failed to fetch packages');
        }
        const result = await response.json();
        console.log('Packages API response:', result);
        if (result.success) {
          // Filter only active packages and map _id to id
          const activePackages = result.data
            .filter((pkg: any) => pkg.isActive)
            .map((pkg: any) => ({
              ...pkg,
              id: pkg._id
            }));
          console.log('Mapped packages:', activePackages);
          setPackages(activePackages);
        }
      } catch (error) {
        console.error('Error fetching packages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  if (loading) {
    return (
      <div className="userdashboard-section packages-section">
        <div className="userdashboard-section-header">
          <h2><FontAwesomeIcon icon={faGift} /> Recommended Packages</h2>
          <button
            className="userdashboard-viewall-btn"
            onClick={onViewAllPackages}
          >
            View All
          </button>
        </div>
        <div className="loading-spinner">Loading packages...</div>
      </div>
    );
  }

  return (
    <div className="userdashboard-section packages-section">
      <div className="userdashboard-section-header">
        <h2><FontAwesomeIcon icon={faGift} /> Recommended Packages</h2>
        <button
          className="userdashboard-viewall-btn"
          onClick={onViewAllPackages}
        >
          View All
        </button>
      </div>
      <div className="userdashboard-packages">
        {packages.map(pkg => (
          <div key={pkg.id} className="userdashboard-package-card">
            <div className="userdashboard-package-header">
              <h4>{pkg.name}</h4>
              <div className="userdashboard-package-price">
                <span className="userdashboard-original-price">₹{pkg.actualPrice}</span>
                <span className="userdashboard-discounted-price">₹{pkg.discountedPrice}</span>
                <span className="userdashboard-discount-badge">
                  Save {Math.round(((pkg.actualPrice - pkg.discountedPrice) / pkg.actualPrice) * 100)}%
                </span>
              </div>
            </div>
            <div className="userdashboard-package-services">
              <ul>
                {pkg.features.map((feature, index) => (
                  <li key={index}>
                    <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#4CAF50' }} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="userdashboard-package-footer">
              <span className="userdashboard-package-validity">
                <FontAwesomeIcon icon={faClock} /> Expires in {Math.max(0, Math.ceil((new Date(pkg.purchaseDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days
              </span>
              <button
                className="userdashboard-package-btn"
                onClick={() => handleBuyNow(pkg)}
              >
                Buy Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Modal */}
      {selectedPackage && (
        <PayNow
          isOpen={isPayNowOpen}
          onClose={() => {
            setIsPayNowOpen(false);
            setSelectedPackage(null);
          }}
          paymentType="package"
          itemId={selectedPackage.id}
          amount={selectedPackage.discountedPrice}
          itemName={selectedPackage.name}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default ServicePackages;