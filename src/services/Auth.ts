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
    const response = await axiosInstance.post('/auth/login', formData);
    const data: AuthResponse = response.data;
    console.log(data);
    console.log(response);

    if(data.token && data.user){
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user.userId);
      localStorage.setItem('userName', data.user.name);
      localStorage.setItem('userEmail', data.user.email);
    }
    return data;
  } catch (err: any) {
    if (err.response && err.response.data) {
      // Handle specific email verification error
      if (err.response.data.error && err.response.data.error.includes('verify your email')) {
        return { error: err.response.data.error };
      }
      return err.response.data;
    }
    return { error: err.message || 'Login failed' };
  }
};

