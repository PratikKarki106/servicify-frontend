// src/App.tsx
import {  Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import LandingPage from "./pages/LandingPage";
import AboutPage from "./components/About";
import Services from "./components/Services";
import Contact from "./components/Contact";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import TrackService from "./User/TrackService";
import AuthSuccess from "./services/AuthSuccess";
import OAuthCallback from "./components/OAuthCallback";
import Circle from "./components/Circle"
import AdminHome from "./pages/AdminHome";
import BookAppointment from "./User/BookAppointment/BookAppointment";
import ViewAppointment from "./Admin/viewAppointment";
import AdminCatalog from './Admin/AdminCatalog';
import UserCatalog from './User/UserCatalog';
import AdminAppointment from "./Admin/AdminAppointment";
import AdminPackage from "./Admin/AdminPackage";
import AdminMessages from "./Admin/AdminMessages";
import AdminNotificationsPage from "./Admin/AdminNotificationsPage";
import UserSideTop from "./User/UserSideTop";
import UserDashboard from "./User/Dashboard/UserDashboard";
import EmailForgot from "./User/ForgotPassword/EmailForgot";
import EnterOtp from "./User/ForgotPassword/EnterOtp";
import ResetPassword from "./User/ForgotPassword/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import MyProfile from "./User/MyProfile";
import PaymentSuccess from "./User/Payment/PaymentSuccess";
import PaymentFailed from "./User/Payment/PaymentFailed";
import UserHistory from "./User/UserHistory";
import UserPackages from "./User/UserPackages";
import AdminUsers from "./Admin/AdminUsers";
import AdminUserDetails from "./Admin/AdminUserDetails";
import Analytics from "./Admin/Analytics";
import AdminHistory from "./Admin/AdminHistory";
import AdminManageVehicles from "./Admin/AdminManageVehicles";
import UserAnalytics from "./User/UserAnalytics";
import MainSettings from "./User/Settings/MainSettings";
import AppDialogHost from "./components/AppDialogHost";


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
      <AppDialogHost />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/track-service" element={<TrackService />} />
        <Route path="/auth/success" element={<AuthSuccess />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />
        <Route path="/circle" element={<CirclePage />} />
        <Route path="/admin" element={<AdminHome />} />
        <Route path="/book-appointment" element={<BookAppointment />} />
        <Route path="/admin/view-appointment" element={<ViewAppointment />} />
        <Route path="/admin/catalog" element={<AdminCatalog />} />
        <Route path="/catalog" element={<UserCatalog />} />
        <Route path="/admin/confirmed-appointments" element={<AdminAppointment />} />
        <Route path="/admin/packages" element={<AdminPackage />} />
        <Route path="/admin/messages" element={<AdminMessages />} />
        <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/users/:id" element={<AdminUserDetails />} />
        <Route path="/user/sidebar" element={<UserSideTop><div></div></UserSideTop>} />
        <Route path="/user/dashboard" element={<UserSideTop><UserDashboard /></UserSideTop>} />
        <Route path="/user/messages" element={<UserSideTop><div /></UserSideTop>} />
        <Route path="/profile" element={<UserSideTop><MyProfile /></UserSideTop>} />
        <Route path="/user/Email" element={<EmailForgot />} />
        <Route path="/user/EnterOtp" element={<EnterOtp />} />
        <Route path="/user/reset-password" element={<ResetPassword />} />
        <Route path="/user/verify-email" element={<VerifyEmail />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/failed" element={<PaymentFailed />} />
        <Route path="/user/history" element={<UserSideTop><UserHistory /></UserSideTop>} />
        <Route path="/user/packages" element={<UserSideTop><UserPackages /></UserSideTop>} />
        <Route path="/user/analytics" element={<UserAnalytics />} />
        <Route path="/admin/analytics" element={<Analytics />} />
        <Route path="/admin/history" element={<AdminHistory />} />
        <Route path="/admin/manage-vehicles" element={<AdminManageVehicles />} />
        <Route path="/user/settings" element={<UserSideTop><MainSettings /></UserSideTop>} />
      </Routes>
    </>
  );
}

export default App;
