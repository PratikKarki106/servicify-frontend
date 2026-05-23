import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  faHistory,
  faCalendarCheck,
  faClock,
  faFileInvoiceDollar,
  faCheckCircle,
  faTimesCircle,
  faSpinner,
  faDownload,
  faFilePdf,
  faBox,
  faCreditCard,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import type { ServiceBooking } from '../types/dashboardTypes';
import { getAppointmentsByUser } from '../services/bookAppointment';
import type { Appointment } from '../types/appointment';
import { packageService } from '../services/Package';
import { getMyPurchases } from '../services/cartPurchaseService';

interface UserPackage {
  _id: string;
  packageName: string;
  totalCredits: number;
  usedCredits: number;
  remainingCredits: number;
  amount: number;
  purchasedAt: string;
  expiryDate: string;
  isActive: boolean;
}

const ITEMS_PER_PAGE = 5;

const UserHistory: React.FC = () => {
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [packages, setPackages] = useState<UserPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'appointments' | 'packages' | 'purchases'>('appointments');
  const [filter, setFilter] = useState<'all' | 'completed' | 'cancelled'>('all');
  const [purchases, setPurchases] = useState<any[]>([]);
  const [appointmentPage, setAppointmentPage] = useState(1);
  const [packagePage, setPackagePage] = useState(1);
  const [purchasePage, setPurchasePage] = useState(1);

  // Helper function to map status string
  const mapToServiceBookingStatus = (status: string): ServiceBooking['status'] => {
    const normalizedStatus = status.toLowerCase().trim();
    if (normalizedStatus === 'booked' || normalizedStatus === 'pending') return 'pending';
    if (normalizedStatus === 'confirmed') return 'confirmed';
    if (normalizedStatus === 'in-progress' || normalizedStatus === 'in_progress') return 'in-progress';
    if (normalizedStatus === 'payment') return 'payment';
    if (normalizedStatus === 'completed') return 'completed';
    if (normalizedStatus === 'cancelled') return 'cancelled';
    return 'pending' as ServiceBooking['status'];
  };

  const formatVehicleInfo = (vehicleInfo: any) => {
    if (!vehicleInfo) return 'N/A';
    const parts = [];
    if (vehicleInfo.name) parts.push(vehicleInfo.name);
    if (vehicleInfo.model) parts.push(vehicleInfo.model);
    if (vehicleInfo.color) parts.push(vehicleInfo.color);
    if (vehicleInfo.numberPlate) parts.push(`(${vehicleInfo.numberPlate})`);
    return parts.length > 0 ? parts.join(' ') : 'N/A';
  };

  const calculateTotalAmount = (billItems: any[] | undefined) => {
    if (!billItems || billItems.length === 0) return 0;
    return billItems.reduce((total, item) => {
      return total + item.itemPrice + (item.serviceCharge || 0);
    }, 0);
  };

  const fetchAppointments = async () => {
    try {
      const UserID = localStorage.getItem('userId') || '';
      if (!UserID) {
        throw new Error('User ID not found');
      }

      const response = await getAppointmentsByUser(UserID);
      let appointmentsUser: Appointment[] = [];

      if (response.success && Array.isArray(response.appointments)) {
        appointmentsUser = response.appointments;
      } else if (Array.isArray(response)) {
        appointmentsUser = response;
      } else {
        appointmentsUser = [];
      }

      // Filter only completed and cancelled appointments
      const historyAppointments = appointmentsUser.filter(app =>
        app.status === 'completed' || app.status === 'cancelled'
      );

      const convertedBookings: ServiceBooking[] = historyAppointments.map(appointment => {
        const vehicleString = formatVehicleInfo(appointment.vehicleInfo);
        const bookingId = appointment.appointmentId || appointment._id;
        const totalAmount = calculateTotalAmount(appointment.billItems);

        return {
          id: bookingId.toString(),
          serviceType: appointment.serviceType || 'General Service',
          vehicle: vehicleString,
          date: appointment.date,
          time: appointment.time,
          status: mapToServiceBookingStatus(appointment.status),
          estimatedCost: totalAmount,
          rawAppointment: appointment
        };
      });

      setBookings(convertedBookings);
    } catch (err: any) {
      console.error('Error fetching appointment history:', err);
      toast.error('Failed to load appointment history');
    }
  };

  const fetchPackages = async () => {
    try {
      const userPackages = await packageService.getUserPackages();
      setPackages(userPackages);
    } catch (err: any) {
      console.error('Error fetching package history:', err);
      // Don't show toast for package error, just log it
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchAppointments(), fetchPackages(), fetchPurchases()]);
    } catch (err: any) {
      console.error('Error fetching history:', err);
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchases = async () => {
    try {
      const response = await getMyPurchases();
      setPurchases(response?.data || []);
    } catch (_err) {
      setPurchases([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setAppointmentPage(1);
  }, [filter, bookings.length]);

  useEffect(() => {
    setPackagePage(1);
  }, [packages.length]);

  useEffect(() => {
    setPurchasePage(1);
  }, [purchases.length]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getDaysRemaining = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  const getStatusColor = (status: ServiceBooking['status']) => {
    switch (status) {
      case 'completed': return '#28a745';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status: ServiceBooking['status']) => {
    switch (status) {
      case 'completed': return <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#28a745' }} />;
      case 'cancelled': return <FontAwesomeIcon icon={faTimesCircle} style={{ color: '#dc3545' }} />;
      default: return null;
    }
  };

  const handleDownloadInvoice = (booking: ServiceBooking) => {
    const appointment = booking.rawAppointment as any;
    const billItems = appointment.billItems || [];
    const total = calculateTotalAmount(billItems);

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
    doc.text('Phone: +977-9823077575 | Email: heyt03279@gmail.com', 105, 33, { align: 'center' });
    
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
      ['Invoice No:', `INV-${booking.id.toString().padStart(6, '0')}`],
      ['Appointment ID:', `#${booking.id}`],
      ['Date:', new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })],
      ['Payment Date:', new Date().toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })]
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
    doc.text(invoiceDetails[3][1], 160, 73);
    
    // Customer & Service Details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('SERVICE DETAILS', 14, 88);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    const serviceDetails = [
      ['Service Type:', booking.serviceType],
      ['Appointment Date:', booking.date],
      ['Appointment Time:', booking.time],
      ['Vehicle:', booking.vehicle],
      ['Status:', booking.status.toUpperCase()]
    ];
    
    serviceDetails.forEach((detail, index) => {
      doc.setFont('helvetica', 'bold');
      doc.text(detail[0], 14, 96 + (index * 8));
      doc.setFont('helvetica', 'normal');
      doc.text(detail[1], 70, 96 + (index * 8));
    });
    
    // Bill Items Table
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL DETAILS', 14, 145);
    
    const tableColumn = ['Item', 'Price (Rs.)', 'Service Charge (Rs.)', 'Total (Rs.)'];
    const tableRows = billItems.map((item: any) => [
      item.itemName,
      item.itemPrice.toFixed(2),
      item.serviceCharge.toFixed(2),
      (item.itemPrice + item.serviceCharge).toFixed(2)
    ]);
    
    autoTable(doc, {
      startY: 150,
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
    doc.text('TOTAL AMOUNT', 130, finalY);
    doc.setTextColor(40, 167, 69);
    doc.text(`Rs. ${total.toFixed(2)}`, 180, finalY, { align: 'left' });
    
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

  const handleDownloadPackageReceipt = (pkg: UserPackage) => {
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
    doc.text('Phone: +977-9823077575 | Email: heyt03279@gmail.com', 105, 33, { align: 'center' });

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Receipt Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('PACKAGE PURCHASE RECEIPT', 105, 50, { align: 'center' });

    // Receipt Details
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    const receiptDetails = [
      ['Receipt No:', `PKG-${pkg._id.toString().slice(-8).toUpperCase()}`],
      ['Package ID:', `#${pkg._id}`],
      ['Date:', new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })],
      ['Purchase Date:', formatDate(pkg.purchasedAt)]
    ];

    doc.setFont('helvetica', 'bold');
    doc.text(receiptDetails[0][0], 14, 65);
    doc.setFont('helvetica', 'normal');
    doc.text(receiptDetails[0][1], 70, 65);

    doc.setFont('helvetica', 'bold');
    doc.text(receiptDetails[1][0], 120, 65);
    doc.setFont('helvetica', 'normal');
    doc.text(receiptDetails[1][1], 170, 65);

    doc.setFont('helvetica', 'bold');
    doc.text(receiptDetails[2][0], 14, 73);
    doc.setFont('helvetica', 'normal');
    doc.text(receiptDetails[2][1], 70, 73);

    doc.setFont('helvetica', 'bold');
    doc.text(receiptDetails[3][0], 120, 73);
    doc.setFont('helvetica', 'normal');
    doc.text(receiptDetails[3][1], 170, 73);

    // Package Details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PACKAGE DETAILS', 14, 88);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    const packageDetails = [
      ['Package Name:', pkg.packageName],
      ['Total Credits:', pkg.totalCredits.toString()],
      ['Used Credits:', pkg.usedCredits.toString()],
      ['Remaining Credits:', pkg.remainingCredits.toString()],
      ['Amount Paid:', `Rs. ${pkg.amount.toLocaleString()}`],
      ['Status:', pkg.isActive ? 'Active' : 'Expired'],
      ['Expiry Date:', formatDate(pkg.expiryDate)]
    ];

    packageDetails.forEach((detail, index) => {
      doc.setFont('helvetica', 'bold');
      doc.text(detail[0], 14, 96 + (index * 8));
      doc.setFont('helvetica', 'normal');
      doc.text(detail[1], 70, 96 + (index * 8));
    });

    // Payment Summary
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT SUMMARY', 14, 150);

    const summaryData = [
      ['Subtotal', `Rs. ${pkg.amount.toLocaleString()}`],
      ['Discount', 'Rs. 0.00'],
      ['Total Paid', `Rs. ${pkg.amount.toLocaleString()}`]
    ];

    autoTable(doc, {
      startY: 155,
      head: [['Description', 'Amount']],
      body: summaryData,
      theme: 'striped',
      headStyles: { fillColor: [102, 126, 234] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 14, right: 14 },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { cellWidth: 60, halign: 'right' }
      }
    });

    // Footer
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL PAID', 130, finalY);
    doc.setTextColor(40, 167, 69);
    doc.text(`Rs. ${pkg.amount.toLocaleString()}`, 180, finalY, { align: 'left' });

    // Footer message
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for your purchase!', 105, 270, { align: 'center' });
    doc.text('For any queries, please contact us at info@servicify.com', 105, 275, { align: 'center' });

    // Terms
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Terms & Conditions:', 14, 285);
    doc.text('• Package credits are non-refundable', 14, 290);
    doc.text('• Credits must be used before expiry date', 14, 294);
    doc.text('• This is a computer-generated receipt', 14, 298);

    // Open PDF in new tab
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');

    toast.success('Receipt PDF opened!');
  };

  const handleOpenPurchaseBill = (purchase: any) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("SERVICIFY PURCHASE BILL", 20, 20);
    doc.setFontSize(11);
    doc.text(`Bill No: ${purchase.purchaseCode}`, 20, 30);
    doc.text(`Date: ${new Date(purchase.createdAt).toLocaleString()}`, 20, 38);

    const rows = (purchase.items || []).map((i: any) => [
      i.itemName,
      String(i.quantity),
      `Rs. ${Number(i.unitPrice || 0).toFixed(2)}`,
      `Rs. ${Number(i.totalPrice || 0).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 48,
      head: [["Item", "Qty", "Unit", "Total"]],
      body: rows,
      theme: "striped"
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.text(`Total Paid: Rs. ${Number(purchase.totalAmount || 0).toFixed(2)}`, 20, finalY);
    const blob = doc.output('blob');
    window.open(URL.createObjectURL(blob), '_blank');
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  const appointmentTotalPages = Math.max(1, Math.ceil(filteredBookings.length / ITEMS_PER_PAGE));
  const packageTotalPages = Math.max(1, Math.ceil(packages.length / ITEMS_PER_PAGE));
  const purchaseTotalPages = Math.max(1, Math.ceil(purchases.length / ITEMS_PER_PAGE));

  const safeAppointmentPage = Math.min(appointmentPage, appointmentTotalPages);
  const safePackagePage = Math.min(packagePage, packageTotalPages);
  const safePurchasePage = Math.min(purchasePage, purchaseTotalPages);

  const paginatedBookings = filteredBookings.slice(
    (safeAppointmentPage - 1) * ITEMS_PER_PAGE,
    safeAppointmentPage * ITEMS_PER_PAGE
  );
  const paginatedPackages = packages.slice(
    (safePackagePage - 1) * ITEMS_PER_PAGE,
    safePackagePage * ITEMS_PER_PAGE
  );
  const paginatedPurchases = purchases.slice(
    (safePurchasePage - 1) * ITEMS_PER_PAGE,
    safePurchasePage * ITEMS_PER_PAGE
  );

  const renderPagination = (
    currentPage: number,
    totalPages: number,
    onPageChange: (page: number) => void
  ) => {
    if (totalPages <= 1) return null;

    return (
      <div className="history-pagination-controls">
        <button
          className="history-pagination-btn"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          {'<'}
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <button
            key={pageNum}
            className={`history-pagination-btn ${pageNum === currentPage ? 'active' : ''}`}
            onClick={() => onPageChange(pageNum)}
          >
            {pageNum}
          </button>
        ))}
        <button
          className="history-pagination-btn"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          {'>'}
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="userdashboard-section">
        <div className="loading-spinner">
          <FontAwesomeIcon icon={faSpinner} spin /> Loading history...
        </div>
      </div>
    );
  }

  return (
    <div className="userdashboard-section" style={{ padding: '20px' }}>
      <div className="userdashboard-section-header">
        <h2><FontAwesomeIcon icon={faHistory} /> My History</h2>
        
        {/* Main Tabs - Appointments vs Packages */}
        <div className="history-tabs">
          <button
            className={`history-tab ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            <FontAwesomeIcon icon={faCalendarCheck} /> Appointments ({bookings.length})
          </button>
          <button
            className={`history-tab ${activeTab === 'packages' ? 'active' : ''}`}
            onClick={() => setActiveTab('packages')}
          >
            <FontAwesomeIcon icon={faBox} /> Packages ({packages.length})
          </button>
          <button
            className={`history-tab ${activeTab === 'purchases' ? 'active' : ''}`}
            onClick={() => setActiveTab('purchases')}
          >
            <FontAwesomeIcon icon={faCreditCard} /> Purchases ({purchases.length})
          </button>
        </div>
      </div>

      {/* Appointments Tab */}
      {activeTab === 'appointments' && (
        <>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed
            </button>
            <button
              className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
              onClick={() => setFilter('cancelled')}
            >
              Cancelled
            </button>
          </div>

          {filteredBookings.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#6c757d'
            }}>
              <FontAwesomeIcon icon={faHistory} size="3x" style={{ marginBottom: '20px', opacity: 0.3 }} />
              <h3>No appointment history found</h3>
              <p>Your completed and cancelled appointments will appear here</p>
            </div>
          ) : (
            <div className="userdashboard-bookings">
              {paginatedBookings.map(booking => (
                <div key={booking.id} className="userdashboard-booking-card">
                  <div className="userdashboard-booking-header">
                    <div>
                      <h4>{booking.serviceType}</h4>
                      <p className="userdashboard-booking-vehicle">{booking.vehicle}</p>
                      <small style={{ color: '#666', fontSize: '12px' }}>
                        Appointment ID: {booking.id}
                      </small>
                    </div>
                    <div
                      className="userdashboard-booking-status"
                      style={{ color: getStatusColor(booking.status) }}
                    >
                      {getStatusIcon(booking.status)}
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </div>
                  </div>
                  <div className="userdashboard-booking-details">
                    <div className="userdashboard-booking-info">
                      <div>
                        <FontAwesomeIcon icon={faCalendarCheck} />
                        <span>{formatDate(booking.date)}</span>
                      </div>
                      <div>
                        <FontAwesomeIcon icon={faClock} />
                        <span>{booking.time}</span>
                      </div>
                      <div>
                        <FontAwesomeIcon icon={faFileInvoiceDollar} />
                        <span className="booking-amount">Rs. {booking.estimatedCost.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="userdashboard-booking-actions">
                      <button
                        className="userdashboard-action-btn"
                        style={{
                          backgroundColor: '#28a745',
                          color: 'white'
                        }}
                        onClick={() => handleDownloadInvoice(booking)}
                      >
                        <FontAwesomeIcon icon={faFilePdf} /> Download Invoice PDF
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {renderPagination(safeAppointmentPage, appointmentTotalPages, setAppointmentPage)}
        </>
      )}

      {/* Packages Tab */}
      {activeTab === 'packages' && (
        <div className="packages-history-grid">
          {packages.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#6c757d'
            }}>
              <FontAwesomeIcon icon={faBox} size="3x" style={{ marginBottom: '20px', opacity: 0.3 }} />
              <h3>No package purchases found</h3>
              <p>Your purchased packages will appear here</p>
            </div>
          ) : (
            paginatedPackages.map((pkg) => {
              const daysRemaining = getDaysRemaining(pkg.expiryDate);
              const usagePercent = (pkg.usedCredits / pkg.totalCredits) * 100;
              const isExpired = !pkg.isActive;
              const isUsedUp = pkg.remainingCredits === 0;

              return (
                <div key={pkg._id} className="package-history-card">
                  <div className="package-history-header">
                    <div className="package-history-title">
                      <FontAwesomeIcon icon={faBox} style={{ marginRight: '10px', color: '#667eea' }} />
                      <h4>{pkg.packageName}</h4>
                    </div>
                    <div className="package-history-status">
                      {isExpired ? (
                        <span className="status-badge expired">
                          <FontAwesomeIcon icon={faTimesCircle} /> Expired
                        </span>
                      ) : isUsedUp ? (
                        <span className="status-badge used">
                          <FontAwesomeIcon icon={faCheckCircle} /> Used Up
                        </span>
                      ) : daysRemaining <= 7 ? (
                        <span className="status-badge expiring">
                          <FontAwesomeIcon icon={faClock} /> Expiring Soon
                        </span>
                      ) : (
                        <span className="status-badge active">
                          <FontAwesomeIcon icon={faCheckCircle} /> Active
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="package-history-details">
                    <div className="package-detail-row">
                      <span className="detail-label"><FontAwesomeIcon icon={faCreditCard} /> Amount:</span>
                      <span className="detail-value">Rs. {pkg.amount.toLocaleString()}</span>
                    </div>
                    <div className="package-detail-row">
                      <span className="detail-label"><FontAwesomeIcon icon={faCalendarAlt} /> Purchased:</span>
                      <span className="detail-value">{formatDate(pkg.purchasedAt)}</span>
                    </div>
                    <div className="package-detail-row">
                      <span className="detail-label"><FontAwesomeIcon icon={faClock} /> Expires:</span>
                      <span className="detail-value">
                        {isExpired 
                          ? `Expired on ${formatDate(pkg.expiryDate)}`
                          : `${daysRemaining} days (${formatDate(pkg.expiryDate)})`
                        }
                      </span>
                    </div>
                  </div>

                  <div className="package-credits-section">
                    <div className="credits-header">
                      <span>Credits Used</span>
                      <span>{pkg.remainingCredits} / {pkg.totalCredits} remaining</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${usagePercent}%`,
                          backgroundColor: usagePercent >= 75 ? '#f44336' : usagePercent >= 50 ? '#ff9800' : '#4caf50'
                        }}
                      />
                    </div>
                    <div className="credits-footer">
                      <span>Used: {pkg.usedCredits}</span>
                      <span>Remaining: {pkg.remainingCredits}</span>
                    </div>
                  </div>

                  <div className="package-history-actions">
                    <button
                      className="package-action-btn"
                      onClick={() => {
                        // Download package receipt
                        handleDownloadPackageReceipt(pkg);
                      }}
                    >
                      <FontAwesomeIcon icon={faDownload} /> Download Receipt
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
      {activeTab === 'packages' && renderPagination(safePackagePage, packageTotalPages, setPackagePage)}

      {activeTab === 'purchases' && (
        <div className="packages-history-grid">
          {purchases.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <h3>No purchase history found</h3>
            </div>
          ) : (
            paginatedPurchases.map((purchase) => (
              <div key={purchase._id} className="package-history-card">
                <div className="package-history-header">
                  <div className="package-history-title">
                    <FontAwesomeIcon icon={faCreditCard} style={{ marginRight: '10px', color: '#667eea' }} />
                    <h4>{purchase.purchaseCode}</h4>
                  </div>
                  <span className="status-badge active">{purchase.paymentStatus}</span>
                </div>
                <div className="package-detail-row">
                  <span className="detail-label">Items</span>
                  <span className="detail-value">{purchase.items?.length || 0}</span>
                </div>
                <div className="package-detail-row">
                  <span className="detail-label">Date</span>
                  <span className="detail-value">{formatDate(purchase.createdAt)}</span>
                </div>
                <div className="package-detail-row">
                  <span className="detail-label">Amount</span>
                  <span className="detail-value">Rs. {Number(purchase.totalAmount || 0).toFixed(2)}</span>
                </div>
                <div className="package-history-actions">
                  <button className="package-action-btn" onClick={() => handleOpenPurchaseBill(purchase)}>
                    <FontAwesomeIcon icon={faFilePdf} /> Open Bill PDF
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      {activeTab === 'purchases' && renderPagination(safePurchasePage, purchaseTotalPages, setPurchasePage)}

      <style>{`
        .history-tabs {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }

        .history-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border: 2px solid #dee2e6;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s;
          color: #666;
        }

        .history-tab:hover {
          border-color: #667eea;
          color: #667eea;
        }

        .history-tab.active {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .filter-buttons {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .filter-btn {
          padding: 8px 16px;
          border: 2px solid #dee2e6;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .filter-btn:hover {
          border-color: #667eea;
          color: #667eea;
        }

        .filter-btn.active {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .history-pagination-controls {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          margin-top: 16px;
          margin-bottom: 8px;
        }

        .history-pagination-btn {
          min-width: 34px;
          height: 34px;
          border: 1px solid #d1d5db;
          background: #fff;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          transition: all 0.2s ease;
        }

        .history-pagination-btn:hover:not(:disabled) {
          border-color: #667eea;
          color: #667eea;
        }

        .history-pagination-btn.active {
          background: #667eea;
          border-color: #667eea;
          color: #fff;
        }

        .history-pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .packages-history-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
        }

        .package-history-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          border: 1px solid #e0e0e0;
          transition: all 0.2s;
        }

        .package-history-card:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
          transform: translateY(-2px);
        }

        .package-history-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .package-history-title {
          display: flex;
          align-items: center;
        }

        .package-history-title h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #1a1a1a;
        }

        .package-history-status {
          flex-shrink: 0;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-badge.active {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .status-badge.expired {
          background: #ffebee;
          color: #c62828;
        }

        .status-badge.used {
          background: #fff3e0;
          color: #e65100;
        }

        .status-badge.expiring {
          background: #fff3e0;
          color: #ef6c00;
        }

        .package-history-details {
          margin-bottom: 16px;
        }

        .package-detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .package-detail-row:last-child {
          border-bottom: none;
        }

        .detail-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #666;
          font-weight: 500;
        }

        .detail-value {
          font-size: 13px;
          color: #1a1a1a;
          font-weight: 600;
        }

        .package-credits-section {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 14px;
          margin-bottom: 16px;
        }

        .credits-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 13px;
          font-weight: 600;
          color: #333;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e0e0e0;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .progress-fill {
          height: 100%;
          transition: width 0.3s ease;
          border-radius: 4px;
        }

        .credits-footer {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #666;
        }

        .credits-footer span:last-child {
          color: #4caf50;
          font-weight: 600;
        }

        .package-history-actions {
          display: flex;
          gap: 10px;
        }

        .package-action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
          justify-content: center;
        }

        .package-action-btn:hover {
          background: #5568d3;
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
};

export default UserHistory;
