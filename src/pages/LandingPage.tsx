// assets
import Logo from "../assets/Servicify.png";
import Biker from "../assets/Biker.mp4";
import About from "../components/About";
import Services from "../components/Services";
import Contact from "../components/Contact";

// Libraries
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// CSS
import './LandingPage.css';

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const aboutRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const navigation = useNavigate();

  const scrollToAbout = () => {
    if (aboutRef.current) aboutRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToContact = () => {
    if (contactRef.current) contactRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogin = () => navigation("/signin");
  const handleSignUp = () => navigation("/signup");

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <>
      {/* Hero Section with Video */}
      <section className="hero-section">
        <video
          className="hero-video"
          autoPlay
          muted
          playsInline
          onEnded={(e) => e.currentTarget.pause()}
        >
          <source src={Biker} type="video/mp4" />
        </video>

        {/* Navbar */}
        <header className="navbar">
          <img src={Logo} alt="Servicify Logo" className="logo" />

          <div className="hamburger" onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </div>

          <nav className={`nav-links ${menuOpen ? 'active' : ''}`}>
            <button className="navigation-button" onClick={() => { scrollToAbout(); setMenuOpen(false); }}>
              About Us
            </button>
            <button className="navigation-button" onClick={() => { scrollToContact(); setMenuOpen(false); }}>
              Contact
            </button>
          </nav>

          <div className="auth-buttons">
            <button className="navigation-button" onClick={handleLogin}>Log In</button>
            <button className="signup-button" onClick={handleSignUp}>Sign Up</button>
          </div>
        </header>

        <div className="hero-overlay">
          <div className="hero-text">
            <h1>Your Ride,<br />Our Responsibility</h1>
            <p>
              From finding trusted mechanics to comparing part prices and managing exclusive offers,<br />
              <strong>Servicify</strong> streamlines every step so you spend less time worrying and more time riding.
            </p>
          </div>

          <div className="arrow-stack">
            <div className="arrow arrow-1"></div>
            <div className="arrow arrow-2"></div>
            <div className="arrow arrow-3"></div>
          </div>
        </div>
      </section>

      <section className="new-landing-section">
        <div className="new-landing-container">
          <h1 className="new-title">Effortless Service at Your Fingertips</h1>
          <p className="new-subtitle">
            Experience seamless booking, real-time tracking, and secure payments all in one place.
            We handle the details, so you don't have to.
          </p>

          <button className="new-book-btn" onClick={handleSignUp}>
            Book an Appointment Now
          </button>
        </div>
      </section>
        <div className="Landing-TextOnly">
          <h1>Everything you need, nothing you don’t</h1>
          <p>We've designed our platform to be simple, intuitive, and powerful, giving you complete </p>
          <p>control and peace of mind.</p>
        </div>
      {/* About Section */}
      <div ref={aboutRef}>
        <About />
      </div>

      <Services />

      <div ref={contactRef}>
        <Contact />
      </div>

      <footer className="footer">
        <p>© 2025 Servicify. All rights reserved.</p>
      </footer>
    </>
  );
}
