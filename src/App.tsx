// src/App.tsx
import {  Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AboutPage from "./components/About";
import Services from "./components/Services";
import Contact from "./components/Contact";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import AuthSuccess from "./services/AuthSuccess";
import Circle from "./components/Circle"
import AdminHome from "./pages/AdminHome";
// import Dashboard from "./pages/Dashboard";

function App() {
  function CirclePage() {
  return <Circle startDate={new Date("2025-11-01")} />;
}

  return (
      <Routes>
        <Route path="/" element={<LandingPage />} />  {/* 👈 This shows first */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/home" element={<Home currentStatus="Pickup"/>} />
        <Route path="/auth/success" element={<AuthSuccess />} />
        <Route path="/circle" element={<CirclePage />} />
        <Route path="/admin" element={<AdminHome />} />

      </Routes>
  );
}

export default App;
