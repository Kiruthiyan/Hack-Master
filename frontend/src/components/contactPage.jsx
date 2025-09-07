import React, { useState } from 'react';
import './ContactPage.css';

const ContactPage = () => {
  // State to manage the data in the form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  // State to manage the submission process (e.g., disabling the button)
  const [isSubmitting, setIsSubmitting] = useState(false);
  // State to display feedback to the user (e.g., success or error messages)
  const [statusMessage, setStatusMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  // This function updates the state whenever the user types in an input field
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
    
    // Clear status message when user starts typing
    if (statusMessage) {
      setStatusMessage('');
      setMessageType('');
    }
  };

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate form data
  const validateForm = () => {
    if (!formData.name.trim()) {
      setStatusMessage('Please enter your full name.');
      setMessageType('error');
      return false;
    }
    if (!formData.email.trim()) {
      setStatusMessage('Please enter your email address.');
      setMessageType('error');
      return false;
    }
    if (!validateEmail(formData.email)) {
      setStatusMessage('Please enter a valid email address.');
      setMessageType('error');
      return false;
    }
    if (!formData.subject.trim()) {
      setStatusMessage('Please enter a subject.');
      setMessageType('error');
      return false;
    }
    if (!formData.message.trim()) {
      setStatusMessage('Please enter your message.');
      setMessageType('error');
      return false;
    }
    if (formData.message.trim().length < 10) {
      setStatusMessage('Please enter a message with at least 10 characters.');
      setMessageType('error');
      return false;
    }
    return true;
  };

  // This function is called when the user clicks the "Send Message" button
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the browser from reloading the page
    
    // Validate form before submitting
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setStatusMessage('Sending your message...');
    setMessageType('info');

    try {
      // Send the form data to our Ballerina backend at the /api/contact endpoint
      const response = await fetch('http://localhost:9090/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData), // Convert the React state object into a JSON string
      });

      // Get the response message from the Ballerina service
      const responseData = await response.json();

      if (!response.ok) {
        // If the server responded with an error (e.g., status 500), throw an error
        throw new Error(responseData.message || 'An unknown server error occurred.');
      }

      // On success:
      setStatusMessage(responseData.message || 'Thank you for your message! We\'ll get back to you soon.'); 
      setMessageType('success');
      setFormData({ name: '', email: '', subject: '', message: '' }); // Clear the form fields
      
      // Log success for debugging
      console.log('Contact form submitted successfully:', responseData);

    } catch (error) {
      // If the fetch fails or the server returns an error, display the error message
      let errorMessage = 'Failed to send your message. Please try again.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
      }
      
      setStatusMessage(errorMessage);
      setMessageType('error');
      console.error("Failed to send contact form:", error);
    } finally {
      // This code runs after the try/catch block, regardless of success or failure
      setIsSubmitting(false); // Re-enable the submit button
    }
  };

  return (
    <div className="contact-page-wrapper">
      <div className="contact-header">
        <h1>Contact Us</h1>
        <p>We'd love to hear from you. Please fill out the form below or use the contact details provided.</p>
      </div>
      <div className="contact-body">
        <div className="contact-form-container">
          {/* The form now calls our handleSubmit function on submission */}
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange} 
                required 
                disabled={isSubmitting}
                maxLength="100"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value={formData.email} 
                onChange={handleInputChange} 
                required 
                disabled={isSubmitting}
                maxLength="100"
              />
            </div>
            <div className="form-group">
              <label htmlFor="subject">Subject *</label>
              <input 
                type="text" 
                id="subject" 
                name="subject" 
                value={formData.subject} 
                onChange={handleInputChange} 
                required 
                disabled={isSubmitting}
                maxLength="200"
              />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message *</label>
              <textarea 
                id="message" 
                name="message" 
                rows="6" 
                value={formData.message} 
                onChange={handleInputChange} 
                required
                disabled={isSubmitting}
                maxLength="1000"
                placeholder="Please enter at least 10 characters..."
              ></textarea>
              <small className="char-count">
                {formData.message.length}/1000 characters
              </small>
            </div>
            {/* The button is disabled during submission to prevent multiple clicks */}
            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
            {/* Display the status message (e.g., success or error) below the button */}
            {statusMessage && (
              <div className={`status-message ${messageType}`}>
                <p>{statusMessage}</p>
              </div>
            )}
          </form>
        </div>
        <div className="contact-info-container">
          <h2>Contact Information</h2>
          <p><strong>Address:</strong> 123 Business Avenue, Suite 456, Metropolis, USA</p>
          <p><strong>Phone:</strong> <a href="tel:+1234567890">+1 (234) 567-890</a></p>
          <p><strong>Email:</strong> <a href="mailto:contact@yourbusiness.com">contact@yourbusiness.com</a></p>
          <div className="map-container">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.220197472337!2d-73.9856644845941!3d40.7484409793284!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1620202020202"
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              title="Google Maps Location"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;