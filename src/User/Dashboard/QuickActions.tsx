import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarPlus,
  faMapMarkerAlt,
  faHistory,
  faShieldAlt,
  faTachometerAlt
} from '@fortawesome/free-solid-svg-icons';

interface QuickActionsProps {
  onBookService: () => void;
  onTrackService: () => void;
  onViewHistory: () => void;
  onEmergencyService: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onBookService,
  onTrackService,
  onViewHistory,
  onEmergencyService
}) => {
  return (
    <div className="userdashboard-section quick-actions-section">
      <div className="userdashboard-section-header">
        <h2><FontAwesomeIcon icon={faTachometerAlt} /> Quick Actions</h2>
      </div>
      <div className="userdashboard-quick-actions">
        <button 
          className="userdashboard-quick-action-btn"
          onClick={onBookService}
        >
          <FontAwesomeIcon icon={faCalendarPlus} />
          <span>Book Service</span>
        </button>
        <button 
          className="userdashboard-quick-action-btn"
          onClick={onTrackService}
        >
          <FontAwesomeIcon icon={faMapMarkerAlt} />
          <span>Track Service</span>
        </button>
        <button 
          className="userdashboard-quick-action-btn"
          onClick={onViewHistory}
        >
          <FontAwesomeIcon icon={faHistory} />
          <span>Service History</span>
        </button>
        <button 
          className="userdashboard-quick-action-btn"
          onClick={onEmergencyService}
        >
          <FontAwesomeIcon icon={faShieldAlt} />
          <span>Emergency Service</span>
        </button>
      </div>
    </div>
  );
};

export default QuickActions;