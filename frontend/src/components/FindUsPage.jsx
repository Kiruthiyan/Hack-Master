import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getData } from '../apiService'; // MODIFIED: Import our backend helper
import { Link } from 'react-router-dom';
import './FindUsPage.css'; 
import PredictionForm from './PredictionForm';
// --- Importing all necessary components and icons ---
import StudentList from './StudentList'; 
import IdeaList from './IdeaList';
import { BsBriefcase, BsLightbulb, BsPeople } from 'react-icons/bs';

// ===================================================================
// DUMMY DATA (for static sections)
// ===================================================================

const famousCompanies = [
  { name: 'WSO2', logoUrl: '/images/wso2.png' },
  { name: 'IFS', logoUrl: '/images/ifs.png' },
  { name: 'Virtusa', logoUrl: '/images/virtusa.jpeg' },
  { name: '99X', logoUrl: '/images/99x.png' },
  { name: 'MillenniumIT', logoUrl: '/images/milleniumit.png' },
  { name: 'SyscoLabs', logoUrl: '/images/sysco.png' },
  { name: 'Dialog Axiata', logoUrl: '/images/dialog.jpeg' },
  { name: 'LSEG', logoUrl: '/images/lseg.webp' },
];

const trendingJobs = [
    { position: 'Senior Frontend Engineer', salary: '$120k – $180k USD' },
    { position: 'Product Manager', salary: '$110k – $170k USD' },
    { position: 'UX/UI Designer', salary: '$90k – $140k USD' },
    { position: 'Data Scientist', salary: '$130k – $190k USD' },
    { position: 'DevOps Engineer', salary: '$115k – $175k USD' },
    { position: 'Backend Developer (Go)', salary: '$125k – $185k USD' },
];

// ===================================================================
// REUSABLE SUB-COMPONENTS
// ===================================================================

function InfoBoxCard({ icon, title, description, linkText, to }) {
    const isScrollLink = to.startsWith('#');

    return (
      <div className="info-box-card">
        <div className="info-box-icon">{icon}</div>
        <h3 className="info-box-title">{title}</h3>
        <p className="info-box-description">{description}</p>
        {isScrollLink ? (
            <a href={to} className="info-box-link">{linkText} &rarr;</a>
        ) : (
            <Link to={to} className="info-box-link">{linkText} &rarr;</Link>
        )}
      </div>
    );
}
InfoBoxCard.propTypes = {
    icon: PropTypes.element.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    linkText: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
};

function CompanyLogoCard({ name, logoUrl }) { return ( <div className="company-logo-card"><img src={logoUrl} alt={`${name} logo`} /></div> ); }
CompanyLogoCard.propTypes = { name: PropTypes.string.isRequired, logoUrl: PropTypes.string.isRequired };

function TrendingJobCard({ position, salary }) { return ( <div className="trending-job-card"><div className="trending-job-position">{position}</div><div className="trending-job-salary">{salary}</div></div> ); }
TrendingJobCard.propTypes = { position: PropTypes.string.isRequired, salary: PropTypes.string.isRequired };

function AdvertisementCard({ companyName, position, message, contactPerson, contactEmail, contactPhone }) {
    return (
        <div className="card-container advertisement-card">
            <h3 className="advertisement-position">{position}</h3>
            <h4 className="advertisement-company">{companyName}</h4>
            <p className="advertisement-message">"{message}"</p>
            <div className="advertisement-contact">
                <h6>Contact Details</h6>
                <ul>
                    <li><strong>Contact:</strong> {contactPerson}</li>
                    <li><strong>Email:</strong> <a href={`mailto:${contactEmail}`}>{contactEmail}</a></li>
                    <li><strong>Phone:</strong> {contactPhone}</li>
                </ul>
            </div>
        </div>
    );
}
AdvertisementCard.propTypes = {
    companyName: PropTypes.string.isRequired, position: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired, contactPerson: PropTypes.string.isRequired,
    contactEmail: PropTypes.string.isRequired, contactPhone: PropTypes.string.isRequired,
};

