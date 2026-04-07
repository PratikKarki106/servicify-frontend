import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import type { ServiceReminder } from '../../types/dashboardTypes';

interface ServiceRemindersProps {
  // No props needed now
}

const ServiceReminders: React.FC<ServiceRemindersProps> = () => {
  const [reminders, setReminders] = useState<ServiceReminder[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch reminders data
  useEffect(() => {
    const fetchReminders = async () => {
      try {
        setLoading(true);
        const mockReminders: ServiceReminder[] = [
          {
            id: 'R001',
            type: 'Oil Change',
            dueDate: '2024-01-30',
            message: 'Oil change due for Yamaha MT-15',
            priority: 'high'
          },
          {
            id: 'R002',
            type: 'Chain Maintenance',
            dueDate: '2024-02-10',
            message: 'Chain cleaning and lubrication required',
            priority: 'medium'
          },
          {
            id: 'R003',
            type: 'Tire Inspection',
            dueDate: '2024-02-28',
            message: 'Tire pressure check needed',
            priority: 'low'
          }
        ];
        setReminders(mockReminders);
      } catch (error) {
        console.error('Error fetching reminders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReminders();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#9E9E9E';
    }
  };

  if (loading) {
    return (
      <div className="userdashboard-section reminders-section">
        <div className="userdashboard-section-header">
          <h2><FontAwesomeIcon icon={faExclamationTriangle} /> Service Reminders</h2>
        </div>
        <div className="loading-spinner">Loading reminders...</div>
      </div>
    );
  }

  return (
    <div className="userdashboard-section reminders-section">
      <div className="userdashboard-section-header">
        <h2><FontAwesomeIcon icon={faExclamationTriangle} /> Service Reminders</h2>
      </div>
      <div className="userdashboard-reminders">
        {reminders.map(reminder => (
          <div key={reminder.id} className="userdashboard-reminder-card">
            <div className="userdashboard-reminder-icon">
              <FontAwesomeIcon 
                icon={faExclamationTriangle} 
                style={{ color: getPriorityColor(reminder.priority) }} 
              />
            </div>
            <div className="userdashboard-reminder-content">
              <h4>{reminder.type}</h4>
              <p>{reminder.message}</p>
              <div className="userdashboard-reminder-footer">
                <span className="userdashboard-reminder-date">
                  Due: {formatDate(reminder.dueDate)}
                </span>
                <span 
                  className="userdashboard-reminder-priority"
                  style={{ backgroundColor: getPriorityColor(reminder.priority) }}
                >
                  {reminder.priority.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceReminders;