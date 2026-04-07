import './SignIn.css';
import Logo from "../assets/Servicify.png";
import GoogleLogo from '../assets/GoogleImage.png';
import Bubble from '../assets/Bubble.png';
import SignInImage from '../assets/SignUpImage.png';

// API function
import { Register } from '../services/Auth';

import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FaEyeSlash, FaEye } from 'react-icons/fa';


const SignUp: React.FC = () => {
  //Navigation
  const navigation = useNavigate();

  // form state
  const [name, setname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);


  const PasswordSee = () => {
    setShowPassword(!showPassword);
  };
  //oauth
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google";
  };

//manual login
  const handleSignUp = async () => {
    const result = await Register({name, email, password});
    if (result.error) {
      alert(`Sign Up Failed: ${result.error}`);
      return;
    }
    
    // Store email in localStorage for verification
    localStorage.setItem('verificationEmail', email);
    navigation('/user/verify-email');
  }

  return (
    <div className="signin-container">
      {/* Left half container for signing in */}
      <div className="signup-left">
        <img src={Logo} alt="Servicify Logo" className="signin-logo" />

        <h1 className="signin-title">SIGN UP</h1>

        <div className="form-group">
          <label htmlFor="name">Full Name:</label>
          <input
            type="name"
            id="name"
            name="name"
            placeholder="Enter your full Name"
            value={name}
            onChange={(e) => setname(e.target.value)}
          />
        </div>
        
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
          <div>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className='password-see1'
              onClick={PasswordSee}
              aria-label={showPassword ? 'Hide Password' : 'Show Password'}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        <div className="Sign-option">
          <button className="signin-btn" onClick={handleSignUp}>Sign Up</button>
          <p>Or</p>
          <button className="google-btn" onClick={handleGoogleLogin}>
            <img src={GoogleLogo} alt="Google" />
          </button>
        </div>

        <p className="signup-text">
          Already have an account?{" "}
          <button className="signup-link" onClick={() => navigation('/signin')}>
            <u>Sign In</u>
          </button>{" "}
          now
        </p>
      </div>

      {/* Right half container for signing in */}
      <div className="signin-right">
        <img
          src={Bubble}
          className="Bubble"
          alt="Bubble"
        />
        <img
          src={SignInImage}
          alt="Sign In Illustration"
          className="signin-image"
        />
      </div>
    </div>
  );
};

export default SignUp;