import './SignIn.css';
import Logo from "../assets/Servicify.png";
import GoogleLogo from '../assets/GoogleImage.png';
import Bubble from '../assets/Bubble.png';
import SignInImage from '../assets/SignUpImage.png';

// API function
import { Register } from '../services/Auth';

import { useNavigate } from 'react-router-dom';
import { useState } from 'react';


const SignUp: React.FC = () => {
  //Navigation
  const navigation = useNavigate();

  // form state
  const [name, setname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google";
  };
  const handleSignUp = async () => {
    const result = await Register({name, email, password});
    if (result.error) {
      alert(`Sign Up Failed: ${result.error}`);
      return;
    }
    navigation('/signin');
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
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
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