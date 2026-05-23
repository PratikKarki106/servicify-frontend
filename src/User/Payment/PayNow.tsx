// servicify-frontend/src/User/Payment/PayNow.tsx

import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import Modal from '../../components/Modal';
import khalti from '../../assets/khalti.png';
import esewa from '../../assets/esewa.png';
import './PayNow.css';
import { initiatePayment } from '../../services/paymentService';
import RedeemSelector from '../Loyalty/RedeemSelector';
import PointsEarnedBadge from '../Loyalty/PointsEarnedBadge';

interface PayNowProps {
  isOpen: boolean;
  onClose: () => void;
  paymentType: 'appointment' | 'package' | 'purchase';
  itemId: string | number | undefined;
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
  const [redemptionSummary, setRedemptionSummary] = useState<{ pointsUsed: number; discountApplied: number } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const baseAmount = amount || 0;
  const appliedDiscount = Math.min(redemptionSummary?.discountApplied || 0, baseAmount);
  const payableAmount = Math.max(0, baseAmount - appliedDiscount);

  useEffect(() => {
    if (isOpen) {
      setSelectedMethod('');
      setIsProcessing(false);
      setError(null);
      setRedemptionSummary(null);
    }
  }, [isOpen]);

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
    setError(null);
  };

  /**
   * Submit eSewa v2 form to payment gateway
   * eSewa v2 API requires form submission with specific fields
   */
  const submitEsewaForm = (payload: any, actionUrl: string) => {
    try {
      console.log('Submitting eSewa v2 form to:', actionUrl, 'with payload:', payload);
      
      // Create hidden form
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = actionUrl || 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
      form.style.display = 'none';

      // Add all required fields to form
      Object.keys(payload).forEach(key => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = payload[key];
        form.appendChild(input);
      });

      // Append to body and submit
      document.body.appendChild(form);
      console.log('eSewa form submitted to:', form.action);
      form.submit();

      // Clean up
      document.body.removeChild(form);
    } catch (err) {
      console.error('eSewa form submission error:', err);
      setError('Failed to submit payment form');
      setIsProcessing(false);
    }
  };

  const handleContinue = async () => {
    if (!selectedMethod) return;

    if (!itemId || amount === undefined || amount <= 0) {
      setError('Invalid payment details');
      return;
    }

    console.log('Initiating payment:', { paymentType, itemId, payableAmount, selectedMethod });

    setIsProcessing(true);
    setError(null);

    try {
      const result = await initiatePayment(
        paymentType,
        itemId,
        payableAmount,
        appliedDiscount,
        selectedMethod
      );

      if (!result.success) {
        setError(result.error || 'Failed to initiate payment');
        setIsProcessing(false);
        return;
      }

      if (selectedMethod === 'khalti') {
        // Khalti: Store payment info and redirect to Khalti
        if (result.paymentUrl) {
          sessionStorage.setItem('pendingPayment', JSON.stringify({
            pidx: result.pidx,
            purchaseOrderId: result.purchaseOrderId,
            paymentType,
            itemId
          }));
          window.location.href = result.paymentUrl;
        } else {
          setError('Payment URL not received from server');
          setIsProcessing(false);
        }
      } else if (selectedMethod === 'esewa') {
        // eSewa v2 API: Submit form directly to eSewa endpoint
        if (result.esewaPayload && result.esewaFormEndpoint) {
          console.log('eSewa payload received:', result.esewaPayload);

          // Store transaction info for tracking
          sessionStorage.setItem('pendingEsewaPayment', JSON.stringify({
            transactionUuid: result.transactionUuid,
            purchaseOrderId: result.purchaseOrderId,
            paymentType,
            itemId,
            amount: payableAmount
          }));

          // Submit form to eSewa (user will be redirected by eSewa after payment)
          submitEsewaForm(result.esewaPayload, result.esewaFormEndpoint);
        } else {
          setError('eSewa form data not received from server');
          setIsProcessing(false);
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('An unexpected error occurred');
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Complete Payment"
      maxWidth="600px"
      footer={
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
      }
    >
      <div className="paynow-container">
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

            {/* eSewa Payment Option */}
            <div
              className={`paynow-method-item ${selectedMethod === 'esewa' ? 'selected' : ''}`}
              onClick={() => handleMethodSelect('esewa')}
            >
              <div className="paynow-radio">
                <div className={`paynow-radio-dot ${selectedMethod === 'esewa' ? 'selected' : ''}`}></div>
              </div>
              <div className="paynow-method-icon">
                <img src={esewa} alt="eSewa" />
              </div>
              <div className="paynow-method-label">
                Pay with eSewa
              </div>
            </div>
          </div>

          <div className="paynow-details">
            <div className="paynow-item">
              <span>Item:</span>
              <strong>{
                itemName ||
                (paymentType === 'appointment'
                  ? 'Appointment'
                  : paymentType === 'package'
                    ? 'Package'
                    : 'Purchase')
              }</strong>
            </div>
            <div className="paynow-amount">
              <span>Original Amount:</span>
              <strong>Rs. {baseAmount.toFixed(2)}</strong>
            </div>
            <div className="paynow-amount">
              <span>Discount:</span>
              <strong>Rs. {appliedDiscount.toFixed(2)}</strong>
            </div>
            <div className="paynow-amount">
              <span>Payable Amount:</span>
              <strong>Rs. {payableAmount.toFixed(2)}</strong>
            </div>
            {!!baseAmount && <PointsEarnedBadge totalExpenditure={baseAmount} redeemedValue={appliedDiscount} />}
            {itemId && (
              <RedeemSelector
                orderId={itemId}
                onRedeemed={(summary) => setRedemptionSummary(summary)}
              />
            )}
            {redemptionSummary && (
              <p className="paynow-redemption-summary">
                You saved Rs. {redemptionSummary.discountApplied} using {redemptionSummary.pointsUsed} points
              </p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PayNow;
