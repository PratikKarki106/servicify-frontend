// servicify-frontend/src/services/paymentService.ts

import axiosInstance from './axiosInstance';

export interface EsewaFormPayload {
  amount: string;
  tax_amount: string;
  product_service_charge: string;
  product_delivery_charge: string;
  total_amount: string;
  transaction_uuid: string;
  product_code: string;
  success_url: string;
  failure_url: string;
  signed_field_names: string;
  signature: string;
}

export interface InitiatePaymentResponse {
  success: boolean;
  paymentUrl?: string;
  pidx?: string;
  purchaseOrderId?: string;
  esewaPayload?: EsewaFormPayload;
  esewaFormEndpoint?: string;
  transactionUuid?: string;
  error?: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  status?: string;
  paymentType?: 'appointment' | 'package' | 'purchase';
  referenceId?: string;
  error?: string;
}

// Initiate payment (for both appointment and package)
export const initiatePayment = async (
  paymentType: 'appointment' | 'package' | 'purchase',
  itemId: string | number,
  amount: number,
  redeemedValue: number = 0,
  gateway: string = 'khalti'
): Promise<InitiatePaymentResponse> => {
  try {
    const token = localStorage.getItem('token');
    console.log('Payment token:', token ? 'Token exists' : 'No token');
    console.log('Payment request:', { paymentType, itemId, amount, redeemedValue, gateway });

    const response = await axiosInstance.post('/payment/initiate', {
      paymentType,
      itemId,
      amount,
      redeemedValue,
      gateway
    });
    return response.data;
  } catch (error: any) {
    console.error('Payment error:', error.response?.data);
    return {
      success: false,
      error: error.response?.data?.error || error.response?.data?.message || 'Payment initiation failed'
    };
  }
};

// Verify payment status after callback (works for both Khalti and eSewa)
export const verifyPayment = async (
  pidx: string,
  purchaseOrderId?: string
): Promise<VerifyPaymentResponse> => {
  try {
    const response = await axiosInstance.post('/payment/verify', {
      pidx,
      purchaseOrderId
    });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || 'Payment verification failed'
    };
  }
};

// Get payment history
export const getPaymentHistory = async (page: number = 1, limit: number = 10) => {
  try {
    const response = await axiosInstance.get(`/payment/history?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to fetch payment history'
    };
  }
};
