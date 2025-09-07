import React, { useState } from "react";
import { db } from "../firebase"; 
import { ref, set, push } from "firebase/database"; 
import "./AddAdvertisement.css"; 
import {
  FaBuilding,
  FaBriefcase,
  FaUserTie,
  FaEnvelope,
  FaPhone,
  FaPencilAlt,
} from "react-icons/fa";
import { getAuth } from "firebase/auth";
import { useAuth } from "../context/AuthContext";

const AddAdvertisement = () => {
  const initialState = {
    companyName: "",
    position: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    message: "",
  };
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const auth = useAuth();

  const validateField = (name, value) => {
    let errorMsg = "";
    if (!value.trim()) {
      errorMsg = "This field is required.";
    } else if (
      name === "contactEmail" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ) {
      errorMsg = "Invalid email format.";
    }
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
    return errorMsg === "";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let isFormValid = true;
    Object.keys(formData).forEach((key) => {
      if (!validateField(key, formData[key])) {
        isFormValid = false;
      }
    });

    if (!isFormValid) {
      alert("Please fill all required fields correctly.");
      return;
    }

    setLoading(true);
    setSubmitMessage("Posting advertisement...");
    try {
      
      const finalJsonData = {
        ...formData,
        postedAt: new Date().toISOString(),
      };

      
      const adListRef = ref(db, `advertisements/${auth.currentUser.uid}`);

 

      await set(adListRef, finalJsonData);

      setSubmitMessage("Advertisement posted successfully!");
      setFormData(initialState);
      setErrors({});
      e.target.reset(); // Clear the form fields
    } catch (err) {
      console.error("Error posting advertisement: ", err);
      setSubmitMessage("Failed to post advertisement. Please try again.");
    } finally {
      setLoading(false);
      setTimeout(() => setSubmitMessage(""), 5000);
    }
  };

  const getValidationClass = (fieldName) => {
    if (errors[fieldName]) return "is-invalid";
    if (formData[fieldName] && !errors[fieldName]) return "is-valid";
    return "";
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} noValidate>
        <h2>Post a Job Advertisement</h2>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Company Name</label>
            <div className="input-wrapper">
              <FaBuilding className="input-icon" />
              <input
                type="text"
                name="companyName"
                className={`form-input ${getValidationClass("companyName")}`}
                value={formData.companyName}
                onChange={handleInputChange}
              />
            </div>
            {errors.companyName && (
              <span className="validation-error">{errors.companyName}</span>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Position / Job Title</label>
            <div className="input-wrapper">
              <FaBriefcase className="input-icon" />
              <input
                type="text"
                name="position"
                className={`form-input ${getValidationClass("position")}`}
                value={formData.position}
                onChange={handleInputChange}
              />
            </div>
            {errors.position && (
              <span className="validation-error">{errors.position}</span>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Contact Person</label>
            <div className="input-wrapper">
              <FaUserTie className="input-icon" />
              <input
                type="text"
                name="contactPerson"
                className={`form-input ${getValidationClass("contactPerson")}`}
                value={formData.contactPerson}
                onChange={handleInputChange}
              />
            </div>
            {errors.contactPerson && (
              <span className="validation-error">{errors.contactPerson}</span>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Contact Email</label>
            <div className="input-wrapper">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                name="contactEmail"
                className={`form-input ${getValidationClass("contactEmail")}`}
                value={formData.contactEmail}
                onChange={handleInputChange}
              />
            </div>
            {errors.contactEmail && (
              <span className="validation-error">{errors.contactEmail}</span>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Contact Phone</label>
            <div className="input-wrapper">
              <FaPhone className="input-icon" />
              <input
                type="tel"
                name="contactPhone"
                className={`form-input ${getValidationClass("contactPhone")}`}
                value={formData.contactPhone}
                onChange={handleInputChange}
              />
            </div>
            {errors.contactPhone && (
              <span className="validation-error">{errors.contactPhone}</span>
            )}
          </div>
          <div className="form-group full-width">
            <label className="form-label">Advertisement Message</label>
            <div className="input-wrapper">
              <FaPencilAlt className="input-icon" style={{ top: "18px" }} />
              <textarea
                name="message"
                rows="4"
                className={`form-textarea ${getValidationClass("message")}`}
                value={formData.message}
                onChange={handleInputChange}
              ></textarea>
            </div>
            {errors.message && (
              <span className="validation-error">{errors.message}</span>
            )}
          </div>
          <button
            type="submit"
            className="submit-btn full-width"
            disabled={loading}
          >
            {loading ? "Posting..." : "Post Advertisement"}
          </button>
        </div>
        {submitMessage && <p className="submit-message">{submitMessage}</p>}
      </form>
    </div>
  );
};

export default AddAdvertisement;
