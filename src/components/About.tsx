import Cover1 from '../assets/Cover1.png';
import AboutIcon from '../assets/About.png';
import './About.css';

export default function About() {
  return (
    <section className="about-section">
      <div className="about-content">
        <div className="about-image-wrapper">
          <img src={Cover1} alt="Bike Workshop" className="about-image" />
        </div>
        <div className="about-text">
          <div className="about-heading">
            <img src={AboutIcon} alt="About Icon" className="about-icon" />
            <h2>ABOUT <span className="highlight">US</span></h2>
          </div>
          <p>
            At Servicify, we believe bike maintenance shouldn't slow you down. Our mission is to make servicing simple, transparent, and reliable for every rider.
          </p>
          <p>
            We connect you with trusted mechanics, provide real-time part prices, and bring you the best offers all in one platform. Whether you need a quick tune-up or a major repair, Servicify ensures you get quality service without the guesswork.
          </p>
          <p>
            Built by riders, for riders, Servicify is here to keep your bike running smoothly so you can focus on what matters most — the ride.
          </p>
          <button className="learn-more-button">Learn More</button>
        </div>
      </div>
    </section>
  );
}