// components/AppointmentPDF.tsx
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import type { Appointment } from '../types/appointment';

// Register a font that supports more characters
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/helvetica-neue/v4/HelveticaNeue.otf' }
  ]
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  appointmentId: {
    fontSize: 12,
    color: '#6b7280',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#374151',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: 120,
    fontWeight: 'bold',
    color: '#4b5563',
  },
  value: {
    flex: 1,
    color: '#1f2937',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  gridItem: {
    width: '50%',
    marginBottom: 8,
  },
  badge: {
    padding: '3px 8px',
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  statusBadge: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
  },
  serviceBadge: {
    backgroundColor: '#f3e8ff',
    color: '#6b21a8',
  },
  notes: {
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 4,
    marginTop: 10,
    fontSize: 10,
    color: '#4b5563',
  },
  timeline: {
    marginTop: 10,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
    marginTop: 4,
  },
  dotCreated: {
    backgroundColor: '#10b981',
  },
  dotUpdated: {
    backgroundColor: '#f59e0b',
  },
  timelineContent: {
    flex: 1,
  },
  timelineEvent: {
    fontWeight: 'bold',
    fontSize: 11,
  },
  timelineDate: {
    fontSize: 9,
    color: '#6b7280',
  },
  // Bill section styles
  billHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 8,
    marginBottom: 8,
    fontWeight: 'bold',
    fontSize: 11,
    color: '#374151',
  },
  billRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingVertical: 6,
    fontSize: 10,
  },
  colItem: {
    flex: 3,
  },
  colPrice: {
    flex: 2,
    textAlign: 'right',
    paddingRight: 10,
  },
  colServiceCharge: {
    flex: 2,
    textAlign: 'right',
    paddingRight: 10,
  },
  colTotal: {
    flex: 2,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  totalRow: {
    flexDirection: 'row',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: '#374151',
    fontWeight: 'bold',
  },
  totalLabel: {
    flex: 8,
    textAlign: 'right',
    paddingRight: 10,
  },
  totalAmount: {
    flex: 2,
    textAlign: 'right',
  },
  grandTotal: {
    fontSize: 14,
    color: '#2563eb',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 9,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
});

// Define BillItem interface (should match the one in AdminAppointment)
interface BillItem {
  id: string;
  itemName: string;
  itemPrice: number;
  serviceCharge?: number;
}

interface AppointmentPDFProps {
  appointment: Appointment;
  billItems?: BillItem[]; // Optional bill items
}

