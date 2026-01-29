// src/services/ForgotPassword.ts
import axiosInstance from './axiosInstance'; // Use your existing instance

// Types (same as before)
export interface RequestPinData {
  email: string;
}

export interface VerifyPinData {
  email: string;
  pin: string;
}

export interface ResetPasswordData {
  email: string;
  resetToken: string;
  newPassword: string;
}

export interface ResendPinData {
  email: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  resetToken?: string;
}

// Service Functions
export const ForgotPasswordService = {
  // 1. Request PIN (Email → Send PIN)
  requestPin: async (data: RequestPinData): Promise<ApiResponse> => {
    try {
      const response = await axiosInstance.post<ApiResponse>('/forgot-password/request-pin', data);
      return response.data;
    } catch (error: any) {
      console.error('Request PIN error:', error);

      if (error.response?.status === 429) {
        return {
          success: false,
          message: 'Too many requests. Please try again later.'
        };
      }
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send PIN. Please try again.'
      };
    }
  },

  // 2. Verify PIN (PIN → Verify)
  verifyPin: async (data: VerifyPinData): Promise<ApiResponse> => {
    try {
      const response = await axiosInstance.post<ApiResponse>('/forgot-password/verify-pin', data);
      return response.data;
    } catch (error: any) {
      console.error('Verify PIN error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to verify PIN. Please try again.'
      };
    }
  },

  // 3. Reset Password (Token + New Password → Reset)
  resetPassword: async (data: ResetPasswordData): Promise<ApiResponse> => {
    try {
      const response = await axiosInstance.post<ApiResponse>('/forgot-password/reset-password', data);
      return response.data;
    } catch (error: any) {
      console.error('Reset password error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to reset password. Please try again.'
      };
    }
  },

  // 4. Resend PIN (Optional)
  resendPin: async (data: ResendPinData): Promise<ApiResponse> => {
    try {
      const response = await axiosInstance.post<ApiResponse>('/forgot-password/resend-pin', data);
      return response.data;
    } catch (error: any) {
      console.error('Resend PIN error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to resend PIN. Please try again.'
      };
    }
  }
};

// Optional: Custom hook for Forgot Password flow (same as before)
import { useState } from 'react';

export const useForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestPin = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await ForgotPasswordService.requestPin({ email });
      if (!result.success) {
        setError(result.message);
      }
      return result;
    } catch (error: any) {
      setError('Network error. Please check your connection.');
      return { success: false, message: 'Network error' };
    } finally {
      setLoading(false);
    }
  };

  const verifyPin = async (email: string, pin: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await ForgotPasswordService.verifyPin({ email, pin });
      if (!result.success) {
        setError(result.message);
      }
      return result;
    } catch (error: any) {
      setError('Network error. Please check your connection.');
      return { success: false, message: 'Network error' };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string, resetToken: string, newPassword: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await ForgotPasswordService.resetPassword({ email, resetToken, newPassword });
      if (!result.success) {
        setError(result.message);
      }
      return result;
    } catch (error: any) {
      setError('Network error. Please check your connection.');
      return { success: false, message: 'Network error' };
    } finally {
      setLoading(false);
    }
  };

  const resendPin = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await ForgotPasswordService.resendPin({ email });
      if (!result.success) {
        setError(result.message);
      }
      return result;
    } catch (error: any) {
      setError('Network error. Please check your connection.');
      return { success: false, message: 'Network error' };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    requestPin,
    verifyPin,
    resetPassword,
    resendPin,
    clearError: () => setError(null)
  };
};

export default ForgotPasswordService;