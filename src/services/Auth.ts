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
        userId: string;
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
    return { error: err.response?.data?.error || err.response?.data?.message || 'Signup failed' };
  }
};



export const Login = async (formData: AuthPayload): Promise<AuthResponse> => {
  try {
    console.log('=== LOGIN DEBUG START ===');
    console.log('1. Login endpoint URL:', `${axiosInstance.defaults.baseURL}/auth/login`);
    console.log('2. Request data:', { email: formData.email, password: '***HIDDEN***' });
    console.log('3. Axios instance config:', {
      baseURL: axiosInstance.defaults.baseURL,
      headers: axiosInstance.defaults.headers
    });
    
    const response = await axiosInstance.post('/auth/login', formData);
    
    console.log('4. Response received:', response);
    console.log('5. Response status:', response.status);
    console.log('6. Response data:', response.data);
    
    const data: AuthResponse = response.data;

    if(data.token && data.user){
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user.userId);
      localStorage.setItem('userName', data.user.name);
      localStorage.setItem('userEmail', data.user.email);
      console.log('7. Token saved successfully');
    }
    
    console.log('=== LOGIN DEBUG END ===');
    return data;
  } catch (err: any) {
    console.log('=== ERROR DEBUG START ===');
    console.log('Error object:', err);
    console.log('Error message:', err.message);
    console.log('Error code:', err.code);
    console.log('Error response:', err.response);
    console.log('Error config:', err.config);
    
    if (err.response) {
      // Server responded with error status
      console.log('Error response status:', err.response.status);
      console.log('Error response data:', err.response.data);
      console.log('Error response headers:', err.response.headers);
      
      if (err.response.data.error && err.response.data.error.includes('verify your email')) {
        return { error: err.response.data.error };
      }
      return err.response.data;
    } else if (err.request) {
      // Request was made but no response received
      console.log('No response received. Request details:', err.request);
      return { error: `Network error: No response from server. Make sure backend is running at ${axiosInstance.defaults.baseURL}` };
    } else {
      // Something else happened
      console.log('Error setting up request:', err.message);
      return { error: err.message || 'Login failed' };
    }
  }
};