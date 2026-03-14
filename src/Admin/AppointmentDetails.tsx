// components/AppointmentDetails.tsx
import { 
  FaCar, 
  FaCalendarAlt, 
  FaClock, 
  FaStickyNote, 
  FaMapMarkerAlt,
  FaDownload,
  FaTimes,
  FaFileInvoice
} from 'react-icons/fa';
import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import AppointmentPDF from './AppointmentPDF';
import type { Appointment } from '../types/appointment';
import './AppointmentDetails.css';

interface BillItem {
  id: string;
  itemName: string;
  itemPrice: number;
  serviceCharge?: number;
}

interface AppointmentDetailsProps {
  appointment: Appointment;
  onClose: () => void;
  actionButtons?: React.ReactNode;
  showDownloadButton?: boolean;
  billSection?: React.ReactNode;
  billItems?: BillItem[];
}

const AppointmentDetails = ({ 
  appointment, 
  onClose, 
  actionButtons,
  showDownloadButton = true,
  billSection,
  billItems = []
  
}: AppointmentDetailsProps) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  // Format time for display
  const formatTimeFromDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'N/A';
    }
  };

  // Get status label for display
  const getStatusLabel = (status: string) => {
    if (!status) return 'N/A';
    if (status === 'in-progress') return 'In Progress';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Handle PDF download/view
  const handleViewPDF = async () => {
    if (!appointment) return;
    
    try {
      setIsGeneratingPDF(true);
      
      const blob = await pdf(<AppointmentPDF appointment={appointment} billItems={billItems}/>).toBlob();
      const url = URL.createObjectURL(blob);
      
      window.open(url, '_blank');
      
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className='appointment-details-panel'>
      <div className='details-header'>
        <button className='close-details-btn' onClick={onClose} title='Close details view'>
          <FaTimes />
        </button>
        <h2>Appointment Details</h2>
        <div className='appointment-action-buttons'>
          {/* Download PDF button - conditionally rendered */}
          {showDownloadButton && (
            <button 
              className={`appointment-action-btn download-btn ${isGeneratingPDF ? 'loading' : ''}`}
              onClick={handleViewPDF}
              disabled={isGeneratingPDF}
              title="View PDF"
            >
              {isGeneratingPDF ? (
                <div className="spinner-small"></div>
              ) : (
                <FaDownload />
              )}
            </button>
          )}
          
          {/* Additional action buttons passed as props */}
          {actionButtons}
        </div>
      </div>
      
      <div className='details-content'>
        {/* Customer Information */}
        <div className='details-section'>
          <h3 className='section-title'>
            <span>Customer Information</span>
          </h3>
          <div className='info-grid'>
            <div className='info-item'>
              <span className='info-label'>Name:</span>
              <span className='info-value1'>
                {appointment.name || `User #${appointment.userId}`}
              </span>
            </div>
            <div className='info-item'>
              <span className='info-label'>Email:</span>
              <span className='info-value2'>
                {appointment.email || 'Not available'}
              </span>
            </div>
            <div className='info-item'>
              <span className='info-label'>Phone:</span>
              <span className='info-value2'>
                {appointment.phone || 'Not available'}
              </span>
            </div>
            <div className='info-item'>
              <span className='info-label'>User ID:</span>
              <span className='info-value1'>{appointment.userId}</span>
            </div>
          </div>
        </div>

        {/* Appointment Details */}
        <div className='details-section'>
          <h3 className='section-title'>Appointment Details</h3>
          <div className='info-grid'>
            <div className='info-item'>
              <FaCalendarAlt className='info-icon' />
              <span className='info-label'>Date:</span>
              <span className='info-value1'>{formatDate(appointment.date)}</span>
            </div>
            <div className='info-item'>
              <FaClock className='info-icon' />
              <span className='info-label'>Time:</span>
              <span className='info-value1'>
                {appointment.time || formatTimeFromDate(appointment.date)}
              </span>
            </div>
            <div className='info-item'>
              <span className='info-label'>Status:</span>
              <span className={`status-badge status-${appointment.status || 'confirmed'}`}>
                {getStatusLabel(appointment.status || 'confirmed')}
              </span>
            </div>
            <div className='info-item'>
              {appointment.pickupRequired ? (
                <>
                  <FaMapMarkerAlt className='info-icon' />
                  <span className='info-label'>Pickup:</span>
                  <span className='info-value1 required'>Required</span>
                  {appointment.pickupAddress && (
                    <span className='info-address'>{appointment.pickupAddress}</span>
                  )}
                </>
              ) : (
                <>
                  <FaMapMarkerAlt className='info-icon' />
                  <span className='info-label'>Pickup:</span>
                  <span className='info-value not-required'>Not Required</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Vehicle Information */}
        <div className='details-section'>
          <h3 className='section-title'>Vehicle Information</h3>
          <div className='info-grid'>
            <div className='info-item'>
              <FaCar className='info-icon' />
              <span className='info-label'>Model:</span>
              <span className='info-value1'>
                {appointment.vehicleInfo?.model || 'Not specified'}
              </span>
            </div>
            <div className='info-item'>
              <span className='info-label'>Color:</span>
              <span className='info-value1'>
                {appointment.vehicleInfo?.color || 'Not specified'}
              </span>
            </div>
            <div className='info-item'>
              <span className='info-label'>Number Plate:</span>
              <span className='info-value'>
                {appointment.vehicleInfo?.numberPlate || 'Not specified'}
              </span>
            </div>
            <div className='info-item'>
              <span className='info-label'>Kilometer Run:</span>
              <span className='info-value'>
                {appointment.vehicleInfo?.kilometerRun 
                  ? `${appointment.vehicleInfo.kilometerRun.toLocaleString()} km`
                  : 'Not specified'
                }
              </span>
            </div>
          </div>
        </div>

        {/* Service Details */}
        <div className='details-section'>
          <h3 className='section-title'>Service Details</h3>
          <div className='info-grid'>
            <div className='info-item'>
              <span className='info-label'>Service Type:</span>
              <span className={`service-type-badge service-${appointment.serviceType ? appointment.serviceType.toLowerCase() : 'default'}`}>
                {appointment.serviceType || 'Unknown'}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {appointment.vehicleInfo?.notes && (
          <div className='details-section'>
            <h3 className='section-title'>Notes</h3>
            <div className='notes-container'>
              <FaStickyNote className='notes-icon' />
              <p className='notes-text'>{appointment.vehicleInfo.notes}</p>
            </div>
          </div>
        )}

        {/* Bill Section - Rendered if provided */}
        {billSection && (
          <div className='details-section bill-section'>
            <h3 className='section-title'>
              <FaFileInvoice className='section-icon' />
              <span>Bill Details</span>
            </h3>
            {billSection}
          </div>
        )}

        {/* Timeline */}
        <div className='details-section'>
          <h3 className='section-title'>Timeline</h3>
          <div className='timeline'>
            <div className='timeline-item'>
              <div className='timeline-dot created'></div>
              <div className='timeline-content'>
                <span className='timeline-event'>Appointment Created</span>
                <span className='timeline-date'>
                  {appointment.createdAt 
                    ? new Date(appointment.createdAt).toLocaleString()
                    : 'Not available'
                  }
                </span>
              </div>
            </div>
            <div className='timeline-item'>
              <div className='timeline-dot updated'></div>
              <div className='timeline-content'>
                <span className='timeline-event'>Last Updated</span>
                <span className='timeline-date'>
                  {appointment.updatedAt 
                    ? new Date(appointment.updatedAt).toLocaleString()
                    : 'Not available'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetails;