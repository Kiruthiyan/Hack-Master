import React from 'react';
import { Link } from 'react-router-dom';
// --- NEW: Import the icons used in the footer ---
import { FaPhone, FaEnvelope, FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';
import './Footer.css'; // Your new CSS file will be linked here

const Footer = () => {
  return (
    // The id is kept from your example, useful for any remaining anchor links
    <footer id="footer-contact" className="footer-section">
      <div className="footer-grid">
        <div className="footer-col">
          <h4>About NexusLink</h4>
          <p>NexusLink is a dedicated platform fostering growth and innovation by connecting students with companies and ideas.</p>
        </div>
        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/home">Home</Link></li>
            <li><Link to="/advertisements">Company</Link></li>
            <li><Link to="/startup">Startups</Link></li>
            <li><Link to="/talent">Job Seekers</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Contact Info</h4>
          <ul className="footer-contact-info">
            <li>123 Innovation Drive, Colombo</li>
            <li><a href="tel:+94112345678"><FaPhone /> +94 112 345 678</a></li>
            <li><a href="mailto:support@nexuslink.com"><FaEnvelope /> support@nexuslink.com</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Follow Us</h4>
          <p>Join our community for the latest updates.</p>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FaFacebook /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><FaTwitter /></a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} NexusLink. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;