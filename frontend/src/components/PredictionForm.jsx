import React, { useState } from 'react';
import './PredictionForm.css'; // We will create this

const PredictionForm = () => {
  const [formData, setFormData] = useState({
    founded_year: '2023',
    funding_usd: '500000',
    industry: 'IT',
    country: 'USA',
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPrediction(null);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/predict-success', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Prediction failed.');
      }
      setPrediction(data.success_probability);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="prediction-wrapper">
      <h2>Startup Success Predictor</h2>
      <div className="prediction-container">
        <form onSubmit={handleSubmit} className="prediction-form">
          <div className="form-group">
            <label>Founded Year</label>
            <input type="number" name="founded_year" value={formData.founded_year} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Funding (USD)</label>
            <input type="number" name="funding_usd" value={formData.funding_usd} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Industry</label>
            <select name="industry" value={formData.industry} onChange={handleInputChange}>
              {/* These options should match your CSV data */}
              <option>IT</option>
              <option>Healthcare</option>
              <option>Fintech</option>
              <option>E-commerce</option>
              <option>SaaS</option>
            </select>
          </div>
          <div className="form-group">
            <label>Country</label>
            <select name="country" value={formData.country} onChange={handleInputChange}>
              {/* These options should match your CSV data */}
              <option>USA</option>
              <option>Canada</option>
              <option>UK</option>
              <option>Germany</option>
              <option>India</option>
              <option>Sri Lanka</option>

            </select>
          </div>
          <button type="submit" disabled={loading}>{loading ? 'Analyzing...' : 'Predict Success'}</button>
        </form>
        
        <div className="prediction-result-container">
          <h3>Prediction Result</h3>
          <div className="prediction-output">
            {loading && <p>AI is thinking...</p>}
            {error && <p className="error-text">{error}</p>}
            {prediction !== null && (
              <div className="result-display">
                <div className="probability-text">
                  {(prediction * 100).toFixed(1)}%
                </div>
                <p>Probability of Success</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionForm;