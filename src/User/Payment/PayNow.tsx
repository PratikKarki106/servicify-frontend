// servicify-frontend/src/User/Payment/PayNow.tsx

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';
import khalti from '../../assets/khalti.png';
import './PayNow.css';
import { initiatePayment } from '../../services/paymentService';

interface PayNowProps {
  isOpen: boolean;
  onClose: () => void;
  paymentType: 'appointment' | 'package';
  itemId: string | number | undefined;      // appointmentId or packageId
  amount: number | undefined;
  itemName?: string;
  onPaymentSuccess?: (referenceId: string) => void;
}

const PayNow: React.FC<PayNowProps> = ({
  isOpen,
  onClose,
  paymentType,
  itemId,
  amount,
  itemName,
  onPaymentSuccess
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when overlay is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedMethod('');
      setIsProcessing(false);
      setError(null);
    }
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
    setError(null);
  };

  const handleContinue = async () => {
    if (!selectedMethod) return;

    if (selectedMethod === 'khalti') {
      setIsProcessing(true);
      setError(null);

      try {
        // Validate itemId and amount before proceeding
        if (!itemId || amount === undefined || amount <= 0) {
          setError('Invalid payment details');
          setIsProcessing(false);
          return;
        }

        console.log('Initiating payment with:', { paymentType, itemId, amount });

        const result = await initiatePayment(paymentType, itemId, amount);

        if (result.success && result.paymentUrl) {
          // Store current payment info in sessionStorage for after redirect
          sessionStorage.setItem('pendingPayment', JSON.stringify({
            pidx: result.pidx,
            purchaseOrderId: result.purchaseOrderId,
            paymentType,
            itemId
          }));

          // Redirect to Khalti payment page
          window.location.href = result.paymentUrl;
        } else {
          setError(result.error || 'Failed to initiate payment');
          setIsProcessing(false);
        }
      } catch (err) {
        console.error('Payment error:', err);
        setError('An unexpected error occurred');
        setIsProcessing(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="paynow-overlay" onClick={handleOverlayClick}>
      <div className="paynow-container">
        <div className="paynow-header">
          <h3>Complete Payment</h3>
          <button className="paynow-close-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="paynow-content">
          <div className="paynow-heading">
            <h3>Please choose your payment method</h3>
          </div>

          {error && (
            <div className="paynow-error">
              {error}
            </div>
          )}

          <div className="paynow-methods">
            {/* Khalti Payment Option */}
            <div
              className={`paynow-method-item ${selectedMethod === 'khalti' ? 'selected' : ''}`}
              onClick={() => handleMethodSelect('khalti')}
            >
              <div className="paynow-radio">
                <div className={`paynow-radio-dot ${selectedMethod === 'khalti' ? 'selected' : ''}`}></div>
              </div>
              <div className="paynow-method-icon">
                <img src={khalti} alt="Khalti" />
              </div>
              <div className="paynow-method-label">
                Pay with Khalti
              </div>
            </div>

            {/* You can add more payment methods here */}
          </div>

          <div className="paynow-details">
            <div className="paynow-item">
              <span>Item:</span>
              <strong>{itemName || (paymentType === 'appointment' ? 'Appointment' : 'Package')}</strong>
            </div>
            <div className="paynow-amount">
              <span>Amount:</span>
              <strong>Rs. {amount !== undefined ? amount.toFixed(2) : '0.00'}</strong>
            </div>
          </div>
        </div>

        <div className="paynow-footer">
          <button
            className="paynow-continue-btn"
            onClick={handleContinue}
            disabled={!selectedMethod || isProcessing}
          >
            {isProcessing ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin /> Processing...
              </>
            ) : (
              'Continue'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayNow;