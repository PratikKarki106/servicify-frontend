import './SignIn.css';
import Logo from "../assets/Servicify.png";
import GoogleLogo from '../assets/GoogleImage.png';
import Bubble from '../assets/Bubble.png';
import SignInImage from '../assets/SignUpImage.png';

const SignUp: React.FC = () => {
  return (
    <div className="signin-container">
      {/* Left half container for signing in */}
      <div className="signup-left">
        <img src={Logo} alt="Servicify Logo" className="signin-logo" />

        <h1 className="signin-title">SIGN IN</h1>
        
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter your password"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter your password"
          />
        </div>

        <div className="Sign-option">
          <button className="signin-btn">Sign In</button>
          <p>Or</p>
          <button className="google-btn">
            <img src={GoogleLogo} alt="Google" />
          </button>
        </div>

        <p className="signup-text">
          Already have an account?{" "}
          <button className="signup-link">
            <u>Sign Up</u>
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