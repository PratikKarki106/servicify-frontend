import { useState, useEffect } from "react";
import LockReset from "../../assets/OTP.png";
import HomeNav from "../../components/HomeNav";
import "./EmailForgot.css";
import { FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { ForgotPasswordService } from "../../services/ForgotPassword";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const email = localStorage.getItem("resetEmail") || "";
  const resetToken = localStorage.getItem("resetToken") || "";

  useEffect(() => {
    if (!email || !resetToken) {
      navigate("/user/Email");
    }
  }, [email, resetToken, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const result = await ForgotPasswordService.resetPassword({
        email,
        resetToken,
        newPassword
      });
      
      if (result.success) {
        setSuccess("Password reset successfully! Redirecting...");
        localStorage.removeItem("resetEmail");
        localStorage.removeItem("resetToken");
        
        setTimeout(() => {
          navigate("/signin");
        }, 2000);
      } else {
        setError(result.message || "Failed to reset password");
      }
    } catch {
      setError("Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (!email || !resetToken) {
    return (
      <>
        <HomeNav />
        <div className="email-forgot-main-container">
          <div className="inner-email-container">
            <h2 className="email-heading">Invalid Session</h2>
            <p>Please start password reset again.</p>
            <button 
              onClick={() => navigate("/user/Email")} 
              className="reset-button-forgot mt-4"
            >
              Start Over
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <HomeNav />
      <div className="email-forgot-main-container">
        <div className="inner-email-container">
          <div className="email-image-container">
            <img src={LockReset} alt="Reset Icon" />
          </div>

          <h1 className="email-heading">Reset Password</h1>
          <p className="email-description">
            Create a new password for {email}
          </p>

          <form className="email-form" onSubmit={handleSubmit}>
            <div className="form-group1">
              <label>New Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={loading}
                  className={error ? "error-border-forgot" : ""}
                  minLength={8}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {error && <div className="error-message-forgot">{error}</div>}
              <p className="password-hint">Must be at least 8 characters</p>
            </div>

            <button type="submit" className="reset-button-forgot" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          {success && <div className="success-message-forgot">{success}</div>}

          <a href="/user/EnterOtp" className="back-link">
            <FaArrowLeft />
            Back to OTP
          </a>
        </div>

        <footer className="email-footer">
          <p>© 2024 Servicify Automobile Solutions. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
};

export default ResetPassword;