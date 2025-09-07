import React from 'react';
import { Link } from 'react-router-dom';
import './Company.css';
import PredictionForm from './PredictionForm';
import {
FaRocket, FaUsers, FaChartLine, FaArrowRight,
FaStar, FaBookOpen, FaStream, FaHandPointer, FaQuoteLeft
} from 'react-icons/fa';
// ===================================================================
// STATIC DATA
// ===================================================================
const recruiterBenefits = [
{ icon: <FaUsers />, text: "Tap into a community of 10M+ engaged, startup-ready candidates." },
{ icon: <FaBookOpen />, text: "Everything you need to kickstart your recruiting—job posts, branding, and HR tools, all for free." },
{ icon: <FaStream />, text: "A free applicant tracking system, or free integration with any ATS you may already use." },
{ icon: <FaHandPointer />, text: "Let our AI Recruiter scan millions of candidates and schedule your favorites on your calendar." }
];
const userQuotes = [
{ text: "I got my tech job on this platform 4 years ago and I'm still happy! Pays well, great culture, and great benefits." },
{ text: "I love NexusLink. I got my current job at a startup entirely through the site last year - it's super easy to use." },
{ text: "I can't imagine my day to day without this platform. Life would be a lot more difficult." },
{ text: "Half of the offers I give are sourced from NexusLink. It's the best product for anyone looking for startup talent." }
];
// ===================================================================
// THE MAIN COMPANY COMPONENT
// ===================================================================
const Company = () => {
return (
<div className="company-page-wrapper">
{/* --- SECTION 1: HERO --- */}
  <section className="company-section hero-section">
    <div className="company-hero-background">
      {/* ✅ Fixed: added hero-image class so CSS overlay works */}
      <img src="/images/hero7.jpg" alt="Job search background" className="hero-image" />
    </div>
    <div className="company-hero-overlay"></div>
    <div className="company-hero-content">
      <h1>Where Great Companies Begin</h1>
      <p>Explore the forefront of innovation. Discover the tools you need to build your team and find visionary talent</p>
      <Link to="/post-ad" className="hero-cta-button">Post a Job for Free</Link>
    </div>
  </section>

  {/* --- SECTION 2: AI AUTOPILOT --- */}
  <section className="company-section autopilot-section">
    <div className="company-content-container autopilot-grid">
      <div className="autopilot-text">
        <p className="section-pre-title">NEXUSLINK:AI AUTOPILOT</p>
        <h2>Stop scrolling, start hiring</h2>
        <p className="section-paragraph">
          We'll review hundreds of profiles each week and deliver the best fits with hyper-personalized templates. All that's needed from you is one-click to approve and they'll be instantly connected.
        </p>
        <button className="demo-button">Schedule a Demo</button>
      </div>
      <div className="autopilot-image">
        <img src="/images/hiring.jpg" alt="AI Autopilot UI" />
      </div>
    </div>
  </section>

  {/* --- SECTION 3: ATS --- */}
  <section className="company-section ats-section">
    <div className="company-content-container ats-grid">
      <div className="ats-image">
        <img src="/images/ats.jpg" alt="Applicant Tracking System Diagram" />
      </div>
      <div className="ats-text">
        <h2>A 100% free, lightweight ATS</h2>
        <p className="section-paragraph">
          Save time & hire faster with our all-in-one, streamlined tracking system. Take just 10 minutes to set up and have centralized data that consolidates all correspondence and notes into one easy-to-manage dashboard.
        </p>
        <Link to="#" className="build-pipeline-link">Build your pipeline <FaArrowRight /></Link>
      </div>
    </div>
  </section>

  {/* --- SECTION 4: DATA ANALYSIS / PLATFORM INSIGHTS --- */}
  
  
  {/* --- SECTION 5: WHY RECRUITERS LOVE US --- */}
  <section className="company-section love-us-section">
    <div className="company-content-container">
      <div className="split-title-group">
        <p className="split-pre-title">Need talent?</p>
        <h2>Why recruiters love us</h2>
      </div>
      <div className="icon-list-grid">
        {recruiterBenefits.map((item, index) => (
          <div className="icon-list-item" key={index}>
            <div className="icon-list-icon-wrapper">{item.icon}</div>
            <p className="icon-list-text">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  </section>

  {/* --- SECTION 6: QUOTES --- */}
  <section className="company-section quotes-section">
    <div className="company-content-container">
      <div className="split-title-group">
        <p className="split-pre-title">Quotes</p>
        <h2>From our users</h2>
      </div>
      <div className="quotes-grid">
        {userQuotes.map((quote, index) => (
          <div className="quote-card" key={index}>
            <div className="quote-icon"><FaQuoteLeft /></div>
            <p>{quote.text}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
</div>
);
};
export default Company;