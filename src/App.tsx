// src/App.tsx
import {  Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AboutPage from "./components/About";
import Services from "./components/Services";
import Contact from "./components/Contact";
// import Login from "./pages/Login";
// import Dashboard from "./pages/Dashboard";

function App() {
  return (
      <Routes>
        <Route path="/" element={<LandingPage />} />  {/* 👈 This shows first */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        {/* <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} /> */}
      </Routes>
  );
}

export default App;
