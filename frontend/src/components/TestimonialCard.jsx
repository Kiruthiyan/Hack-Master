import React from 'react';
import PropTypes from 'prop-types';
import './TestimonialCard.css'; 

function TestimonialCard({ image, name, job, opinion }) {
  return (
    <div className="testimonial-card">
      <img src={image} className="testimonial-img" alt={`${name}'s testimonial`} />
      <div className="testimonial-content">
        <p className="testimonial-opinion">"{opinion}"</p>
        <div className="testimonial-author">
          <h4 className="author-name">{name}</h4>
          <p className="author-job">{job}</p>
        </div>
      </div>
    </div>
  );
}
TestimonialCard.propTypes = {
  image: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  job: PropTypes.string.isRequired,
  opinion: PropTypes.string.isRequired,
};

export default TestimonialCard;