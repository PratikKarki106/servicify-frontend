// src/App.tsx
import {  Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

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
import BookAppointment from "./User/BookAppointment";
import ViewAppointment from "./Admin/viewAppointment";
import AdminCatalog from './Admin/AdminCatalog';
import UserCatalog from './User/UserCatalog';
import AdminAppointment from "./Admin/AdminAppointment";
import AdminPackage from "./Admin/AdminPackage";

function App() {
  function CirclePage() {
  return <Circle startDate={new Date("2025-11-01")} />;
}

  return (
    <>
    <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover   
    />
      <Routes>
        <Route path="/" element={<LandingPage />} /> 
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/home" element={<Home currentStatus="Pickup"/>} />
        <Route path="/auth/success" element={<AuthSuccess />} />
        <Route path="/circle" element={<CirclePage />} />
        <Route path="/admin" element={<AdminHome />} />
        <Route path="/book-appointment" element={<BookAppointment />} />
        <Route path="/admin/view-appointment" element={<ViewAppointment />} />
        <Route path="/admin/catalog" element={<AdminCatalog />} />
        <Route path="/catalog" element={<UserCatalog />} />
        <Route path="/admin/confirmed-appointments" element={<AdminAppointment />} />
        <Route path="/admin/packages" element={<AdminPackage />} />
      </Routes>
    </>
  );
}

export default App;
