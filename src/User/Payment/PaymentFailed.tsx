import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faHome, faRotateRight } from '@fortawesome/free-solid-svg-icons';
import './PaymentFailed.css';

const PaymentFailed: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const error = searchParams.get('error') || 'Payment failed';

  const handleGoHome = () => {
    navigate('/user/dashboard');
  };

  const handleTryAgain = () => {
    window.location.reload();
  };

  return (
    <div className="payment-failed-container">
      <div className="payment-failed-card">
        <div className="failed-icon">
          <FontAwesomeIcon icon={faExclamationTriangle} />
        </div>
        <h2>Payment Failed</h2>
        <p className="error-message">{error}</p>
        <p className="error-subtitle">
          Don't worry, you haven't been charged. Please try again or contact support if the issue persists.
        </p>
        
        <div className="action-buttons">
          <button className="btn btn-secondary" onClick={handleGoHome}>
            <FontAwesomeIcon icon={faHome} /> Go Home
          </button>
          <button className="btn btn-primary" onClick={handleTryAgain}>
            <FontAwesomeIcon icon={faRotateRight} /> Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
