import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faCalendarCheck,
  faGift,
  faHistory,
  faExclamationTriangle,
  faCreditCard
} from '@fortawesome/free-solid-svg-icons';

interface Activity {
  id: number;
  type: 'completed' | 'confirmed' | 'package' | 'reminder' | 'payment';
  icon: any;
  message: string;
  time: string;
}

const RecentActivities: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch activities data
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        // In real app, fetch from API
        // const response = await fetch('/api/activities/recent');
        // const data = await response.json();
        
        // Mock data
        const mockActivities: Activity[] = [
          {
            id: 1,
            type: 'completed',
            icon: faCheckCircle,
            message: 'Oil change service completed for Yamaha MT-15',
            time: '2 hours ago'
          },
          {
            id: 2,
            type: 'confirmed',
            icon: faCalendarCheck,
            message: 'Brake service booking confirmed for Jan 20',
            time: '1 day ago'
          },
          {
            id: 3,
            type: 'package',
            icon: faGift,
            message: 'Purchased Basic Service Package',
            time: '3 days ago'
          },
          {
            id: 4,
            type: 'reminder',
            icon: faExclamationTriangle,
            message: 'Oil change reminder set for Feb 15',
            time: '4 days ago'
          },
          {
            id: 5,
            type: 'payment',
            icon: faCreditCard,
            message: 'Payment of ₹2,500 received for service',
            time: '5 days ago'
          }
        ];
        setActivities(mockActivities);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const getActivityIconClass = (type: string) => {
    switch (type) {
      case 'completed':
        return 'completed';
      case 'confirmed':
        return 'confirmed';
      case 'package':
        return 'package';
      case 'reminder':
        return 'reminder';
      case 'payment':
        return 'payment';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="userdashboard-section activities-section">
        <div className="userdashboard-section-header">
          <h2><FontAwesomeIcon icon={faHistory} /> Recent Activities</h2>
        </div>
        <div className="loading-spinner">Loading activities...</div>
      </div>
    );
  }

  return (
    <div className="userdashboard-section activities-section">
      <div className="userdashboard-section-header">
        <h2><FontAwesomeIcon icon={faHistory} /> Recent Activities</h2>
      </div>
      <div className="userdashboard-activities">
        {activities.map(activity => (
          <div key={activity.id} className="userdashboard-activity">
            <div className={`userdashboard-activity-icon ${getActivityIconClass(activity.type)}`}>
              <FontAwesomeIcon icon={activity.icon} />
            </div>
            <div className="userdashboard-activity-content">
              <p>{activity.message}</p>
              <span className="userdashboard-activity-time">{activity.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivities;