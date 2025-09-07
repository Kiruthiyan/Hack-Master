import React, {useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getData } from '../apiService';
import './IdeaList.css'; 

// ===================================================================
// SECTION 1: REUSABLE SUB-COMPONENT for a single Idea Card
// ===================================================================
function IdeaCard({ data }) {
    // --- CORRECTED CODE ---
    // We now look for the photo URL inside the 'fileUrls' object.
    const photoUrl = data.fileUrls?.founderPhotoUrl || '/images/default-profile.png';
    
    // This logic correctly finds all certificate URLs inside the 'fileUrls' object.
    const certificates = data.fileUrls ? 
        Object.values(data.fileUrls).filter(url => url && (url.includes('certificate') || url.includes('doc'))) : [];

    return (
        <div className="card-container idea-card">
            <div className="founder-header">
                <img src={photoUrl} className="img" alt={`${data.founderName} profile`} />
                <div className="founder-details">
                    <h3>{data.founderName || 'Founder Name'}</h3>
                    <p className="founder-degree">{data.founderDegree || 'Degree not specified'}</p>
                    {data.startupStatus && <div className="status-badge">{data.startupStatus}</div>}
                </div>
            </div>
            <div className="idea-content">
                <h4 className="idea-project-name">{data.projectName || 'Unnamed Project'}</h4>
                <p className="idea-company-name">For: {data.companyName || 'N/A'}</p>
                <p className="idea-description">"{data.ideaDescription || 'No description provided.'}"</p>
            </div>
            {Array.isArray(data.needs) && data.needs.length > 0 && (
                <div className="skills needs-section">
                    <h6>Looking For</h6>
                    <ul>{data.needs.map((need, i) => <li key={i}>{need}</li>)}</ul>
                </div>
            )}
            {Array.isArray(data.founderSkills) && data.founderSkills.length > 0 && (
                 <div className="skills">
                    <h6>Founder's Skills</h6>
                    <ul>{data.founderSkills.map((skill, i) => <li key={i}>{skill}</li>)}</ul>
                </div>
            )}
            {certificates.length > 0 && (
                <div className="skills certificate-section">
                    <h6>Certificates & Documents</h6>
                    <div className="certificate-links">
                        {certificates.map((url, i) => (
                            <a href={url} target="_blank" rel="noopener noreferrer" key={i}>View Doc {i + 1}</a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
IdeaCard.propTypes = { data: PropTypes.object.isRequired };

// ===================================================================
// SECTION 2: MAIN COMPONENT (No changes needed here)
// ===================================================================
const IdeaList = () => {
    const [ideas, setIdeas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchIdeasFromBackend = async () => {
            try {
                const dataFromBackend = await getData('ideas');
                const ideasArray = dataFromBackend ? 
                    Object.keys(dataFromBackend).map(key => ({
                        id: key,
                        ...dataFromBackend[key]
                    })) : [];

                setIdeas(ideasArray);
            } catch (err) {
                console.error("Error fetching ideas from backend: ", err);
                setError("Could not load ideas. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchIdeasFromBackend();
    }, []);

    if (error) { return <p className="error-message">{error}</p>; }
    if (loading) { return <div className="loading-message">Loading Startup Ideas...</div>; }

    return (
        <div className="idea-page-wrapper">
            <div id="main-idea-list">
                <div className="section-divider-container">
                    <hr className="section-divider" />
                    <h2 className="section-title">Startup Ideas & Ventures</h2>
                </div>
                
                <div className="idea-list-container">
                    {ideas.length > 0 ? (
                        ideas.map(idea => <IdeaCard key={idea.id} data={idea} />)
                    ) : (
                        <p className="no-results-message">No ideas have been posted yet. Be the first!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IdeaList;