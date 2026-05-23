import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGift, faCheckCircle, faClock } from '@fortawesome/free-solid-svg-icons';
import type{ Package } from '../../types/dashboardTypes';
import PayNow from '../Payment/PayNow';
import { packageService } from '../../services/Package';

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
  const [purchasedPackageIds, setPurchasedPackageIds] = useState<Set<string>>(new Set());

  // Handle Buy Now click
  const handleBuyNow = (pkg: Package) => {
    console.log('Selected package for payment:', pkg);
    setSelectedPackage(pkg);
    setIsPayNowOpen(true);
  };

  // Handle payment success
  const handlePaymentSuccess = async () => {
    if (selectedPackage) {
      onPurchasePackage(selectedPackage.id);
    }
    setIsPayNowOpen(false);
    setSelectedPackage(null);
    // Refresh data after purchase
    await fetchData();
  };

  // Fetch packages data from backend
  const fetchData = async () => {
    try {
      setLoading(true);

      // Add small delay to ensure backend has processed the purchase
      await new Promise(resolve => setTimeout(resolve, 300));

      // Fetch user's purchased packages
      const userPackagesResponse = await packageService.getUserPackages();
      let userPackages: any[] = [];
      if (Array.isArray(userPackagesResponse)) {
        userPackages = userPackagesResponse;
      } else if (userPackagesResponse && typeof userPackagesResponse === 'object' && 'data' in userPackagesResponse) {
        userPackages = (userPackagesResponse as any).data;
      }

      // Extract purchased package IDs
      const purchasedIds = new Set<string>(
        userPackages
          .flatMap((pkg: any) => [pkg.packageId, pkg._id].filter(Boolean))
      );
      setPurchasedPackageIds(purchasedIds);

      // Fetch available packages
      const response = await fetch('http://localhost:5000/api/packages');
      if (!response.ok) {
        throw new Error('Failed to fetch packages');
      }
      const result = await response.json();
      console.log('Packages API response:', result);
      if (result.success) {
        // Show active packages OR packages user has already purchased (even if deactivated)
        const activePackages = result.data
          .filter((pkg: any) => pkg.isActive || purchasedIds.has(pkg._id))
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

  useEffect(() => {
    fetchData();
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
        {packages.map(pkg => {
          const isAlreadyPurchased = purchasedPackageIds.has(pkg.id);
          const isDeactivated = !pkg.isActive;
          return (
            <div key={pkg.id} className="userdashboard-package-card" style={{
              opacity: isDeactivated && !isAlreadyPurchased ? 0.6 : 1
            }}>
              <div className="userdashboard-package-header">
                <h4>{pkg.name}</h4>
                {isAlreadyPurchased ? (
                  <div>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: '#e8f5e9',
                      color: '#2e7d32',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: '500',
                      marginBottom: isDeactivated ? '8px' : '0'
                    }}>
                      <FontAwesomeIcon icon={faCheckCircle} /> Already Purchased
                    </div>
                    {isDeactivated && (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#f5f5f5',
                        color: '#616161',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500',
                        marginLeft: '8px'
                      }}>
                        No longer available
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="userdashboard-package-price">
                    <span className="userdashboard-original-price">₹{pkg.actualPrice}</span>
                    <span className="userdashboard-discounted-price">₹{pkg.discountedPrice}</span>
                    <span className="userdashboard-discount-badge">
                      Save {Math.round(((pkg.actualPrice - pkg.discountedPrice) / pkg.actualPrice) * 100)}%
                    </span>
                  </div>
                )}
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
                {!isAlreadyPurchased && !isDeactivated && (
                  <button
                    className="userdashboard-package-btn"
                    onClick={() => handleBuyNow(pkg)}
                  >
                    Buy Now
                  </button>
                )}
              </div>
            </div>
          );
        })}
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