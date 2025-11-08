// servicify-frontend/src/pages/PaymentFailed.tsx

import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';

const PaymentFailed: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Payment failed:', searchParams.toString());
  }, [searchParams]);

  const error = searchParams.get('error') || 'Payment could not be processed';

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <FontAwesomeIcon icon={faTimesCircle} size="3x" style={styles.icon} />
        <h2 style={styles.title}>Payment Failed ❌</h2>
        <p style={styles.error}>{error}</p>
        <p style={styles.text}>Please try again or contact support if the problem persists.</p>

        <div style={styles.buttonGroup}>
          <button
            onClick={() => navigate(-1)}
            style={styles.retryButton}
          >
            Try Again
          </button>
          <button
            onClick={() => navigate('/user/dashboard')}
            style={styles.dashboardButton}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '60px 40px',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    maxWidth: '500px',
    width: '100%'
  },
  icon: {
    color: '#d32f2f',
    marginBottom: '20px'
  },
  title: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '16px'
  },
  error: {
    fontSize: '16px',
    color: '#d32f2f',
    fontWeight: '500',
    marginBottom: '12px'
  },
  text: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '32px'
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center'
  },
  retryButton: {
    padding: '12px 24px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  dashboardButton: {
    padding: '12px 24px',
    backgroundColor: '#f5f5f5',
    color: '#1a1a1a',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  }
};

export default PaymentFailed;
