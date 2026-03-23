// servicify-frontend/src/services/paymentService.ts

import axiosInstance from './axiosInstance';

export interface InitiatePaymentResponse {
  success: boolean;
  paymentUrl?: string;
  pidx?: string;
  purchaseOrderId?: string;
  error?: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  status?: string;
  paymentType?: 'appointment' | 'package';
  referenceId?: string;
  error?: string;
}

// Initiate payment (for both appointment and package)
export const initiatePayment = async (
  paymentType: 'appointment' | 'package',
  itemId: string | number,
  amount: number
): Promise<InitiatePaymentResponse> => {
  try {
    const token = localStorage.getItem('token');
    console.log('Payment token:', token ? 'Token exists' : 'No token');
    console.log('Payment request:', { paymentType, itemId, amount });
    
    const response = await axiosInstance.post('/payment/initiate', {
      paymentType,
      itemId,
      amount
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

// Verify payment status after callback
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