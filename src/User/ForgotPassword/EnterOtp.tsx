import { useState, useRef, useEffect } from "react";
import LockReset from "../../assets/OTP.png";
import HomeNav from "../../components/HomeNav";
import "./EmailForgot.css";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { ForgotPasswordService } from "../../services/ForgotPassword";

const EnterOtp = () => {
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const email = localStorage.getItem("resetEmail") || "";

  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;
    
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const pinCode = pin.join("");
    if (pinCode.length !== 6) {
      setError("Please enter 6-digit PIN");
      return;
    }

    setLoading(true);
    try {
      const result = await ForgotPasswordService.verifyPin({ email, pin: pinCode });
      
      if (result.success && result.resetToken) {
        setSuccess("PIN verified successfully!");
        localStorage.setItem("resetToken", result.resetToken);
        
        setTimeout(() => {
          navigate("/user/reset-password");
        }, 1500);
      } else {
        setError(result.message || "Invalid PIN");
      }
    } catch {
      setError("Failed to verify PIN");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    setLoading(true);
    setError("");
    try {
      const result = await ForgotPasswordService.resendPin({ email });
      
      if (result.success) {
        setSuccess("New PIN sent to your email");
        setTimer(60);
        setCanResend(false);
        setPin(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        setError(result.message || "Failed to resend PIN");
      }
    } catch {
      setError("Failed to resend PIN");
    } finally {
      setLoading(false);
    }
  };

  const setInputRef = (index: number) => (el: HTMLInputElement | null) => {
    inputRefs.current[index] = el;
  };

  return (
    <>
      <HomeNav />
      <div className="email-forgot-main-container">
        <div className="inner-email-container">
          <div className="email-image-container">
            <img src={LockReset} alt="OTP Icon" />
          </div>

          <h1 className="email-heading">Verify OTP</h1>
          <p className="email-description">
            Enter the 6-digit code sent to {email}
          </p>

          <form className="email-form" onSubmit={handleSubmit}>
            <div className="form-group1">
              <label>6-Digit Code</label>
              <div className="otp-input-container">
                {pin.map((digit, index) => (
                  <input
                    key={index}
                    ref={setInputRef(index)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onFocus={(e) => e.target.select()}
                    className="otp-input"
                    disabled={loading}
                  />
                ))}
              </div>
              {error && <div className="error-message-forgot">{error}</div>}
            </div>

            <button type="submit" className="reset-button-forgot" disabled={loading}>
              {loading ? "Verifying..." : "Proceed"}
            </button>
          </form>

          <div className="resend-section">
            {!canResend ? (
              <p className="timer-text">Resend PIN in {timer}s</p>
            ) : (
              <button onClick={handleResend} className="resend-button" disabled={loading}>
                Resend PIN
              </button>
            )}
          </div>

          {success && <div className="success-message-forgot">{success}</div>}

          <a href="/user/Email" className="back-link">
            <FaArrowLeft />
            Back to Email
          </a>
        </div>

        <footer className="email-footer">
          <p>© 2024 Servicify Automobile Solutions. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
};

export default EnterOtp;