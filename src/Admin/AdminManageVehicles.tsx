import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCar,
  faCheck,
  faTimes,
  faSearch,
  faEye,
  faChevronLeft,
  faChevronRight,
  faUser,
  faEnvelope,
  faPhone,
  faImage,
  faExchangeAlt
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import { getVehiclesByStatus, verifyVehicle, rejectVehicle, updateVehicleStatus, type Vehicle } from '../services/vehicleService';
import { appConfirm } from '../services/dialogService';
import './AdminManageVehicles.css';

const AdminManageVehicles: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'verified' | 'rejected'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showStatusChangeModal, setShowStatusChangeModal] = useState(false);
  const [newStatus, setNewStatus] = useState<'pending' | 'verified' | 'rejected'>('pending');
  const [statusChangeReason, setStatusChangeReason] = useState('');
  const [statusChangeLoading, setStatusChangeLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const vehiclesPerPage = 10;

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await getVehiclesByStatus(statusFilter);
      setVehicles(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [statusFilter]);

  const handleViewDetails = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowModal(true);
  };

  const handleImageClick = (imageUrl: string) => {
    setFullscreenImage(imageUrl);
  };

  const handleVerify = async (vehicleId: string) => {
    const shouldVerify = await appConfirm({
      title: 'Verify vehicle',
      message: 'Are you sure you want to verify this vehicle?',
      confirmText: 'Verify',
      variant: 'success',
    });
    if (!shouldVerify) return;

    const success = await verifyVehicle(vehicleId);
    if (success) {
      fetchVehicles();
    }
  };

  const handleRejectClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowRejectModal(true);
    setRejectionReason('');
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    if (selectedVehicle) {
      const success = await rejectVehicle(selectedVehicle._id, rejectionReason);
      if (success) {
        setShowRejectModal(false);
        setRejectionReason('');
        setSelectedVehicle(null);
        fetchVehicles();
      }
    }
  };

  const handleChangeStatusClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setNewStatus(vehicle.status);
    setStatusChangeReason('');
    setShowStatusChangeModal(true);
  };

  const handleStatusChangeSubmit = async () => {
    if (!selectedVehicle) return;

    if (newStatus === selectedVehicle.status) {
      toast.info('No changes made');
      setShowStatusChangeModal(false);
      return;
    }

    if (newStatus === 'rejected' && !statusChangeReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setStatusChangeLoading(true);
    try {
      const success = await updateVehicleStatus(
        selectedVehicle._id,
        newStatus,
        statusChangeReason
      );

      if (success) {
        setShowStatusChangeModal(false);
        setStatusChangeReason('');
        setSelectedVehicle(null);
        fetchVehicles();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update vehicle status');
    } finally {
      setStatusChangeLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      vehicle.name.toLowerCase().includes(search) ||
      vehicle.plateNumber.toLowerCase().includes(search) ||
      vehicle.userDetails?.name.toLowerCase().includes(search) ||
      vehicle.userDetails?.email.toLowerCase().includes(search)
    );
  });

  const indexOfLastVehicle = currentPage * vehiclesPerPage;
  const indexOfFirstVehicle = indexOfLastVehicle - vehiclesPerPage;
  const currentVehicles = filteredVehicles.slice(indexOfFirstVehicle, indexOfLastVehicle);
  const totalPages = Math.ceil(filteredVehicles.length / vehiclesPerPage);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="admin-manage-vehicle-status-badge pending">Pending</span>;
      case 'verified':
        return <span className="admin-manage-vehicle-status-badge verified">Verified</span>;
      case 'rejected':
        return <span className="admin-manage-vehicle-status-badge rejected">Rejected</span>;
      default:
        return null;
    }
  };

  return (
    <div className="admin-manage-vehicles">
      <Sidebar />
      <div className="admin-vehicles-container">
        <div className="admin-manage-vehicle-header">
          <h1><FontAwesomeIcon icon={faCar} /> Manage Vehicles</h1>
          <p>Review and verify vehicles added by customers</p>
        </div>

        {/* Status Filter Tabs */}
        <div className="admin-manage-vehicle-status-tabs">
          <button
            className={`admin-manage-vehicle-status-tab ${statusFilter === 'pending' ? 'active' : ''}`}
            onClick={() => { setStatusFilter('pending'); setCurrentPage(1); }}
          >
            <FontAwesomeIcon icon={faEye} /> Pending ({vehicles.filter(v => v.status === 'pending').length})
          </button>
          <button
            className={`admin-manage-vehicle-status-tab ${statusFilter === 'verified' ? 'active' : ''}`}
            onClick={() => { setStatusFilter('verified'); setCurrentPage(1); }}
          >
            <FontAwesomeIcon icon={faCheck} /> Verified
          </button>
          <button
            className={`admin-manage-vehicle-status-tab ${statusFilter === 'rejected' ? 'active' : ''}`}
            onClick={() => { setStatusFilter('rejected'); setCurrentPage(1); }}
          >
            <FontAwesomeIcon icon={faTimes} /> Rejected
          </button>
        </div>

        {/* Search Bar */}
        <div className="admin-manage-vehicle-search">
          <FontAwesomeIcon icon={faSearch} className="admin-manage-vehicle-search-icon" />
          <input
            type="text"
            placeholder="Search by vehicle name, plate number, or customer..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>

        {/* Vehicles Table */}
        <div className="admin-manage-vehicle-table-container">
          {loading ? (
            <div className="admin-manage-vehicle-loading">Loading vehicles...</div>
          ) : currentVehicles.length === 0 ? (
            <div className="admin-manage-vehicle-empty-state">
              <FontAwesomeIcon icon={faCar} className="admin-manage-vehicle-empty-icon" />
              <p>No vehicles found</p>
            </div>
          ) : (
            <table className="admin-manage-vehicle-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Vehicle</th>
                  <th>Plate Number</th>
                  <th>Images</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentVehicles.map((vehicle) => (
                  <tr key={vehicle._id}>
                    <td>
                      <div className="admin-manage-vehicle-customer-info">
                        {vehicle.userDetails?.profilePicture ? (
                          <img
                            src={vehicle.userDetails.profilePicture}
                            alt={vehicle.userDetails.name}
                            className="admin-manage-vehicle-customer-avatar"
                          />
                        ) : (
                          <div className="admin-manage-vehicle-customer-avatar-placeholder">
                            <FontAwesomeIcon icon={faUser} />
                          </div>
                        )}
                        <span className="admin-manage-vehicle-customer-name">{vehicle.userDetails?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="admin-manage-vehicle-contact-info">
                        <div className="admin-manage-vehicle-contact-item">
                          <FontAwesomeIcon icon={faEnvelope} />
                          <span>{vehicle.userDetails?.email || 'N/A'}</span>
                        </div>
                        <div className="admin-manage-vehicle-contact-item">
                          <FontAwesomeIcon icon={faPhone} />
                          <span>{vehicle.userDetails?.phone || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="admin-manage-vehicle-info">
                        <strong>{vehicle.name}</strong>
                        <span>{vehicle.color} • {vehicle.version}</span>
                      </div>
                    </td>
                    <td>
                      <span className="admin-manage-vehicle-plate-number">{vehicle.plateNumber}</span>
                    </td>
                    <td>
                      <div className="admin-manage-vehicle-image-links">
                        {vehicle.bluebookImageUrl && (
                          <button
                            className="admin-manage-vehicle-view-image-btn"
                            onClick={() => handleViewDetails(vehicle)}
                            title="View Bluebook"
                          >
                            <FontAwesomeIcon icon={faImage} /> Bluebook
                          </button>
                        )}
                        {vehicle.vehicleImageUrl && (
                          <button
                            className="admin-manage-vehicle-view-image-btn"
                            onClick={() => handleViewDetails(vehicle)}
                            title="View Vehicle"
                          >
                            <FontAwesomeIcon icon={faCar} /> Vehicle
                          </button>
                        )}
                        {!vehicle.bluebookImageUrl && !vehicle.vehicleImageUrl && (
                          <span className="admin-manage-vehicle-no-image">No Images</span>
                        )}
                      </div>
                    </td>
                    <td>
                      {getStatusBadge(vehicle.status)}
                    </td>
                    <td>
                      <div className="admin-manage-vehicle-action-buttons">
                        {vehicle.status === 'pending' && (
                          <>
                            <button
                              className="admin-manage-vehicle-action-btn admin-manage-vehicle-verify-btn"
                              onClick={() => handleVerify(vehicle._id)}
                              title="Verify Vehicle"
                            >
                              <FontAwesomeIcon icon={faCheck} /> Verify
                            </button>
                            <button
                              className="admin-manage-vehicle-action-btn admin-manage-vehicle-reject-btn"
                              onClick={() => handleRejectClick(vehicle)}
                              title="Reject Vehicle"
                            >
                              <FontAwesomeIcon icon={faTimes} /> Reject
                            </button>
                          </>
                        )}
                        <button
                          className="admin-manage-vehicle-action-btn admin-manage-vehicle-view-btn"
                          onClick={() => handleViewDetails(vehicle)}
                          title="View Details"
                        >
                          <FontAwesomeIcon icon={faEye} /> View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="admin-manage-vehicle-pagination">
            <button
              className="admin-manage-vehicle-pagination-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              <FontAwesomeIcon icon={faChevronLeft} /> Previous
            </button>
            <span className="admin-manage-vehicle-pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="admin-manage-vehicle-pagination-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        )}
      </div>

      {/* View Vehicle Details Modal */}
      {showModal && selectedVehicle && (
        <div className="admin-manage-vehicle-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-manage-vehicle-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-manage-vehicle-modal-header">
              <h2>Vehicle Details</h2>
              <button className="admin-manage-vehicle-modal-close" onClick={() => setShowModal(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="admin-manage-vehicle-modal-body">
              <div className="admin-manage-vehicle-detail-section">
                <h3>Customer Information</h3>
                <div className="admin-manage-vehicle-detail-grid">
                  <div className="admin-manage-vehicle-detail-item">
                    <label>Name</label>
                    <span>{selectedVehicle.userDetails?.name || 'Unknown'}</span>
                  </div>
                  <div className="admin-manage-vehicle-detail-item">
                    <label>Email</label>
                    <span>{selectedVehicle.userDetails?.email || 'N/A'}</span>
                  </div>
                  <div className="admin-manage-vehicle-detail-item">
                    <label>Phone</label>
                    <span>{selectedVehicle.userDetails?.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="admin-manage-vehicle-detail-section">
                <h3>Vehicle Information</h3>
                <div className="admin-manage-vehicle-detail-grid">
                  <div className="admin-manage-vehicle-detail-item">
                    <label>Vehicle Name</label>
                    <span>{selectedVehicle.name}</span>
                  </div>
                  <div className="admin-manage-vehicle-detail-item">
                    <label>Color</label>
                    <span>{selectedVehicle.color}</span>
                  </div>
                  <div className="admin-manage-vehicle-detail-item">
                    <label>Version/Model</label>
                    <span>{selectedVehicle.version}</span>
                  </div>
                  <div className="admin-manage-vehicle-detail-item">
                    <label>Plate Number</label>
                    <span className="admin-manage-vehicle-plate-display">{selectedVehicle.plateNumber}</span>
                  </div>
                  <div className="admin-manage-vehicle-detail-item">
                    <label>Mileage</label>
                    <span>{selectedVehicle.mileage.toLocaleString()} km</span>
                  </div>
                  <div className="admin-manage-vehicle-detail-item">
                    <label>Status</label>
                    <span>{getStatusBadge(selectedVehicle.status)}</span>
                  </div>
                </div>
              </div>

              <div className="admin-manage-vehicle-images-section">
                {selectedVehicle.bluebookImageUrl && (
                  <div className="admin-manage-vehicle-detail-section">
                    <h3>Bluebook Image</h3>
                    <div className="admin-manage-vehicle-image-container">
                      <img
                        src={selectedVehicle.bluebookImageUrl}
                        alt="Bluebook"
                        className="admin-manage-vehicle-detail-img clickable"
                        onClick={() => handleImageClick(selectedVehicle.bluebookImageUrl!)}
                        title="Click to enlarge"
                      />
                    </div>
                  </div>
                )}
                
                {selectedVehicle.vehicleImageUrl && (
                  <div className="admin-manage-vehicle-detail-section">
                    <h3>Vehicle Image</h3>
                    <div className="admin-manage-vehicle-image-container">
                      <img
                        src={selectedVehicle.vehicleImageUrl}
                        alt="Vehicle"
                        className="admin-manage-vehicle-detail-img clickable"
                        onClick={() => handleImageClick(selectedVehicle.vehicleImageUrl!)}
                        title="Click to enlarge"
                      />
                    </div>
                  </div>
                )}
              </div>

              {selectedVehicle.rejectionReason && (
                <div className="admin-manage-vehicle-detail-section">
                  <h3>Rejection Reason</h3>
                  <div className="admin-manage-vehicle-rejection-reason-box">
                    <p>{selectedVehicle.rejectionReason}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="admin-manage-vehicle-modal-footer">
              <button
                className="admin-manage-vehicle-modal-change-status-btn"
                onClick={() => { handleChangeStatusClick(selectedVehicle); setShowModal(false); }}
              >
                <FontAwesomeIcon icon={faExchangeAlt} /> Change Status
              </button>
              {selectedVehicle.status === 'pending' && (
                <>
                  <button
                    className="admin-manage-vehicle-modal-reject-btn"
                    onClick={() => { setShowModal(false); handleRejectClick(selectedVehicle); }}
                  >
                    <FontAwesomeIcon icon={faTimes} /> Reject
                  </button>
                  <button
                    className="admin-manage-vehicle-modal-verify-btn"
                    onClick={() => { handleVerify(selectedVehicle._id); setShowModal(false); }}
                  >
                    <FontAwesomeIcon icon={faCheck} /> Verify
                  </button>
                </>
              )}
              <button className="admin-manage-vehicle-modal-close-btn" onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedVehicle && (
        <div className="admin-manage-vehicle-modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="admin-manage-vehicle-modal-content admin-manage-vehicle-reject-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-manage-vehicle-modal-header">
              <h2>Reject Vehicle</h2>
              <button className="admin-manage-vehicle-modal-close" onClick={() => setShowRejectModal(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="admin-manage-vehicle-modal-body">
              <p className="admin-manage-vehicle-reject-warning">
                Are you sure you want to reject this vehicle? Please provide a reason.
              </p>
              <div className="admin-manage-vehicle-form-group">
                <label>Rejection Reason *</label>
                <textarea
                  className="admin-manage-vehicle-form-textarea"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  rows={4}
                  required
                />
              </div>
            </div>
            <div className="admin-manage-vehicle-modal-footer">
              <button
                className="admin-manage-vehicle-modal-cancel-btn"
                onClick={() => { setShowRejectModal(false); setRejectionReason(''); }}
              >
                Cancel
              </button>
              <button
                className="admin-manage-vehicle-modal-confirm-reject-btn"
                onClick={handleRejectSubmit}
              >
                <FontAwesomeIcon icon={faTimes} /> Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {showStatusChangeModal && selectedVehicle && (
        <div className="admin-manage-vehicle-modal-overlay" onClick={() => setShowStatusChangeModal(false)}>
          <div className="admin-manage-vehicle-modal-content admin-manage-vehicle-status-change-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-manage-vehicle-modal-header">
              <h2><FontAwesomeIcon icon={faCar} /> Change Vehicle Status</h2>
              <button className="admin-manage-vehicle-modal-close" onClick={() => setShowStatusChangeModal(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="admin-manage-vehicle-modal-body">
              <div className="admin-manage-vehicle-vehicle-info-box">
                <h3>Vehicle Information</h3>
                <div className="admin-manage-vehicle-info-row">
                  <span className="admin-manage-vehicle-info-label">Vehicle:</span>
                  <span className="admin-manage-vehicle-info-value">{selectedVehicle.name}</span>
                </div>
                <div className="admin-manage-vehicle-info-row">
                  <span className="admin-manage-vehicle-info-label">Plate Number:</span>
                  <span className="admin-manage-vehicle-info-value admin-manage-vehicle-plate-display">{selectedVehicle.plateNumber}</span>
                </div>
                <div className="admin-manage-vehicle-info-row">
                  <span className="admin-manage-vehicle-info-label">Customer:</span>
                  <span className="admin-manage-vehicle-info-value">{selectedVehicle.userDetails?.name || 'Unknown'}</span>
                </div>
                <div className="admin-manage-vehicle-info-row">
                  <span className="admin-manage-vehicle-info-label">Current Status:</span>
                  <span className={`admin-manage-vehicle-status-badge-small ${selectedVehicle.status}`}>{selectedVehicle.status}</span>
                </div>
              </div>

              <div className="admin-manage-vehicle-form-group">
                <label className="admin-manage-vehicle-form-label">New Status</label>
                <select
                  className="admin-manage-vehicle-form-select"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as 'pending' | 'verified' | 'rejected')}
                >
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {newStatus === 'rejected' && (
                <div className="admin-manage-vehicle-form-group">
                  <label className="admin-manage-vehicle-form-label">Rejection Reason *</label>
                  <textarea
                    className="admin-manage-vehicle-form-textarea"
                    value={statusChangeReason}
                    onChange={(e) => setStatusChangeReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    rows={4}
                    required
                  />
                </div>
              )}
            </div>
            <div className="admin-manage-vehicle-modal-footer">
              <button className="admin-manage-vehicle-modal-cancel-btn" onClick={() => setShowStatusChangeModal(false)} disabled={statusChangeLoading}>
                Cancel
              </button>
              <button className="admin-manage-vehicle-modal-confirm-btn" onClick={handleStatusChangeSubmit} disabled={statusChangeLoading}>
                {statusChangeLoading ? <FontAwesomeIcon icon={faExchangeAlt} spin /> : <FontAwesomeIcon icon={faExchangeAlt} />}
                {statusChangeLoading ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {fullscreenImage && (
        <div className="admin-image-viewer-overlay" onClick={() => setFullscreenImage(null)}>
          <div className="admin-image-viewer-content" onClick={(e) => e.stopPropagation()}>
            <button className="admin-image-viewer-close" onClick={() => setFullscreenImage(null)}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <img src={fullscreenImage} alt="Large view" className="admin-image-viewer-img" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManageVehicles;
