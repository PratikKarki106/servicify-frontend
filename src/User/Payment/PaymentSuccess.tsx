import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faSpinner, 
  faExclamationTriangle, 
  faHome, 
  faCalendarCheck, 
  faDownload,
  faCalendar,
  faClock,
  faFileInvoice,
  faFilePdf
} from '@fortawesome/free-solid-svg-icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-toastify';
import './PaymentSuccess.css';

interface BillItem {
  itemName: string;
  itemPrice: number;
  serviceCharge: number;
}

interface AppointmentDetails {
  appointmentId: number;
  serviceType: string;
  date: string;
  time: string;
  vehicleInfo: {
    name: string;
    model: string;
    color: string;
    numberPlate: string;
  };
  billItems: BillItem[];
  status: string;
  paymentStatus: string;
}

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const type = searchParams.get('type'); // 'appointment' or 'package'
  const id = searchParams.get('id'); // appointment ID or package purchase ID
  const error = searchParams.get('error');
  
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | 'pending'>('pending');
  const [appointmentDetails, setAppointmentDetails] = useState<AppointmentDetails | null>(null);
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toLocaleString());

  useEffect(() => {
    // Clear any pending payment from session storage
    const pendingPayment = sessionStorage.getItem('pendingPayment');
    if (pendingPayment) {
      sessionStorage.removeItem('pendingPayment');
    }

    // Verify payment status if we have an ID
    if (type && id) {
      setPaymentStatus('success');
      setPaymentDate(new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }));

      // Show success toast notification
      if (type === 'appointment') {
        toast.success('🎉 Payment successful! Your appointment has been confirmed.', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
      } else if (type === 'package') {
        toast.success('📦 Package purchased successfully! Credits added to your account.', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
      }

      // Fetch appointment details if it's an appointment payment
      if (type === 'appointment' && id) {
        fetchAppointmentDetails(id);
      } else {
        setLoading(false);
      }
    } else if (error) {
      setPaymentStatus('failed');
      setLoading(false);
      
      // Show error toast notification
      toast.error('❌ Payment failed. Please try again.', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
    }
  }, [type, id, error]);

  const fetchAppointmentDetails = async (appointmentId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/appointments/appointment/${appointmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Appointment details:', result);
        setAppointmentDetails(result.appointment || result);
      }
    } catch (err) {
      console.error('Error fetching appointment details:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (items: BillItem[]) => {
    if (!items || items.length === 0) return 0;
    return items.reduce((total, item) => total + item.itemPrice + (item.serviceCharge || 0), 0);
  };

  const handleDownloadInvoice = () => {
    if (!appointmentDetails) return;

    const total = calculateTotal(appointmentDetails.billItems);

    // Create PDF
    const doc = new jsPDF();
    
    // Company Header
    doc.setFillColor(102, 126, 234);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('SERVICIFY AUTO CARE', 105, 15, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Professional Vehicle Service Center', 105, 25, { align: 'center' });
    doc.text('Phone: +977-1-XXXXXXX | Email: info@servicify.com', 105, 33, { align: 'center' });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Invoice Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 105, 50, { align: 'center' });
    
    // Invoice Details
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const invoiceDetails = [
      ['Invoice No:', `INV-${appointmentDetails.appointmentId.toString().padStart(6, '0')}`],
      ['Appointment ID:', `#${appointmentDetails.appointmentId}`],
      ['Date:', new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })],
      ['Payment Date:', paymentDate]
    ];
    
    doc.setFont('helvetica', 'bold');
    doc.text(invoiceDetails[0][0], 14, 65);
    doc.setFont('helvetica', 'normal');
    doc.text(invoiceDetails[0][1], 70, 65);
    
    doc.setFont('helvetica', 'bold');
    doc.text(invoiceDetails[1][0], 120, 65);
    doc.setFont('helvetica', 'normal');
    doc.text(invoiceDetails[1][1], 170, 65);
    
    doc.setFont('helvetica', 'bold');
    doc.text(invoiceDetails[2][0], 14, 73);
    doc.setFont('helvetica', 'normal');
    doc.text(invoiceDetails[2][1], 70, 73);
    
    doc.setFont('helvetica', 'bold');
    doc.text(invoiceDetails[3][0], 120, 73);
    doc.setFont('helvetica', 'normal');
    doc.text(invoiceDetails[3][1], 170, 73);
    
    // Customer & Service Details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('SERVICE DETAILS', 14, 88);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    const serviceDetails = [
      ['Service Type:', appointmentDetails.serviceType],
      ['Appointment Date:', appointmentDetails.date],
      ['Appointment Time:', appointmentDetails.time],
      ['Vehicle:', `${appointmentDetails.vehicleInfo?.name || 'N/A'} ${appointmentDetails.vehicleInfo?.model || ''} ${appointmentDetails.vehicleInfo?.color || ''} (${appointmentDetails.vehicleInfo?.numberPlate || 'N/A'})`],
      ['Status:', 'PAID']
    ];
    
    let currentY = 96;
    serviceDetails.forEach((detail) => {
      doc.setFont('helvetica', 'bold');
      doc.text(detail[0], 14, currentY);
      doc.setFont('helvetica', 'normal');
      
      // Handle long text for vehicle
      const vehicleText = detail[1];
      if (vehicleText.length > 60) {
        const splitText = doc.splitTextToSize(vehicleText, 120);
        doc.text(splitText, 70, currentY);
        currentY += (splitText.length - 1) * 5;
      } else {
        doc.text(vehicleText, 70, currentY);
      }
      currentY += 8;
    });
    
    // Bill Items Table
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL DETAILS', 14, currentY + 5);
    
    const tableColumn = ['Item', 'Price (Rs.)', 'Service Charge (Rs.)', 'Total (Rs.)'];
    const tableRows = appointmentDetails.billItems.map((item) => [
      item.itemName,
      item.itemPrice.toFixed(2),
      item.serviceCharge.toFixed(2),
      (item.itemPrice + item.serviceCharge).toFixed(2)
    ]);
    
    autoTable(doc, {
      startY: currentY + 10,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [102, 126, 234] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 14, right: 14 },
      columnStyles: {
        0: { cellWidth: 90 },
        1: { cellWidth: 40, halign: 'right' },
        2: { cellWidth: 40, halign: 'right' },
        3: { cellWidth: 40, halign: 'right' }
      }
    });
    
    // Total Amount
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL AMOUNT', 140, finalY);
    doc.setTextColor(40, 167, 69);
    doc.text(`Rs. ${total.toFixed(2)}`, 195, finalY, { align: 'right' });
    
    // Footer
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for your business!', 105, 270, { align: 'center' });
    doc.text('For any queries, please contact us at info@servicify.com', 105, 275, { align: 'center' });
    
    // Terms and Conditions
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Terms & Conditions:', 14, 285);
    doc.text('• Payment is non-refundable', 14, 290);
    doc.text('• Service warranty applies as per company policy', 14, 294);
    doc.text('• This is a computer-generated invoice', 14, 298);

    // Open PDF in new tab
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
    
    toast.success('Invoice PDF opened!');
  };

  const handleGoHome = () => {
    // Set flag to refresh appointments
    sessionStorage.setItem('paymentSuccess', 'true');
    navigate('/user/dashboard');
  };

  const handleViewBooking = () => {
    if (type === 'appointment' && id) {
      // Set flag to refresh appointments
      sessionStorage.setItem('paymentSuccess', 'true');
      navigate('/user/dashboard', { state: { highlightAppointment: id } });
    } else if (type === 'package' && id) {
      navigate('/user/packages');
    }
  };

  if (loading) {
    return (
      <div className="payment-status-container">
        <div className="loading-spinner">
          <FontAwesomeIcon icon={faSpinner} spin size="3x" />
          <p>Processing payment...</p>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'failed' || error) {
    return (
      <div className="payment-status-container">
        <div className="payment-status-card failed">
          <div className="status-icon failed">
            <FontAwesomeIcon icon={faExclamationTriangle} />
          </div>
          <h2>Payment Failed</h2>
          <p className="error-message">{error || 'Your payment could not be processed.'}</p>
          <p className="error-subtitle">Don't worry, you haven't been charged.</p>
          
          <div className="action-buttons">
            <button className="btn btn-secondary" onClick={handleGoHome}>
              <FontAwesomeIcon icon={faHome} /> Go Home
            </button>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="payment-status-container">
      <div className="payment-status-card success">
        <div className="payment-header">
          <div className="status-icon success">
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
          <h2>Payment Successful!</h2>
        </div>
        
        {type === 'appointment' && appointmentDetails && (
          <>
            <div className="invoice-header">
              <button className="btn btn-download" onClick={handleDownloadInvoice}>
                <FontAwesomeIcon icon={faFilePdf} /> Download Invoice PDF
              </button>
            </div>

            <div className="appointment-info-section">
              <h3><FontAwesomeIcon icon={faFileInvoice} /> Appointment Details</h3>
              
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label"><FontAwesomeIcon icon={faCalendar} /> Appointment ID:</span>
                  <span className="info-value">#{appointmentDetails.appointmentId}</span>
                </div>
                <div className="info-item">
                  <span className="info-label"><FontAwesomeIcon icon={faCalendar} /> Service Date:</span>
                  <span className="info-value">{appointmentDetails.date}</span>
                </div>
                <div className="info-item">
                  <span className="info-label"><FontAwesomeIcon icon={faClock} /> Service Time:</span>
                  <span className="info-value">{appointmentDetails.time}</span>
                </div>
                <div className="info-item">
                  <span className="info-label"><FontAwesomeIcon icon={faCalendarCheck} /> Payment Date:</span>
                  <span className="info-value">{paymentDate}</span>
                </div>
                <div className="info-item full-width">
                  <span className="info-label">Service Type:</span>
                  <span className="info-value">{appointmentDetails.serviceType}</span>
                </div>
                <div className="info-item full-width">
                  <span className="info-label">Vehicle:</span>
                  <span className="info-value">
                    {appointmentDetails.vehicleInfo?.name || 'N/A'} {appointmentDetails.vehicleInfo?.model || ''} 
                    {appointmentDetails.vehicleInfo?.color || ''} ({appointmentDetails.vehicleInfo?.numberPlate || 'N/A'})
                  </span>
                </div>
              </div>
            </div>

            <div className="bill-section">
              <h3><FontAwesomeIcon icon={faFileInvoice} /> Bill Details</h3>
              
              <div className="bill-items-table">
                <div className="bill-header">
                  <span className="col-item">Item</span>
                  <span className="col-price">Price</span>
                  <span className="col-service">Service Charge</span>
                  <span className="col-total">Total</span>
                </div>
                
                {appointmentDetails.billItems && appointmentDetails.billItems.length > 0 ? (
                  appointmentDetails.billItems.map((item, index) => (
                    <div key={index} className="bill-row">
                      <span className="col-item">{item.itemName}</span>
                      <span className="col-price">Rs. {item.itemPrice.toFixed(2)}</span>
                      <span className="col-service">Rs. {item.serviceCharge.toFixed(2)}</span>
                      <span className="col-total">Rs. {(item.itemPrice + item.serviceCharge).toFixed(2)}</span>
                    </div>
                  ))
                ) : (
                  <div className="no-items">No bill items</div>
                )}
                
                <div className="bill-total">
                  <span>Total Amount</span>
                  <span className="total-amount">Rs. {calculateTotal(appointmentDetails.billItems).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="payment-status-section">
              <div className="status-badge paid">
                <FontAwesomeIcon icon={faCheckCircle} /> Payment Status: Paid
              </div>
              <div className="status-badge appointment">
                Appointment Status: {appointmentDetails.status.charAt(0).toUpperCase() + appointmentDetails.status.slice(1).replace('-', ' ')}
              </div>
            </div>
            
            <p className="next-steps">
              You can view your appointment details and track the service status from your dashboard.
            </p>
          </>
        )}
        
        {type === 'package' && (
          <>
            <p className="success-message">
              Your package purchase has been completed successfully.
            </p>
            <div className="payment-details">
              <div className="detail-row">
                <span className="detail-label">Package Purchase ID:</span>
                <span className="detail-value">#{id?.toString().slice(-8)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className="detail-value status-active">Active</span>
              </div>
            </div>
            <p className="next-steps">
              Your package credits are now available in your account.
            </p>
          </>
        )}
        
        <div className="action-buttons">
          <button className="btn btn-secondary" onClick={handleGoHome}>
            <FontAwesomeIcon icon={faHome} /> Go Home
          </button>
          <button className="btn btn-primary" onClick={handleViewBooking}>
            <FontAwesomeIcon icon={faCalendarCheck} /> 
            {type === 'appointment' ? 'View Appointment' : 'View Package'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
