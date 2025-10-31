import Services1 from '../assets/Services1.png';
import Services2 from '../assets/Services2.png';
import Services3 from '../assets/Services3.png';
import './Services.css';

export default function Services() {
  return (
    <section className="services-section">
      <h2 className="services-heading">Our Services</h2>
      <p className="services-description">
        At Servicify, we bring convenience to your fingertips. Compare bike part prices, book trusted mechanics, and grab the best service offers—all in one place.
      </p>

      <div className="services-grid">
        <img src={Services1} alt="Browse Price" className="service-image" />
        <img src={Services2} alt="Appointment" className="service-image" />
        <img src={Services3} alt="Package Offers" className="service-image" />
      </div>
    </section>
  );
}