import axiosInstance from './axiosInstance';

interface AuthPayload {
    name?: string;
    email: string;
    password: string;
    role?: 'user' | 'admin';
}

interface AuthResponse {
    token?: string;
    user?: {
        id: string;
        name: string;
        email: string;
        role?: 'user' | 'admin';
    };
    message?: string;
    error?: string;
}

export const Register = async (formData: AuthPayload): Promise<AuthResponse> => {
  try {
    const response = await axiosInstance.post('/auth/signup', formData);
    return response.data;
  } catch (err: any) {
    return { error: err.response?.data?.error || 'Signup failed' };
  }
};



export const Login = async (formData: AuthPayload): Promise<AuthResponse> => {
  try {
    const response = await axiosInstance.post('/auth/login', formData);
    return response.data;
  } catch (err: any) {
    if (err.response && err.response.data) {
      // err.response.data may already contain { error: '...' } or { message: '...' }
      return err.response.data;
    }
    return { error: err.message || 'Login failed' };
  }
};

