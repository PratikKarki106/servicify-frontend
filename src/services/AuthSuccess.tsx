import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userData = params.get("user");

    if (token) {
      localStorage.setItem("token", token);
      
      // Parse and store user data if available
      if (userData) {
        try {
          const decodedUser = JSON.parse(atob(userData));
          if (decodedUser.name) localStorage.setItem('userName', decodedUser.name);
          if (decodedUser.email) localStorage.setItem('userEmail', decodedUser.email);
          if (decodedUser.userId) localStorage.setItem('userId', decodedUser.userId);
          if (decodedUser._id) localStorage.setItem('userMongoId', decodedUser._id);
        } catch (error) {
          console.error('Failed to parse user data:', error);
        }
      }
      
      navigate("/home");
    } else {
      navigate("/signin");
    }
  }, []);

  return <p>Signing you in...</p>;
};

export default AuthSuccess;
