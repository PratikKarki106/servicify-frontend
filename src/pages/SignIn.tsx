import './SignIn.css';
import Logo from "../assets/Servicify.png";
import GoogleLogo from '../assets/GoogleImage.png';
import Bubble from '../assets/Bubble.png';
import SignInImage from '../assets/SignInImage.png';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Login } from '../services/Auth';
import { BASE_URL } from '../services/axiosInstance';

const SignIn: React.FC = () => {
  const navigation = useNavigate();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);


  const PasswordSee = () => {
    setShowPassword(!showPassword);
  };


  const handleGoogleLogin = () => {
    window.location.href = `${BASE_URL}/auth/google`;
  };

  // Handle login
  const handleLogin = async () => {
    // Validate inputs
    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }

    // Trim inputs to avoid accidental leading/trailing spaces
    const payload = { email: email.trim(), password: password.trim() };
    console.log('Attempting login with:', payload);
    const result = await Login(payload);
    console.log('Login response:', result);

    if (result.error) {
      console.error('Login error:', result.error);

      // Check if the error is about email verification
      if (result.error.includes('verify your email') || result.error.includes('Please verify your email')) {
        alert(`Email Verification Required: ${result.error}\n\nPlease check your email for the verification code.`);
        // Optionally redirect to verify email page if user has already signed up
        const verificationEmail = localStorage.getItem('verificationEmail');
        if (verificationEmail) {
          navigation('/user/verify-email');
        }
      } else {
        alert(`Login Failed: ${result.error}`);
      }
      return;
    }

    if (!result.token) {
      console.error('No token in response:', result);
      alert('Login failed: No authentication token received');
      return;
    }

    localStorage.setItem('token', result.token);

    // If backend provides a role or this specific admin email, navigate to admin
    const isAdminByRole = result.user?.role === 'admin';
    const isAdminByEmail = result.user?.email === 'heyt03279@gmail.com';

    if (isAdminByRole || isAdminByEmail) {
      // Navigate to admin home
      navigation('/admin');
    } else {
      navigation('/user/dashboard');
    }
  };

  // Navigate to signup
  const handleSignUp = () => {
    navigation('/signup');
  };

  return (
    <div className="signin-container">
      {/* Left half container for signing in */}
      <div className="signin-left">
        <img src={Logo} alt="Servicify Logo" className="signin-logo" />

        <h1 className="signin-title">SIGN IN</h1>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <div className="password-input-container">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className='password-see'
              onClick={PasswordSee}
              aria-label={showPassword ? 'Hide Password' : 'Show Password'}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>
        <button className="signup-link" onClick={() => navigation('/user/Email')}>
          <u>Forgot Password?</u>
        </button>{" "}

        <div className="Sign-option">
          <button className="signin-btn" onClick={handleLogin}>Sign In</button>
          <p>Or</p>
          <button className="google-btn" onClick={handleGoogleLogin}>
            <img src={GoogleLogo} alt="Google" />
          </button>
        </div>

        <p className="signup-text">
          Don’t have an account?{" "}
          <button className="signup-link" onClick={handleSignUp}>
            <u>Sign Up</u>
          </button>{" "}
          now
        </p>
      </div>

      {/* Right half container for signing in */}
      <div className="signin-right">
        <img src={Bubble} className="Bubble" alt="Bubble" />
        <img src={SignInImage} alt="Sign In Illustration" className="signin-image" />
      </div>
    </div>
  );
};

export default SignIn;