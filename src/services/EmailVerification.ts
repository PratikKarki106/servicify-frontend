import axiosInstance from './axiosInstance';

interface EmailVerificationRequest {
  email: string;
}

interface EmailVerificationResponse {
  success: boolean;
  message?: string;
  error?: string;
}

interface VerifyPinRequest {
  email: string;
  pin: string;
}

interface VerifyPinResponse {
  success: boolean;
  message?: string;
  error?: string;
  resetToken?: string; // This might be used for session management after verification
}

export const EmailVerificationService = {
  requestVerification: async (data: EmailVerificationRequest): Promise<EmailVerificationResponse> => {
    try {
      const response = await axiosInstance.post('/auth/request-verification', data);
      return response.data;
    } catch (err: any) {
      return { 
        success: false, 
        error: err.response?.data?.message || err.response?.data?.error || 'Failed to send verification email' 
      };
    }
  },

  verifyPin: async (data: VerifyPinRequest): Promise<VerifyPinResponse> => {
    try {
      const response = await axiosInstance.post('/auth/verify-email', data);
      return response.data;
    } catch (err: any) {
      return { 
        success: false, 
        error: err.response?.data?.message || err.response?.data?.error || 'Failed to verify PIN' 
      };
    }
  },

  resendVerification: async (data: EmailVerificationRequest): Promise<EmailVerificationResponse> => {
    try {
      const response = await axiosInstance.post('/auth/resend-verification', data);
      return response.data;
    } catch (err: any) {
      return { 
        success: false, 
        error: err.response?.data?.message || err.response?.data?.error || 'Failed to resend verification email' 
      };
    }
  }
};