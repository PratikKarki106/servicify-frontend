// src/App.tsx
import {  Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AboutPage from "./components/About";
import Services from "./components/Services";
import Contact from "./components/Contact";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp"
// import Dashboard from "./pages/Dashboard";

function App() {
  return (
      <Routes>
        <Route path="/" element={<LandingPage />} />  {/* 👈 This shows first */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        { /* <Route path="/dashboard" element={<Dashboard /> */ }
      </Routes>
  );
}

export default App;
