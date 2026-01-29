import { useState } from "react";
import LockReset from "../../assets/lock_reset.png";
import HomeNav from "../../components/HomeNav";
import "./EmailForgot.css";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { ForgotPasswordService } from "../../services/ForgotPassword";

const EmailForgot = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const result = await ForgotPasswordService.requestPin({ email });
      
      if (result.success) {
        setSuccess("PIN sent to your email! Redirecting...");
        localStorage.setItem("resetEmail", email);
        
        setTimeout(() => {
          navigate("/user/EnterOtp");
        }, 1500);
      } else {
        setError(result.message || "If account exists, PIN will be sent");
        
      }
    } catch {
      setError("Failed to send PIN. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <HomeNav />
      <div className="email-forgot-main-container">
        <div className="inner-email-container">
          <div className="email-image-container">
            <img src={LockReset} alt="Lock Reset Icon" />
          </div>

          <h1 className="email-heading">Forgot Password?</h1>
          <p className="email-description">
            Enter your email to receive a PIN to reset your password.
          </p>

          <form className="email-form" onSubmit={handleSubmit}>
            <div className="form-group1">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                placeholder="e.g. name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className={error ? "error-border-forgot" : ""}
              />
              {error && <div className="error-message-forgot">{error}</div>}
            </div>

            <button type="submit" className="reset-button-forgot" disabled={loading}>
              {loading ? "Sending PIN..." : "Send Reset Code"}
            </button>
          </form>

          {success && <div className="success-message-forgot">{success}</div>}
          
          <a href="/signin" className="back-link">
            <FaArrowLeft />
            Back to Login
          </a>
        </div>

        <footer className="email-footer">
          <p>© 2024 Servicify Automobile Solutions. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
};

export default EmailForgot;