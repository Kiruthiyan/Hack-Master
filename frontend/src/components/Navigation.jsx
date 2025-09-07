import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import "./Navigation.css";

const Navigation = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!isMenuOpen);
  const closeMenu = () => setMenuOpen(false);

  // --- Reusable function to close menu and scroll to top ---
  const handleLinkClick = () => {
    closeMenu();
    window.scrollTo(0, 0);
  };

  

  const handleLogout = async () => {
    closeMenu();
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
      alert("Failed to log out. Please try again.");
    }
  };

  return (
    <nav className="navbar">
      {/* Left: Logo */}
      <div className="navbar-left">
        <Link to="/home" className="navbar-logo" onClick={handleLinkClick}>
          {/* N box */}
          <div class="logo">

            <div class="logo-box">
              <span class="logo-letter">Nexus</span>
            </div>

            {/* NexusLink text */}
            <span class="logo-text">Link</span>
          </div>

        </Link>
      </div>



      {/* Center: Menu Links */}
      <ul className={isMenuOpen ? "nav-list open" : "nav-list"}>
        <li className="nav-item">
          <Link to="/home" onClick={handleLinkClick}>Home</Link>
        </li>
        <li className="nav-item">
          <Link to="/findus" onClick={handleLinkClick}>Find Us</Link>
        </li>
        <li className="nav-item">
          <Link to="/company" onClick={handleLinkClick}>Company</Link>
        </li>
        <li className="nav-item">
          <Link to="/startup" onClick={handleLinkClick}>Startup</Link>
        </li>
        <li className="nav-item">
          <Link to="/talentD" onClick={handleLinkClick}>Job Seeker</Link>
        </li>
        <li className="nav-item">
          {/* This was pointing to /contact, but you have a special handler.
              You might want to use the handler here as well. */}
          <a href="/contact" onClick={handleLinkClick}>Contact</a>
        </li>
      </ul>

      {/* Right: Login OR Logout */}
      <div className="navbar-right">
        {user ? (
          // If user exists, show Logout button
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        ) : (
          // If user does NOT exist, show only the Login link
          <Link to="/login" className="auth-link" onClick={handleLinkClick}>Login</Link>
        )}
      </div>

      {/* Hamburger (only for mobile) */}
      <div
        className={isMenuOpen ? "hamburger-menu open" : "hamburger-menu"}
        onClick={toggleMenu}
      >
        <div className="line line-1"></div>
        <div className="line line-2"></div>
        <div className="line line-3"></div>
      </div>
    </nav>
  );
};

export default Navigation;