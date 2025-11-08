// servicify-frontend/src/pages/PaymentSuccess.tsx

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { verifyPayment } from '../services/paymentService';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyTransaction = async () => {
      try {
        setVerifying(true);

        // Get parameters from URL
        const transactionUuid = searchParams.get('transaction_uuid');
        const totalAmount = searchParams.get('total_amount');
        const productCode = searchParams.get('product_code');
        const type = searchParams.get('type') || 'unknown';
        const id = searchParams.get('id');
        const gateway = searchParams.get('gateway') || 'esewa';

        console.log('Payment success params:', {
          transactionUuid,
          totalAmount,
          productCode,
          type,
          id,
          gateway
        });

        // For eSewa, verify the transaction with backend
        if (gateway === 'esewa' && transactionUuid) {
          const result = await verifyPayment(transactionUuid, transactionUuid);

          if (result.success && result.status === 'completed') {
            setVerified(true);
            // Redirect to relevant page after 3 seconds
            setTimeout(() => {
              if (type === 'appointment') {
                navigate(`/user/history/${id}`);
              } else if (type === 'package') {
                navigate('/user/packages');
              } else if (type === 'purchase') {
                navigate('/user/purchases');
              } else {
                navigate('/user/dashboard');
              }
            }, 3000);
          } else {
            setError('Payment verification failed');
            setVerified(false);
          }
        } else {
          // For other gateways or if transaction_uuid not present
          setVerified(true);
          setTimeout(() => {
            if (type === 'appointment') {
              navigate(`/user/history/${id}`);
            } else if (type === 'package') {
              navigate('/user/packages');
            } else if (type === 'purchase') {
              navigate('/user/purchases');
            } else {
              navigate('/user/dashboard');
            }
          }, 3000);
        }
      } catch (err) {
        console.error('Verification error:', err);
        setError('An error occurred during verification');
        setVerified(false);
      } finally {
        setVerifying(false);
      }
    };

    verifyTransaction();
  }, [searchParams, navigate]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {verifying ? (
          <>
            <FontAwesomeIcon icon={faSpinner} spin size="3x" style={styles.spinner} />
            <h2 style={styles.title}>Verifying Payment...</h2>
            <p style={styles.text}>Please wait while we confirm your transaction</p>
          </>
        ) : verified ? (
          <>
            <FontAwesomeIcon icon={faCheckCircle} size="3x" style={styles.success} />
            <h2 style={styles.title}>Payment Successful! 🎉</h2>
            <p style={styles.text}>Your payment has been received and confirmed.</p>
            <p style={styles.redirect}>Redirecting you to dashboard...</p>
          </>
        ) : (
          <>
            <FontAwesomeIcon icon={faCheckCircle} size="3x" style={styles.warning} />
            <h2 style={styles.title}>Payment Status</h2>
            <p style={styles.error}>{error || 'Unable to verify payment status'}</p>
            <button
              onClick={() => navigate('/user/dashboard')}
              style={styles.button}
            >
              Go to Dashboard
            </button>
          </>
        )}
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
  spinner: {
    color: '#4CAF50',
    marginBottom: '20px'
  },
  success: {
    color: '#4CAF50',
    marginBottom: '20px'
  },
  warning: {
    color: '#ff9800',
    marginBottom: '20px'
  },
  title: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '12px'
  },
  text: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '8px'
  },
  redirect: {
    fontSize: '14px',
    color: '#999',
    marginTop: '20px',
    fontStyle: 'italic'
  },
  error: {
    fontSize: '16px',
    color: '#d32f2f',
    marginBottom: '24px'
  },
  button: {
    padding: '12px 32px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '20px'
  }
};

export default PaymentSuccess;
