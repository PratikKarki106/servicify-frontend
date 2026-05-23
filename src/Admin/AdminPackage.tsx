import React, { useState, useEffect } from 'react';
import './AdminPackage.css';
import Sidebar from '../components/Sidebar';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import packageService from '../services/Package';
import type{   Package, CreatePackageData } from '../services/Package';
import { appConfirm } from '../services/dialogService';

interface FormData {
  name: string;
  description: string;
  actualPrice: string;
  discountedPrice: string;
  purchaseDeadline: string;
  features: string[];
  serviceType: 'general' | 'premium' | 'detailing' | 'repair' | 'all';
  isActive: boolean;
}

const AdminPackage: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    totalPackages: 0,
    activePackages: 0,
    totalRevenue: 0,
    expiredPackages: 0
  });
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    actualPrice: '',
    discountedPrice: '',
    purchaseDeadline: '',
    features: [],
    serviceType: 'general',
    isActive: true
  });

  // Fetch packages from backend
  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await packageService.getAllPackages({
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: searchTerm || undefined
      });
      
      // Handle different response types
      if (Array.isArray(response)) {
        setPackages(response);
      } else if (response && 'packages' in response) {
        setPackages(response.packages);
      }
      
      // Fetch statistics
      await fetchStatistics();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch packages');
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch package statistics
  const fetchStatistics = async () => {
    try {
      const stats = await packageService.getPackageStatistics();
      setStatistics({
        totalPackages: stats.totalPackages || 0,
        activePackages: stats.activePackages || 0,
        totalRevenue: stats.totalRevenue || 0,
        expiredPackages: packages.filter(pkg => pkg.isExpired).length
      });
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  // Load packages on component mount and when filters change
  useEffect(() => {
    fetchPackages();
  }, [filterStatus, searchTerm]);

  // Update statistics when packages change
  useEffect(() => {
    const expiredPackages = packages.filter(pkg => pkg.isExpired).length;
    const activePackages = packages.filter(pkg => pkg.isActive && !pkg.isExpired).length;
    const totalRevenue = packages.reduce((sum, pkg) => sum + (pkg.discountedPrice * pkg.totalPurchases), 0);
    
    setStatistics(prev => ({
      ...prev,
      totalPackages: packages.length,
      activePackages,
      totalRevenue,
      expiredPackages
    }));
  }, [packages]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle feature input change
  const handleFeatureChange = (index: number, value: string) => {
    setFormData(prev => {
      const newFeatures = [...prev.features];
      newFeatures[index] = value;
      return { ...prev, features: newFeatures };
    });
  };

  // Add new feature
  const handleAddFeature = () => {
    if (formData.features.length < 5) {
      setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
    } else {
      toast.warning('Maximum 5 features allowed');
    }
  };

  // Remove feature
  const handleRemoveFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  // Open modal for creating new package
  const handleCreateNew = () => {
    setEditingPackage(null);

    // Set purchase deadline to 30 days from now by default
    const defaultDeadline = new Date();
    defaultDeadline.setDate(defaultDeadline.getDate() + 30);

    setFormData({
      name: '',
      description: '',
      actualPrice: '',
      discountedPrice: '',
      purchaseDeadline: defaultDeadline.toISOString().split('T')[0],
      features: [],
      serviceType: 'general',
      isActive: true
    });
    setShowModal(true);
  };

  // Open modal for editing package
  const handleEditPackage = (pkg: Package) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description,
      actualPrice: pkg.actualPrice.toString(),
      discountedPrice: pkg.discountedPrice.toString(),
      purchaseDeadline: new Date(pkg.purchaseDeadline).toISOString().split('T')[0],
      features: pkg.features || [],
      serviceType: pkg.serviceType,
      isActive: pkg.isActive
    });
    setShowModal(true);
  };

  // Save package (create or update)
  const handleSavePackage = async () => {
    try {
      // Validate form data
      if (!formData.name.trim()) {
        toast.error('Package name is required!');
        return;
      }

      if (!formData.description.trim()) {
        toast.error('Package description is required!');
        return;
      }

      if (!formData.actualPrice.trim() || parseInt(formData.actualPrice) < 0) {
        toast.error('Please enter a valid actual price!');
        return;
      }

      if (!formData.discountedPrice.trim() || parseInt(formData.discountedPrice) <= 0) {
        toast.error('Please enter a valid discounted price!');
        return;
      }

      if (parseInt(formData.discountedPrice) > parseInt(formData.actualPrice)) {
        toast.error('Discounted price cannot be greater than actual price!');
        return;
      }

      if (!formData.purchaseDeadline) {
        toast.error('Purchase deadline is required!');
        return;
      }

      if (formData.features.length === 0) {
        toast.error('At least one feature is required!');
        return;
      }

      // Prepare data for API
      const packageData: CreatePackageData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        actualPrice: parseInt(formData.actualPrice),
        discountedPrice: parseInt(formData.discountedPrice),
        purchaseDeadline: new Date(formData.purchaseDeadline).toISOString(),
        features: formData.features.filter(f => f.trim() !== ''),
        serviceType: formData.serviceType,
        isActive: formData.isActive
      };

      if (editingPackage) {
        // Update existing package
        await packageService.updatePackage(editingPackage._id, packageData);
        toast.success('Package updated successfully!');
      } else {
        // Create new package
        await packageService.createPackage(packageData);
        toast.success('Package created successfully!');
      }

      setShowModal(false);
      setEditingPackage(null);
      fetchPackages(); // Refresh the list
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to save package';
      toast.error(errorMessage);

      // Handle specific errors
      if (errorMessage.includes('already exists')) {
        toast.info('A package with this name already exists. Please choose a different name.');
      }
    }
  };

  // Toggle package status (activate/deactivate)
  const togglePackageStatus = async (pkg: Package) => {
    try {
      await packageService.togglePackageStatus(pkg._id, !pkg.isActive);
      toast.success(`Package ${!pkg.isActive ? 'activated' : 'deactivated'} successfully!`);
      fetchPackages(); // Refresh the list
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update package status');
    }
  };

  // Delete package
  const handleDeletePackage = async (pkg: Package) => {
    const confirmed = await appConfirm({
      title: 'Delete package',
      message: `Are you sure you want to delete "${pkg.name}"?`,
      confirmText: 'Delete package',
      variant: 'danger',
    });
    if (!confirmed) {
      return;
    }

    try {
      await packageService.deletePackage(pkg._id);
      toast.success('Package deleted successfully!');
      fetchPackages(); // Refresh the list
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to delete package';
      toast.error(errorMsg);
      
      // If package has purchases, suggest deactivating instead
      if (pkg.totalPurchases > 0) {
        toast.info('Package has existing purchases. Consider deactivating it instead.');
      }
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get status badge class
  const getStatusClass = (pkg: Package) => {
    if (!pkg.isActive) return 'inactive';
    if (pkg.isExpired) return 'expired';
    return 'active';
  };

  // Get status text
  const getStatusText = (pkg: Package) => {
    if (!pkg.isActive) return 'Inactive';
    if (pkg.isExpired) return 'Expired';
    return 'Active';
  };

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== undefined) {
        fetchPackages();
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <>
      <Sidebar />
      <div className="admin-package-main">
        {/* Header Section */}
        <div className="admin-package-header">
          <h1 className="admin-package-title">Manage Packages</h1>
          <p className="admin-package-subtitle">Create and manage service packages for users</p>
        </div>

        {/* Stats Cards */}
        <div className="admin-package-stats-grid">
          <div className="admin-package-stat-card">
            <div className="admin-package-stat-icon">📦</div>
            <div>
              <h3 className="admin-package-stat-title">Total Packages</h3>
              <p className="admin-package-stat-value">{statistics.totalPackages}</p>
            </div>
          </div>
          
          <div className="admin-package-stat-card">
            <div className="admin-package-stat-icon">✅</div>
            <div>
              <h3 className="admin-package-stat-title">Active Packages</h3>
              <p className="admin-package-stat-value">{statistics.activePackages}</p>
            </div>
          </div>
          
          <div className="admin-package-stat-card">
            <div className="admin-package-stat-icon">💰</div>
            <div>
              <h3 className="admin-package-stat-title">Total Revenue</h3>
              <p className="admin-package-stat-value">Rs. {statistics.totalRevenue?.toLocaleString('en-IN') || '0'}</p>
            </div>
          </div>
          
          <div className="admin-package-stat-card">
            <div className="admin-package-stat-icon">📅</div>
            <div>
              <h3 className="admin-package-stat-title">Expired Packages</h3>
              <p className="admin-package-stat-value">{statistics.expiredPackages}</p>
            </div>
          </div>
        </div>

        {/* Control Bar */}
        <div className="admin-package-control-bar">
          <div className="admin-package-search-box">
            <input
              type="text"
              className="admin-package-search-input"
              placeholder="Search packages by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="admin-package-search-icon">🔍</span>
          </div>
          
          <div className="admin-package-control-buttons">
            <select 
              className="admin-package-filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
            >
              <option value="all">All Packages</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
            </select>
            
            <button 
              className="admin-package-create-button"
              onClick={handleCreateNew}
            >
              <span className="admin-package-create-icon">+</span>
              Create Package
            </button>
          </div>
        </div>

        {/* Packages Table */}
        <div className="admin-package-table-container">
          {loading ? (
            <div className="admin-package-loading">
              <div className="admin-package-spinner"></div>
              <p>Loading packages...</p>
            </div>
          ) : packages.length === 0 ? (
            <div className="admin-package-empty-state">
              <div className="admin-package-empty-icon">📦</div>
              <h3 className="admin-package-empty-title">No packages found</h3>
              <p className="admin-package-empty-text">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try changing your search or filter'
                  : 'Create your first package to get started'}
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <button 
                  className="admin-package-empty-button"
                  onClick={handleCreateNew}
                >
                  Create First Package
                </button>
              )}
            </div>
          ) : (
            <div className="admin-package-table">
              {/* Table Header */}
              <div className="admin-package-table-header">
                <div className="admin-package-table-col" style={{ flex: 2 }}>Package Name</div>
                <div className="admin-package-table-col" style={{ flex: 1 }}>Actual Price</div>
                <div className="admin-package-table-col" style={{ flex: 1 }}>Discounted Price</div>
                <div className="admin-package-table-col" style={{ flex: 1.5 }}>Purchase Deadline</div>
                <div className="admin-package-table-col" style={{ flex: 1 }}>Features</div>
                <div className="admin-package-table-col" style={{ flex: 1 }}>Purchases</div>
                <div className="admin-package-table-col" style={{ flex: 1 }}>Status</div>
                <div className="admin-package-table-col" style={{ flex: 2 }}>Actions</div>
              </div>

              {/* Table Body */}
              <div className="admin-package-table-body">
                {packages.map(pkg => (
                  <div key={pkg._id} className="admin-package-table-row">
                    <div className="admin-package-table-cell" style={{ flex: 2 }}>
                      <div className="admin-package-name-wrapper">
                        <h4 className="admin-package-name">{pkg.name}</h4>
                        <p className="admin-package-description-preview">
                          {pkg.description?.substring(0, 50)}...
                        </p>
                      </div>
                    </div>

                    <div className="admin-package-table-cell" style={{ flex: 1 }}>
                      <span className="admin-package-price">Rs. {pkg.actualPrice?.toLocaleString('en-IN') || '0'}</span>
                    </div>

                    <div className="admin-package-table-cell" style={{ flex: 1 }}>
                      <span className="admin-package-price-discounted">Rs. {pkg.discountedPrice?.toLocaleString('en-IN') || '0'}</span>
                    </div>

                    <div className="admin-package-table-cell" style={{ flex: 1.5 }}>
                      <span className="admin-package-deadline">{formatDate(pkg.purchaseDeadline)}</span>
                      {pkg.isExpired && (
                        <span className="admin-package-expired-badge">Expired</span>
                      )}
                    </div>

                    <div className="admin-package-table-cell" style={{ flex: 1 }}>
                      <span className="admin-package-features-count">{pkg.features.length} features</span>
                    </div>

                    <div className="admin-package-table-cell" style={{ flex: 1 }}>
                      <span className="admin-package-purchases">{pkg.totalPurchases} buys</span>
                    </div>

                    <div className="admin-package-table-cell" style={{ flex: 1 }}>
                      <div className={`admin-package-status ${getStatusClass(pkg)}`}>
                        <span className="admin-package-status-dot"></span>
                        {getStatusText(pkg)}
                      </div>
                    </div>

                    <div className="admin-package-table-cell" style={{ flex: 2 }}>
                      <div className="admin-package-actions">
                        <button
                          className="admin-package-action-btn edit-btn"
                          onClick={() => handleEditPackage(pkg)}
                          title="Edit Package"
                        >
                          Edit
                        </button>
                        <button
                          className={`admin-package-action-btn ${pkg.isActive ? 'deactivate-btn' : 'activate-btn'}`}
                          onClick={() => togglePackageStatus(pkg)}
                          title={pkg.isActive ? 'Deactivate Package' : 'Activate Package'}
                          disabled={pkg.isExpired}
                        >
                          {pkg.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          className="admin-package-action-btn delete-btn"
                          onClick={() => handleDeletePackage(pkg)}
                          title="Delete Package"
                          disabled={pkg.totalPurchases > 0}
                        >
                          Delete
                        </button>
                      </div>
                      {pkg.totalPurchases > 0 && (
                        <small className="admin-package-delete-hint">
                          Cannot delete - has purchases
                        </small>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Create/Edit Package Modal */}
        {showModal && (
          <div className="admin-package-modal-overlay" onClick={() => setShowModal(false)}>
            <div className="admin-package-modal" onClick={(e) => e.stopPropagation()}>
              <div className="admin-package-modal-header">
                <h2 className="admin-package-modal-title">
                  {editingPackage ? 'Edit Package' : 'Create New Package'}
                </h2>
                <button 
                  className="admin-package-modal-close"
                  onClick={() => setShowModal(false)}
                >
                  &times;
                </button>
              </div>
              
              <div className="admin-package-modal-content">
                <form onSubmit={(e) => { e.preventDefault(); handleSavePackage(); }}>
                  <div className="admin-package-form-group">
                    <label className="admin-package-form-label">
                      Package Name *
                    </label>
                    <input
                      type="text"
                      className="admin-package-form-input"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Monsoon Offer - 10 Free Services"
                      required
                    />
                  </div>

                  <div className="admin-package-form-group">
                    <label className="admin-package-form-label">
                      Description *
                    </label>
                    <textarea
                      className="admin-package-form-textarea"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe this package..."
                      rows={3}
                      required
                    />
                  </div>

                  <div className="admin-package-form-row">
                    <div className="admin-package-form-group">
                      <label className="admin-package-form-label">
                        Actual Price (Rs.) *
                      </label>
                      <input
                        type="number"
                        className="admin-package-form-input"
                        name="actualPrice"
                        value={formData.actualPrice}
                        onChange={handleInputChange}
                        placeholder="5000"
                        min="0"
                        required
                      />
                    </div>

                    <div className="admin-package-form-group">
                      <label className="admin-package-form-label">
                        Discounted Price (Rs.) *
                      </label>
                      <input
                        type="number"
                        className="admin-package-form-input"
                        name="discountedPrice"
                        value={formData.discountedPrice}
                        onChange={handleInputChange}
                        placeholder="3000"
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  <div className="admin-package-form-group">
                    <label className="admin-package-form-label">
                      Purchase Deadline *
                    </label>
                    <div className="admin-package-date-picker-wrapper">
                      <input
                        type="date"
                        className="admin-package-form-input"
                        name="purchaseDeadline"
                        value={formData.purchaseDeadline}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                      <button
                        type="button"
                        className="admin-package-calendar-btn"
                        onClick={() => {
                          const dateInput = document.querySelector('input[name="purchaseDeadline"]') as HTMLInputElement;
                          if (dateInput) {
                            dateInput.showPicker();
                          }
                        }}
                        title="Open calendar"
                      >
                        📅
                      </button>
                    </div>
                    <div className="admin-package-form-hint">
                      Users can purchase until this date
                    </div>
                  </div>

                  <div className="admin-package-form-group">
                    <label className="admin-package-form-label">
                      Features (Max 5) *
                    </label>
                    <div className="admin-package-features-container">
                      {formData.features.map((feature, index) => (
                        <div key={index} className="admin-package-feature-item">
                          <input
                            type="text"
                            className="admin-package-feature-input"
                            value={feature}
                            onChange={(e) => handleFeatureChange(index, e.target.value)}
                            placeholder={`Feature ${index + 1}`}
                          />
                          <button
                            type="button"
                            className="admin-package-feature-remove"
                            onClick={() => handleRemoveFeature(index)}
                            title="Remove feature"
                          >
                            −
                          </button>
                        </div>
                      ))}
                      {formData.features.length < 5 && (
                        <button
                          type="button"
                          className="admin-package-feature-add"
                          onClick={handleAddFeature}
                        >
                          + Add Feature
                        </button>
                      )}
                    </div>
                    <div className="admin-package-form-hint">
                      {formData.features.length}/5 features added
                    </div>
                  </div>

                  <div className="admin-package-form-group">
                    <label className="admin-package-form-checkbox">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                      />
                      <span className="admin-package-checkbox-label">
                        Make this package available for purchase
                      </span>
                    </label>
                  </div>

                  <div className="admin-package-modal-buttons">
                    <button
                      type="button"
                      className="admin-package-modal-btn cancel-btn"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="admin-package-modal-btn save-btn"
                    >
                      {editingPackage ? 'Update Package' : 'Create Package'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminPackage;