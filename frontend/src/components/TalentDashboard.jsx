import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import StudentList from './StudentList'; 
import { FaUsers, FaUniversity, FaUserGraduate, FaCodeBranch } from 'react-icons/fa';
import './TalentDashboard.css'; 


const universityLogos = [
  { name: 'University of Moratuwa', logoUrl: '/images/uom.jpg' },
  { name: 'University of Colombo', logoUrl: '/images/uoc.jpg' },
  { name: 'University of Peradeniya', logoUrl: '/images/uop.jpg' },
  { name: 'SLIIT', logoUrl: '/images/sliit.jpg' },
  { name: 'NSBM Green University', logoUrl: '/images/nsbm.png' },
  { name: 'IIT', logoUrl: '/images/iit.png' },
];

const passoutStats = [
  { icon: <FaUserGraduate />, number: '5,000+', label: 'Annual Graduates in IT & Engineering' },
  { icon: <FaCodeBranch />, number: 'Top 5%', label: 'Ranked in Global Competitive Programming' },
  { icon: <FaUsers />, number: '10,000+', label: 'Active Members in Tech Communities' },
  { icon: <FaUniversity />, number: '20+', label: 'Universities with STEM Programs' },
];


function StatCard({ icon, number, label }) {
    return (
        <div className="stat-card">
            <div className="stat-card-icon">{icon}</div>
            <div className="stat-card-number">{number}</div>
            <div className="stat-card-label">{label}</div>
        </div>
    );
}
StatCard.propTypes = {
    icon: PropTypes.element.isRequired,
    number: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
};

function UniversityLogo({ name, logoUrl }) {
    return (
        <div className="university-logo">
            <img src={logoUrl} alt={`${name} logo`} />
        </div>
    );
}
UniversityLogo.propTypes = {
    name: PropTypes.string.isRequired,
    logoUrl: PropTypes.string.isRequired,
};


const TalentDashboard = () => {
    return (
        <div className="talent-dashboard-wrapper">
            
            <section className="talent-hero-section">
                
                <div className="hero-background">
                    <img src="/images/hero5.jpg" alt="Talent hero background" className="active" />
                </div>
                
                <div className="hero-overlay"></div>

                <div className="hero-content">
                    <h1>The Future of Tech, Sourced Here</h1>
                    <p>Tap into Sri Lanka's brightest minds in software engineering, data science, and cybersecurity from leading universities.</p>
                    <Link to="/post-ad" className="hero-cta-button">Post a Job & Find Your Match</Link>
                </div>
            </section>

            
            <section className="stats-section">
                <div className="section-container">
                    <div className="stats-grid">
                        {passoutStats.map(stat => (
                            <StatCard key={stat.label} {...stat} />
                        ))}
                    </div>
                </div>
            </section>

           
            <section className="university-showcase-section">
                <div className="section-container">
                    <h2 className="section-heading">Partnering with Leading Universities</h2>
                    <div className="university-logos-container">
                        <div className="uni-logos-slide">
                            {universityLogos.map(uni => <UniversityLogo key={uni.name} {...uni} />)}
                            {universityLogos.map(uni => <UniversityLogo key={`${uni.name}-clone`} {...uni} />)}
                        </div>
                    </div>
                </div>
            </section>
            
            <section className="student-list-embed-section">
                <StudentList />
            </section>
        </div>
    );
};

export default TalentDashboard;