// ===================================================================
// MAIN COMPONENT TO DISPLAY THE ENTIRE PAGE
// ===================================================================
const FindUsPage = () => {
    const [advertisements, setAdvertisements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchAdvertisementsFromBackend = async () => {
            try {
                const dataFromBackend = await getData('advertisements');
                const adsArray = dataFromBackend ? 
                    Object.keys(dataFromBackend).map(key => ({
                        id: key,
                        ...dataFromBackend[key]
                    })) : [];
                adsArray.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
                setAdvertisements(adsArray);
            } catch (err) {
                console.error("Error fetching advertisements from backend: ", err);
                setError('Could not load advertisements. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchAdvertisementsFromBackend();
    }, []);

    return (
        <div className="advertisement-page-wrapper">
            <section className="hero-section-jobs">
                {/* Background image for the hero section */}
                <div className="hero-background">
                    <img src="/images/hero6.jpg" alt="Job search background" className="active" />
                </div>
                {/* Overlay for readability */}
                <div className="hero-overlay"></div>
                
                <div className="hero-content">
                    <h1>Find Your Next Breakthrough Role</h1>
                    <p>Discover thousands of opportunities from top companies and fast-growing startups.</p>
                    {/* --- NEW: Search Bar --- */}
                    <div className="search-bar-container">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search by role, company, or skill"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="search-button">Search</button>
                    </div>
                </div>
            </section>

            <section className="company-section ai-prediction-section">
                <div className="company-content-container">
                {/* The self-contained PredictionForm component is rendered here */}
                <PredictionForm />
                </div>
            </section>

            {/* NEW: Info Box Section for Navigation */}
            <section className="info-box-section">
                <div className="info-box-grid">
                    <InfoBoxCard
                        icon={<BsBriefcase />}
                        title="Explore Open Roles"
                        description="Dive into a curated list of jobs from leading tech companies and innovative startups."
                        linkText="Browse Jobs"
                        to="#main-advertisements"
                    />
                    <InfoBoxCard
                        icon={<BsPeople />}
                        title="Discover Talent"
                        description="Connect with the next generation of builders, thinkers, and leaders from top universities."
                        linkText="View Students"
                        to="#student-list-section"
                    />
                    <InfoBoxCard
                        icon={<BsLightbulb />}
                        title="Find Innovation"
                        description="Explore groundbreaking startup ideas and find your next investment or collaboration."
                        linkText="See Ideas"
                        to="#idea-list-section"
                    />
                </div>
            </section>

            <section className="featured-companies-section">
                <h2 className="section-heading">HIRING NOW AT TOP COMPANIES</h2>
                <div className="company-logos-container">
                    <div className="logos-slide">
                        {famousCompanies.map(company => <CompanyLogoCard key={company.name} {...company} />)}
                        {/* Duplicate for smooth infinite scroll */}
                        {famousCompanies.map(company => <CompanyLogoCard key={`${company.name}-clone`} {...company} />)}
                    </div>
                </div>
            </section>

            <section className="trending-jobs-section">
                <h2 className="section-heading">Trending Positions</h2>
                <div className="trending-jobs-grid">
                    {trendingJobs.map(job => ( <TrendingJobCard key={job.position} {...job} /> ))}
                </div>
            </section>

            <div id="main-advertisements">
                <div className="section-divider-container">
                    <hr className="section-divider" />
                    <h2 className="section-title">All Open Positions</h2>
                </div>
                {error && <p className="error-message">{error}</p>}
                {loading ? (
                    <div className="loading-message">Loading Advertisements...</div>
                ) : (
                    <div className="advertisement-list-container">
                        {advertisements.length > 0 ? (
                            advertisements.map(ad => <AdvertisementCard key={ad.id} {...ad} />)
                        ) : (
                            <p className="no-results-message">No advertisements posted yet.</p>
                        )}
                    </div>
                )}
            </div>
            
            <section id="student-list-section" className="component-section">
                <StudentList />
            </section>

            <section id="idea-list-section" className="component-section">
                <IdeaList />
            </section>
        </div>
    );
};

export default FindUsPage;