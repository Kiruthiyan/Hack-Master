import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import IdeaList from '../components/IdeaList'; 
import { FaRocket, FaLightbulb, FaChartLine, FaUsers } from 'react-icons/fa';
import './StartupPage.css'; // Make sure this CSS file exists and is linked



const startupCharacteristics = [
    { icon: <FaLightbulb />, title: 'Innovation', description: 'Startups aim to solve problems in new ways, often disrupting entire industries with novel technology or business models.' },
    { icon: <FaChartLine />, title: 'Growth-Oriented', description: 'The primary goal is to grow quickly and capture a large market share, prioritizing scalability over immediate profitability.' },
    { icon: <FaUsers />, title: 'Adaptability', description: 'Startups must be agile and able to pivot their strategy quickly based on market feedback and data.' },
];

const successStories = [
    { name: 'Stripe', logoUrl: '/images/stripe.png', description: 'Revolutionized online payments for businesses of all sizes.' },
    { name: 'Airbnb', logoUrl: '/images/airbnb.png', description: 'Transformed the travel industry by creating a marketplace for lodging.' },
    { name: 'SpaceX', logoUrl: '/images/spacex.png', description: 'Drastically reduced the cost of space travel, making it more accessible.' },
    { name: 'Spotify', logoUrl: '/images/spotify.png', description: 'Changed how the world listens to music with its streaming service.' },
];



function CharacteristicCard({ icon, title, description }) {
    return (
        <div className="characteristic-card">
            <div className="characteristic-card-icon">{icon}</div>
            <h3 className="characteristic-card-title">{title}</h3>
            <p className="characteristic-card-description">{description}</p>
        </div>
    );
}
CharacteristicCard.propTypes = {
    icon: PropTypes.element.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
};

function SuccessStoryLogo({ name, logoUrl }) {
    return (
        <div className="success-logo">
            <img src={logoUrl} alt={`${name} logo`} />
            <span>{name}</span>
        </div>
    );
}
SuccessStoryLogo.propTypes = {
    name: PropTypes.string.isRequired,
    logoUrl: PropTypes.string.isRequired,
};


const StartupPage = () => {
    return (
        <div className="startup-page-wrapper">
            {/* --- Hero Section --- */}
            <section className="startup-hero-section">
                {/* Background image for the hero section */}
                <div className="hero-background">
                    <img src="/images/hero4.jpg" alt="Startup background" className="active" />
                </div>
                {/* Overlay for readability */}
                <div className="hero-overlay"></div>
                
                <div className="hero-content">
                    <h1>Where Great Ideas Begin</h1>
                    <p>Explore the forefront of innovation. Discover the next generation of startups and the visionary founders behind them.</p>
                    <Link to="/post-idea" className="hero-cta-button">Share Your Own Idea</Link>
                </div>
            </section>

            {/* --- "What is a Startup?" Section --- */}
            <section className="what-is-startup-section">
                <div className="section-container"> {/* This container was missing in your original code */}
                    <h2 className="section-heading">What is a Startup?</h2>
                    <p className="section-subheading">
                        A startup is not just a new business; it's a company designed to grow fast. Driven by innovation, they aim to create and capture value by offering a product or service in a highly scalable way.
                    </p>
                    <div className="characteristics-grid">
                        {startupCharacteristics.map(char => (
                            <CharacteristicCard key={char.title} {...char} />
                        ))}
                    </div>
                </div>
            </section>

            <section className="success-stories-section">
                <div className="section-container"> 
                    <h2 className="section-heading">From Idea to Industry Leader</h2>
                    <div className="success-logos-container">
                        <div className="success-logos-slide">
                            {successStories.map(story => <SuccessStoryLogo key={story.name} {...story} />)}
                            {successStories.map(story => <SuccessStoryLogo key={`${story.name}-clone`} {...story} />)}
                        </div>
                    </div>
                </div>
            </section>
            
            <section className="idea-list-embed-section">
                <IdeaList />
            </section>
        </div>
    );
};

export default StartupPage;