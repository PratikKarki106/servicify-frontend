import { FaInstagram, FaGithub, FaLinkedin } from 'react-icons/fa';
import './Contact.css';

export default function Contact() {
  return (
    <footer className="contact-footer">
      <div className="contact-columns">
        <div className="contact-column">
          <p>
            We are neither producer or consumer of any kind. We are the link between you and your mechanic.
            For any further question contact us.
          </p>
        </div>

        <div className="contact-column">
          <h4>INFO</h4>
          <ul>
            <li>Articles</li>
            <li>Resources</li>
          </ul>
        </div>

        <div className="contact-column">
          <h4>CONTACTS</h4>
          <ul>
            <li>Email: karkipratik063@gmail.com</li>
            <li>Contact: 9823077575</li>
          </ul>
        </div>
      </div>

      <div className="contact-bottom">
        <span>© 2023 — Copyright</span>
        <div className="social-icons">
          <a href="https://www.instagram.com/pratikkarki____/" target="_blank" rel="noopener noreferrer">
            <FaInstagram />
          </a>
          <a href="https://github.com/PratikKarki106" target="_blank" rel="noopener noreferrer">
            <FaGithub />
          </a>
          <a href="https://www.linkedin.com/in/pratik-karki-a90801362/" target="_blank" rel="noopener noreferrer">
            <FaLinkedin />
          </a>
        </div>
      </div>
    </footer>
  );
}