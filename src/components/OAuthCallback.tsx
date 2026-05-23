import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const userData = params.get("user");

    if (token) {
      console.log('[OAuth Callback] Token received:', token);
      localStorage.setItem('token', token);

      // Parse and store user data if available
      if (userData) {
        try {
          // Use browser-native atob() instead of Node.js Buffer
          const decodedUser = JSON.parse(atob(userData));
          console.log('[OAuth Callback] User data decoded:', decodedUser);
          
          if (decodedUser.name) localStorage.setItem('userName', decodedUser.name);
          if (decodedUser.email) localStorage.setItem('userEmail', decodedUser.email);
          if (decodedUser.userId) localStorage.setItem('userId', decodedUser.userId);
          if (decodedUser._id) localStorage.setItem('userMongoId', decodedUser._id);
        } catch (error) {
          console.error('[OAuth Callback] Failed to parse user data:', error);
        }
      }

      // Clean URL and redirect to dashboard
      window.history.replaceState({}, document.title, '/user/dashboard');
      navigate('/user/dashboard', { replace: true });
    } else {
      console.error('[OAuth Callback] No token found in redirect');
      navigate('/signin', { replace: true });
    }
  }, [location, navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div className="spinner" style={{
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #3498db',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        animation: 'spin 1s linear infinite'
      }}></div>
      <p style={{ fontSize: '18px', color: '#666' }}>Completing sign in...</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default OAuthCallback;
