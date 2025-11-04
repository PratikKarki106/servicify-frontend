import Logo from "../assets/Servicify.png";
import Biker from "../assets/Biker.mp4";
import About from "../components/About";
import Services from "../components/Services";
import Contact from "../components/Contact";
import { useRef } from "react";
import './LandingPage.css';

export default function LandingPage() {
  const aboutRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  const scrollToAbout = () => {
    if (aboutRef.current) {
      aboutRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToContact = () => {
    if (contactRef.current) {
      contactRef.current.scrollIntoView({ behavior: 'smooth' });
    }
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
          Your browser does not support the video tag.
        </video>

        {/* Navbar over video */}
        <header className="navbar">
          <img src={Logo} alt="Servicify Logo" className="logo" />
          <nav className="nav-links">
            <button className="nav-button" onClick={scrollToAbout}>About Us</button>
            <button className="nav-button" onClick={scrollToContact}>Contact</button>
          </nav>
          <div className="auth-buttons">
            <button className="nav-button">Log In</button>
            <button className="signup-button">Sign Up</button>
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