const AppointmentPDF = ({ appointment, billItems = [] }: AppointmentPDFProps) => {
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
      return 'Invalid Date';
    }
  };

  // Format time for display
  const formatTime = (dateString: string, timeString?: string) => {
    if (timeString) return timeString;
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
      return 'N/A';
    }
  };

  // Calculate bill totals
  const calculateSubtotal = () => {
    return billItems.reduce((sum, item) => sum + item.itemPrice, 0);
  };

  const calculateTotalServiceCharge = () => {
    return billItems.reduce((sum, item) => sum + (item.serviceCharge || 0), 0);
  };

  const calculateGrandTotal = () => {
    return calculateSubtotal() + calculateTotalServiceCharge();
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `Nrs ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>AutoCare Service Center</Text>
          <Text style={styles.appointmentId}>Appointment #{appointment.appointmentId || appointment._id?.slice(-6)}</Text>
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Name:</Text>
                <Text style={styles.value}>{appointment.name || `User #${appointment.userId}`}</Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{appointment.email || 'N/A'}</Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Phone:</Text>
                <Text style={styles.value}>{appointment.phone || appointment.contactNumber || 'N/A'}</Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>User ID:</Text>
                <Text style={styles.value}>{appointment.userId}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Appointment Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appointment Details</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Date:</Text>
                <Text style={styles.value}>{formatDate(appointment.date)}</Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Time:</Text>
                <Text style={styles.value}>{formatTime(appointment.date, appointment.time)}</Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Status:</Text>
                <Text style={[styles.badge, styles.statusBadge]}>
                  {appointment.status?.toUpperCase() || 'CONFIRMED'}
                </Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Pickup Required:</Text>
                <Text style={styles.value}>{appointment.pickupRequired ? 'Yes' : 'No'}</Text>
              </View>
            </View>
            {appointment.pickupRequired && appointment.pickupAddress && (
              <View style={styles.gridItem}>
                <View style={styles.row}>
                  <Text style={styles.label}>Pickup Address:</Text>
                  <Text style={styles.value}>{appointment.pickupAddress}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Vehicle Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Information</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Model:</Text>
                <Text style={styles.value}>{appointment.vehicleInfo?.model || 'N/A'}</Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Color:</Text>
                <Text style={styles.value}>{appointment.vehicleInfo?.color || 'N/A'}</Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Number Plate:</Text>
                <Text style={styles.value}>{appointment.vehicleInfo?.numberPlate || 'N/A'}</Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Kilometer Run:</Text>
                <Text style={styles.value}>
                  {appointment.vehicleInfo?.kilometerRun 
                    ? `${appointment.vehicleInfo.kilometerRun.toLocaleString()} km`
                    : 'N/A'
                  }
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Service Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Service Type:</Text>
            <Text style={[styles.badge, styles.serviceBadge]}>
              {appointment.serviceType || 'Unknown'}
            </Text>
          </View>
        </View>

        {/* Notes */}
        {appointment.vehicleInfo?.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notes}>{appointment.vehicleInfo.notes}</Text>
          </View>
        )}

        {/* Bill Section - Only show if there are bill items */}
        {billItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bill Details</Text>
            
            {/* Bill Header */}
            <View style={styles.billHeader}>
              <Text style={styles.colItem}>Item</Text>
              <Text style={styles.colPrice}>Price</Text>
              <Text style={styles.colServiceCharge}>Service Charge</Text>
              <Text style={styles.colTotal}>Total</Text>
            </View>

            {/* Bill Items */}
            {billItems.map((item) => (
              <View key={item.id} style={styles.billRow}>
                <Text style={styles.colItem}>{item.itemName}</Text>
                <Text style={styles.colPrice}>{formatCurrency(item.itemPrice)}</Text>
                <Text style={styles.colServiceCharge}>
                  {item.serviceCharge ? formatCurrency(item.serviceCharge) : 'Nrs 0.00'}
                </Text>
                <Text style={styles.colTotal}>
                  {formatCurrency(item.itemPrice + (item.serviceCharge || 0))}
                </Text>
              </View>
            ))}

            {/* Totals */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalAmount}>{formatCurrency(calculateSubtotal())}</Text>
            </View>
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Service Charges:</Text>
              <Text style={styles.totalAmount}>{formatCurrency(calculateTotalServiceCharge())}</Text>
            </View>
            
            <View style={[styles.totalRow, styles.grandTotal]}>
              <Text style={styles.totalLabel}>Grand Total:</Text>
              <Text style={styles.totalAmount}>{formatCurrency(calculateGrandTotal())}</Text>
            </View>
          </View>
        )}

        {/* Timeline
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          <View style={styles.timeline}>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, styles.dotCreated]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineEvent}>Appointment Created</Text>
                <Text style={styles.timelineDate}>
                  {appointment.createdAt 
                    ? new Date(appointment.createdAt).toLocaleString()
                    : 'Not available'
                  }
                </Text>
              </View>
            </View>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, styles.dotUpdated]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineEvent}>Last Updated</Text>
                <Text style={styles.timelineDate}>
                  {appointment.updatedAt 
                    ? new Date(appointment.updatedAt).toLocaleString()
                    : 'Not available'
                  }
                </Text>
              </View>
            </View>
          </View>
        </View> */}

        {/* Footer */}
        <Text style={styles.footer}>
          Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
        </Text>
      </Page>
    </Document>
  );
};

export default AppointmentPDF;