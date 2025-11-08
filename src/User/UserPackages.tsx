import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faCheckCircle, faClock, faExclamationTriangle, faCalendarAlt, faCreditCard } from '@fortawesome/free-solid-svg-icons';
import { packageService } from '../services/Package';
import PayNow from './Payment/PayNow';

interface UserPackage {
  _id: string;
  packageId: string;
  packageName: string;
  totalCredits: number;
  usedCredits: number;
  remainingCredits: number;
  amount: number;
  purchasedAt: string;
  expiryDate: string;
  isActive: boolean;
  originalPackage?: {
    description?: string;
    features?: string[];
    serviceType?: string;
  };
  isTemplateActive?: boolean;
  purchaseId: string;
}

interface AvailablePackage {
  id: string;
  name: string;
  description: string;
  actualPrice: number;
  discountedPrice: number;
  purchaseDeadline: string;
  features: string[];
  serviceType: string;
  isActive: boolean;
}

const UserPackages: React.FC = () => {
  const [myPackages, setMyPackages] = useState<UserPackage[]>([]);
  const [availablePackages, setAvailablePackages] = useState<AvailablePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my-packages' | 'available'>('my-packages');
  const [selectedPackage, setSelectedPackage] = useState<AvailablePackage | null>(null);
  const [isPayNowOpen, setIsPayNowOpen] = useState(false);
  const [purchasedPackageIds, setPurchasedPackageIds] = useState<Set<string>>(new Set());

  // Fetch user's purchased packages and available packages
  const fetchData = async () => {
    try {
      setLoading(true);

      // Add small delay to ensure backend has processed the purchase
      await new Promise(resolve => setTimeout(resolve, 300));

      // Fetch user's packages
      const userPackagesResponse = await packageService.getUserPackages();
      console.log('[DEBUG] User Packages Response:', userPackagesResponse);

      let userPackages: UserPackage[] = [];
      if (Array.isArray(userPackagesResponse)) {
        userPackages = userPackagesResponse;
      } else if (userPackagesResponse && typeof userPackagesResponse === 'object' && 'data' in userPackagesResponse) {
        userPackages = (userPackagesResponse as any).data;
      }

      setMyPackages(userPackages);

      // Extract purchased package IDs (using both packageId and _id for backward compatibility)
      const purchasedIds = new Set<string>(
        userPackages
          .flatMap((pkg: UserPackage) => [pkg.packageId, pkg._id].filter(Boolean))
      );
      setPurchasedPackageIds(purchasedIds);

      // Fetch available packages using the service instead of hardcoded fetch
      const packagesResponse = await packageService.getAllPackages();
      
      let allPackages: any[] = [];
      if (Array.isArray(packagesResponse)) {
        allPackages = packagesResponse;
      } else if (packagesResponse && 'packages' in packagesResponse) {
        allPackages = packagesResponse.packages;
      }

      const activePackages = allPackages
        .filter((pkg: any) => 
          // Show if active (regardless of deadline if admin explicitly activated it)
          // OR if the user has already purchased it (so they can see it in Available tab with "Purchased" status)
          pkg.isActive || purchasedIds.has(pkg._id)
        )
        .map((pkg: any) => ({
          ...pkg,
          id: pkg._id
        }));
      
      setAvailablePackages(activePackages);
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Buy Now click
  const handleBuyNow = (pkg: AvailablePackage) => {
    setSelectedPackage(pkg);
    setIsPayNowOpen(true);
  };

  // Handle payment success
  const handlePaymentSuccess = async () => {
    setIsPayNowOpen(false);
    setSelectedPackage(null);
    await fetchData(); // Refresh packages list
    setActiveTab('my-packages'); // Switch to my packages tab
  };

  // Calculate days remaining
  const getDaysRemaining = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get status badge
  const getStatusBadge = (pkg: UserPackage) => {
    if (!pkg.isActive) {
      return { bg: '#ffebee', color: '#c62828', text: 'Expired' };
    }
    if (pkg.remainingCredits === 0) {
      return { bg: '#fff3e0', color: '#e65100', text: 'Used Up' };
    }
    const daysRemaining = getDaysRemaining(pkg.expiryDate);
    if (daysRemaining <= 7) {
      return { bg: '#fff3e0', color: '#ef6c00', text: 'Expiring Soon' };
    }
    return { bg: '#e8f5e9', color: '#2e7d32', text: 'Active' };
  };

  if (loading) {
    return (
      <div className="user-packages-container" style={styles.container}>
        <div style={styles.loading}>Loading packages...</div>
      </div>
    );
  }

  return (
    <div className="user-packages-container" style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}><FontAwesomeIcon icon={faBox} /> My Packages</h2>
        <p style={styles.subtitle}>View and manage your purchased packages</p>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'my-packages' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('my-packages')}
        >
          My Packages ({myPackages.length})
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'available' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('available')}
        >
          Available Packages ({availablePackages.length})
        </button>
      </div>

      {/* My Packages Tab */}
      {activeTab === 'my-packages' && (
        <div style={styles.content}>
          {myPackages.length === 0 ? (
            <div style={styles.emptyState}>
              <FontAwesomeIcon icon={faBox} size="3x" style={{ color: '#ccc', marginBottom: '16px' }} />
              <h3 style={styles.emptyTitle}>No Packages Yet</h3>
              <p style={styles.emptyText}>You haven't purchased any packages yet.</p>
              <button
                style={styles.browseButton}
                onClick={() => setActiveTab('available')}
              >
                Browse Available Packages
              </button>
            </div>
          ) : (
            <div style={styles.packagesGrid}>
              {myPackages.map((pkg) => {
                const status = getStatusBadge(pkg);
                const daysRemaining = getDaysRemaining(pkg.expiryDate);
                const usagePercent = (pkg.usedCredits / pkg.totalCredits) * 100;

                return (
                  <div key={pkg._id} style={styles.packageCard}>
                    {/* Status Badges */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                      <div style={{ ...styles.statusBadge, backgroundColor: status.bg, color: status.color, marginBottom: 0 }}>
                        <FontAwesomeIcon icon={pkg.isActive ? faCheckCircle : faExclamationTriangle} />
                        {' '}{status.text}
                      </div>
                      {pkg.isTemplateActive === false && (
                        <div style={{ ...styles.statusBadge, backgroundColor: '#f5f5f5', color: '#616161', marginBottom: 0 }}>
                          No longer available
                        </div>
                      )}
                    </div>

                    {/* Package Info */}
                    <div style={styles.packageInfo}>
                      <h3 style={styles.packageName}>{pkg.packageName}</h3>
                      {pkg.originalPackage?.description && (
                        <p style={styles.packageDescription}>{pkg.originalPackage.description}</p>
                      )}
                      <div style={styles.packageDetails}>
                        <div style={styles.detailItem}>
                          <FontAwesomeIcon icon={faCreditCard} style={{ marginRight: '8px' }} />
                          <span>Rs. {pkg.amount.toLocaleString('en-IN')}</span>
                        </div>
                        <div style={styles.detailItem}>
                          <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '8px' }} />
                          <span>Purchased: {formatDate(pkg.purchasedAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Features if available */}
                    {pkg.originalPackage?.features && pkg.originalPackage.features.length > 0 && (
                      <div style={styles.featuresSection}>
                        <h4 style={styles.featuresTitle}>Package Features:</h4>
                        <ul style={styles.featuresList}>
                          {pkg.originalPackage.features.map((feature, index) => (
                            <li key={index} style={styles.featureItem}>
                              <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#4CAF50', marginRight: '8px' }} />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Credits Progress */}
                    <div style={styles.creditsSection}>
                      <div style={styles.creditsHeader}>
                        <span style={styles.creditsLabel}>Credits</span>
                        <span style={styles.creditsValue}>
                          {pkg.remainingCredits} / {pkg.totalCredits}
                        </span>
                      </div>
                      <div style={styles.progressBar}>
                        <div
                          style={{
                            ...styles.progressFill,
                            width: `${usagePercent}%`,
                            backgroundColor: usagePercent >= 75 ? '#f44336' : usagePercent >= 50 ? '#ff9800' : '#4caf50'
                          }}
                        />
                      </div>
                      <div style={styles.creditsFooter}>
                        <span style={styles.usedCredits}>Used: {pkg.usedCredits}</span>
                        <span style={styles.remainingCredits}>Remaining: {pkg.remainingCredits}</span>
                      </div>
                    </div>

                    {/* Expiry */}
                    <div style={styles.expirySection}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <FontAwesomeIcon icon={faClock} style={{ marginRight: '8px' }} />
                          <span>
                            {pkg.isActive
                              ? `${daysRemaining} days remaining (Expires: ${formatDate(pkg.expiryDate)})`
                              : `Expired on ${formatDate(pkg.expiryDate)}`
                            }
                          </span>
                        </div>
                        {pkg.isTemplateActive === false && (
                          <div style={{ fontSize: '12px', color: '#f57c00', marginTop: '4px' }}>
                            Note: This package template has been deactivated by the administrator.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Available Packages Tab */}
      {activeTab === 'available' && (
        <div style={styles.content}>
          {availablePackages.length === 0 ? (
            <div style={styles.emptyState}>
              <FontAwesomeIcon icon={faBox} size="3x" style={{ color: '#ccc', marginBottom: '16px' }} />
              <h3 style={styles.emptyTitle}>No Available Packages</h3>
              <p style={styles.emptyText}>Check back later for new package offers!</p>
            </div>
          ) : (
            <div style={styles.packagesGrid}>
              {availablePackages.map((pkg) => {
                const daysUntilDeadline = Math.ceil(
                  (new Date(pkg.purchaseDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );
                const isAlreadyPurchased = purchasedPackageIds.has(pkg.id);

                return (
                  <div key={pkg.id} style={styles.availableCard}>
                    <div style={styles.availableHeader}>
                      <h3 style={styles.availableName}>{pkg.name}</h3>
                      {isAlreadyPurchased && (
                        <div style={styles.alreadyPurchasedBadge}>
                          <FontAwesomeIcon icon={faCheckCircle} /> Already Purchased
                        </div>
                      )}
                      {!isAlreadyPurchased && (
                        <div style={styles.priceSection}>
                          <span style={styles.originalPrice}>Rs. {pkg.actualPrice.toLocaleString('en-IN')}</span>
                          <span style={styles.discountedPrice}>Rs. {pkg.discountedPrice.toLocaleString('en-IN')}</span>
                          <span style={styles.discountBadge}>
                            Save {Math.round(((pkg.actualPrice - pkg.discountedPrice) / pkg.actualPrice) * 100)}%
                          </span>
                        </div>
                      )}
                    </div>

                    <p style={styles.availableDescription}>{pkg.description}</p>

                    {!isAlreadyPurchased && (
                      <ul style={styles.featuresList}>
                        {pkg.features.map((feature, index) => (
                          <li key={index} style={styles.featureItem}>
                            <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#4CAF50', marginRight: '8px' }} />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}

                    {isAlreadyPurchased ? (
                      <div style={styles.alreadyPurchasedMessage}>
                        <FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: '8px' }} />
                        You have already purchased this package
                      </div>
                    ) : (
                      <div style={styles.availableFooter}>
                        <div style={styles.deadline}>
                          <FontAwesomeIcon icon={faClock} style={{ marginRight: '8px' }} />
                          <span>
                            {daysUntilDeadline > 0
                              ? `${daysUntilDeadline} days left to purchase`
                              : 'Deadline passed'}
                          </span>
                        </div>
                        <button
                          style={{
                            ...styles.buyButton,
                            ...(daysUntilDeadline <= 0 ? styles.buyButtonDisabled : {})
                          }}
                          onClick={() => handleBuyNow(pkg)}
                          disabled={daysUntilDeadline <= 0}
                        >
                          Buy Now
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

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

// Styles
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  header: {
    marginBottom: '24px'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  subtitle: {
    fontSize: '14px',
    color: '#666'
  },
  tabs: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    borderBottom: '2px solid #e0e0e0',
    paddingBottom: '8px'
  },
  tab: {
    padding: '12px 24px',
    border: 'none',
    background: 'transparent',
    fontSize: '15px',
    fontWeight: '500',
    color: '#666',
    cursor: 'pointer',
    borderRadius: '8px 8px 0 0',
    transition: 'all 0.2s'
  },
  activeTab: {
    backgroundColor: '#f5f5f5',
    color: '#1a1a1a',
    borderBottom: '2px solid #4CAF50'
  },
  content: {
    minHeight: '400px'
  },
  loading: {
    textAlign: 'center',
    padding: '48px',
    color: '#666'
  },
  emptyState: {
    textAlign: 'center',
    padding: '64px 24px'
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '8px'
  },
  emptyText: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '24px'
  },
  browseButton: {
    padding: '12px 24px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  packagesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px'
  },
  packageCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '1px solid #e0e0e0'
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '500',
    marginBottom: '16px'
  },
  packageInfo: {
    marginBottom: '20px'
  },
  packageName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '8px'
  },
  packageDescription: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '16px',
    lineHeight: '1.4'
  },
  packageDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    color: '#666'
  },
  creditsSection: {
    marginBottom: '20px'
  },
  creditsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px'
  },
  creditsLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333'
  },
  creditsValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1a1a'
  },
  progressBar: {
    width: '100%',
    height: '8px',
    backgroundColor: '#e0e0e0',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '8px'
  },
  progressFill: {
    height: '100%',
    transition: 'width 0.3s ease'
  },
  creditsFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px'
  },
  usedCredits: {
    color: '#666'
  },
  remainingCredits: {
    color: '#4CAF50',
    fontWeight: '500'
  },
  featuresSection: {
    marginBottom: '20px',
    padding: '16px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px'
  },
  featuresTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '10px'
  },
  expirySection: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '13px',
    color: '#666',
    paddingTop: '16px',
    borderTop: '1px solid #e0e0e0'
  },
  availableCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '1px solid #e0e0e0',
    display: 'flex',
    flexDirection: 'column'
  },
  availableHeader: {
    marginBottom: '16px'
  },
  availableName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '12px'
  },
  priceSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  originalPrice: {
    fontSize: '15px',
    color: '#999',
    textDecoration: 'line-through'
  },
  discountedPrice: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#4CAF50'
  },
  discountBadge: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500'
  },
  availableDescription: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '16px',
    lineHeight: '1.5'
  },
  featuresList: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 16px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1
  },
  featureItem: {
    display: 'flex',
    alignItems: 'flex-start',
    fontSize: '14px',
    color: '#333'
  },
  availableFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '16px',
    borderTop: '1px solid #e0e0e0'
  },
  deadline: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '13px',
    color: '#666'
  },
  buyButton: {
    padding: '10px 24px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  buyButtonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed'
  },
  alreadyPurchasedBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '500'
  },
  alreadyPurchasedMessage: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    textAlign: 'center',
    justifyContent: 'center'
  }
};

export default UserPackages;
