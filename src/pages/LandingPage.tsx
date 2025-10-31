import Logo from "../assets/Servicify.png";
import Cover from "../assets/Cover.png";
import About from "../components/About";
import Services from "../components/Services";
import Contact from "../components/Contact";
import { useRef } from "react";
import './LandingPage.css';

export default function LandingPage() {

  {/* Adding react ref for scrolling*/}
  const aboutRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  {/* Function to direct to contact or about when button is clicked */}
  const scrollToAbout = () => {
    if (aboutRef.current) {
      aboutRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToContact = () => {
    if(contactRef.current) {
      contactRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };


  return (
    <>
      {/* Navbar */}
      <header className="navbar">
        <img src={Logo} alt="Servicify Logo" className="logo" />
        <nav className="nav-links">
          <button className="nav-button" onClick={scrollToAbout}>About Us</button>
          <button className="nav-button"onClick={scrollToContact}>Contact</button>
        </nav>
        <div className="auth-buttons">
          <button className="nav-button">Log In</button>
          <button className="signup-button">Sign Up</button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Your Ride,<br />Our Responsibility</h1>
            <p>
              From finding trusted mechanics to comparing part prices and managing exclusive offers,<br />
              <strong>Servicify</strong> streamlines every step so you spend less time worrying and more time riding.
            </p>
          </div>
          <div className="hero-image-wrapper">
            <img src={Cover} alt="Sport Bike Rider" className="hero-image" />
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

    { /* Footer */ }
      <footer className="footer">
        <p>© 2025 Servicify. All rights reserved.</p>
      </footer>
    </>
  );
}