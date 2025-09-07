import React, { useState } from 'react';
import { db, storage } from '../firebase';
import { ref as dbRef, set, push } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import Select from 'react-select';
import './AddIdea.css'; // You'll need an AddIdea.css file for styling
import { FaUser, FaBuilding, FaLightbulb, FaPhone, FaEnvelope, FaGraduationCap, FaTools, FaCheckSquare, FaFileUpload, FaCheckCircle } from 'react-icons/fa';

const AddIdea = () => {
    const initialState = {
        founderName: '', companyName: '', projectName: '', ideaDescription: '',
        startupStatus: 'Planning', needs: [], contactPhone: '', contactEmail: '',
        founderDegree: '', founderSkills: [],
    };
    const [formData, setFormData] = useState(initialState);
    const [files, setFiles] = useState({
        founderPhoto: null, cert1: null, cert2: null, cert3: null, cert4: null, cert5: null,
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');

    const skillOptions = [{ value: 'React', label: 'React' }, { value: 'Node.js', label: 'Node.js' }, { value: 'Marketing', label: 'Marketing' }, { value: 'Finance', label: 'Finance' }, { value: 'UI/UX Design', label: 'UI/UX Design' }];

    const validateField = (name, value) => {
        let errorMsg = '';
        const requiredFields = ['founderName', 'companyName', 'projectName', 'ideaDescription', 'contactPhone', 'contactEmail'];

        if (requiredFields.includes(name) && typeof value === 'string' && !value.trim()) {
            errorMsg = 'This field is required.';
        } else if (name === 'contactEmail' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            errorMsg = 'Invalid email format.';
        }
        
        setErrors(prev => ({ ...prev, [name]: errorMsg }));
        return errorMsg === '';
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        validateField(name, value);
    };
    const handleSkillsChange = (selected) => {
        setFormData(prev => ({ ...prev, founderSkills: selected || [] }));
    };
    const handleFileChange = (e) => {
        setFiles(prev => ({ ...files, [e.target.name]: e.target.files[0] }));
    };
    const handleNeedsChange = (e) => {
        const { value, checked } = e.target;
        let currentNeeds = formData.needs;
        if (checked) { currentNeeds = [...currentNeeds, value]; } 
        else { currentNeeds = currentNeeds.filter(need => need !== value); }
        setFormData(prev => ({ ...formData, needs: currentNeeds }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        let isFormValid = true;
        Object.keys(formData).forEach(key => { if (!validateField(key, formData[key])) { isFormValid = false; } });

        if (!files.founderPhoto) {
            isFormValid = false;
        }

        if (!isFormValid) {
            alert('Please fix all errors and upload a founder photo before submitting.');
            return;
        }
        
        setLoading(true);
        setSubmitMessage('Posting your idea...');

        try {
            const uploadFile = async (file, path) => {
                if (!file) return null;
                const fileRef = storageRef(storage, `${path}/${uuidv4()}-${file.name}`);
                await uploadBytes(fileRef, file);
                return await getDownloadURL(fileRef);
            };

            const [
                founderPhotoUrl, cert1Url, cert2Url, cert3Url, cert4Url, cert5Url
            ] = await Promise.all([
                uploadFile(files.founderPhoto, 'idea_photos'),
                uploadFile(files.cert1, 'idea_certificates'), uploadFile(files.cert2, 'idea_certificates'),
                uploadFile(files.cert3, 'idea_certificates'), uploadFile(files.cert4, 'idea_certificates'),
                uploadFile(files.cert5, 'idea_certificates'),
            ]);

            const finalJsonData = {
                ...formData,
                founderSkills: formData.founderSkills.map(s => s.value),
                postedAt: new Date().toISOString(),
                fileUrls: { founderPhotoUrl, cert1Url, cert2Url, cert3Url, cert4Url, cert5Url }
            };
            
            const ideaListRef = dbRef(db, 'ideas');
            const newIdeaRef = push(ideaListRef);
            await set(newIdeaRef, finalJsonData);

            setSubmitMessage('Your idea has been posted successfully!');
            setFormData(initialState);
            setFiles({ founderPhoto: null, cert1: null, cert2: null, cert3: null, cert4: null, cert5: null });
            e.target.reset();

        } catch (err) {
            console.error("Error in submission process: ", err);
            setSubmitMessage("An error occurred. Please try again.");
        } finally {
            setLoading(false);
            setTimeout(() => setSubmitMessage(''), 5000);
        }
    };
    
    const getValidationClass = (fieldName) => {
        if (errors[fieldName]) return 'invalid';
        if (Array.isArray(formData[fieldName])) {
            if (formData[fieldName].length > 0 && !errors[fieldName]) return 'valid';
        } else if (formData[fieldName] && !errors[fieldName]) {
            return 'valid';
        }
        return '';
    };

    return (
        <div className="form-container idea-form">
            <form onSubmit={handleSubmit} noValidate>
                <h2>Share Your Startup Idea</h2>
                <div className="form-grid">
                    {/* Founder & Company Details */}
                    <div className="form-group"><label className="form-label">Your Name</label><div className="input-wrapper"><FaUser className="input-icon" /><input type="text" name="founderName" value={formData.founderName} onChange={handleInputChange} className={`form-input ${getValidationClass('founderName')}`} />{formData.founderName && !errors.founderName && <FaCheckCircle className="validation-icon valid" />}</div>{errors.founderName && <span className="validation-error">{errors.founderName}</span>}</div>
                    <div className="form-group"><label className="form-label">Company Name (or Proposed)</label><div className="input-wrapper"><FaBuilding className="input-icon" /><input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} className={`form-input ${getValidationClass('companyName')}`} />{formData.companyName && !errors.companyName && <FaCheckCircle className="validation-icon valid" />}</div>{errors.companyName && <span className="validation-error">{errors.companyName}</span>}</div>
                    <div className="form-group full-width"><label className="form-label">Project / Idea Name</label><div className="input-wrapper"><FaLightbulb className="input-icon" /><input type="text" name="projectName" value={formData.projectName} onChange={handleInputChange} className={`form-input ${getValidationClass('projectName')}`} />{formData.projectName && !errors.projectName && <FaCheckCircle className="validation-icon valid" />}</div>{errors.projectName && <span className="validation-error">{errors.projectName}</span>}</div>
                    <div className="form-group full-width"><label className="form-label">Idea Description</label><div className="input-wrapper"><textarea name="ideaDescription" rows="4" value={formData.ideaDescription} onChange={handleInputChange} className={`form-textarea ${getValidationClass('ideaDescription')}`}></textarea>{formData.ideaDescription && !errors.ideaDescription && <FaCheckCircle className="validation-icon valid" />}</div>{errors.ideaDescription && <span className="validation-error">{errors.ideaDescription}</span>}</div>

                    {/* Status & Needs */}
                    <div className="form-group"><label className="form-label">Current Status</label><div className="radio-group"><label className="radio-option"><input type="radio" name="startupStatus" value="Planning" checked={formData.startupStatus === 'Planning'} onChange={handleInputChange} /> Planning to Start</label><label className="radio-option"><input type="radio" name="startupStatus" value="Existing" checked={formData.startupStatus === 'Existing'} onChange={handleInputChange} /> Already Have a Startup</label></div></div>
                    <div className="form-group"><label className="form-label">I am looking for...</label><div className="checkbox-group"><label className="checkbox-option"><input type="checkbox" value="Financial Support" onChange={handleNeedsChange} /> <FaCheckSquare /> Financial Support</label><label className="checkbox-option"><input type="checkbox" value="Mentorship" onChange={handleNeedsChange} /> <FaCheckSquare /> Idea Validation / Mentorship</label></div></div>
                    
                    {/* Founder Background */}
                    <div className="form-group"><label className="form-label">Your Degree (Optional)</label><div className="input-wrapper"><FaGraduationCap className="input-icon" /><input type="text" name="founderDegree" value={formData.founderDegree} onChange={handleInputChange} className="form-input" /></div></div>
                    <div className="form-group"><label className="form-label">Your Top Skills</label><div className="input-wrapper skills-wrapper"><FaTools className="input-icon" /><Select isMulti options={skillOptions} value={formData.founderSkills} onChange={handleSkillsChange} className="skills-select-container" classNamePrefix="select"/></div></div>

                    {/* Contact Details */}
                    <div className="form-group"><label className="form-label">Contact Email</label><div className="input-wrapper"><FaEnvelope className="input-icon" /><input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleInputChange} className={`form-input ${getValidationClass('contactEmail')}`} />{formData.contactEmail && !errors.contactEmail && <FaCheckCircle className="validation-icon valid" />}</div>{errors.contactEmail && <span className="validation-error">{errors.contactEmail}</span>}</div>
                    <div className="form-group"><label className="form-label">Contact Phone</label><div className="input-wrapper"><FaPhone className="input-icon" /><input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleInputChange} className={`form-input ${getValidationClass('contactPhone')}`} />{formData.contactPhone && !errors.contactPhone && <FaCheckCircle className="validation-icon valid" />}</div>{errors.contactPhone && <span className="validation-error">{errors.contactPhone}</span>}</div>

                    {/* File Uploads */}
                    <h3 className="form-section-header full-width">Upload Documents</h3>
                    <div className="form-group"><label className="form-label">Your Photo (Required)</label><div className="input-wrapper file-input-wrapper" data-file-name={files.founderPhoto?.name || "Choose file..."}><FaFileUpload className="input-icon" /><input type="file" name="founderPhoto" onChange={handleFileChange} className="form-input" required /></div></div>
                    <div className="form-group"><label className="form-label">Certificate 1</label><div className="input-wrapper file-input-wrapper" data-file-name={files.cert1?.name || "Choose file..."}><FaFileUpload className="input-icon" /><input type="file" name="cert1" onChange={handleFileChange} className="form-input" /></div></div>
                    <div className="form-group"><label className="form-label">Certificate 2</label><div className="input-wrapper file-input-wrapper" data-file-name={files.cert2?.name || "Choose file..."}><FaFileUpload className="input-icon" /><input type="file" name="cert2" onChange={handleFileChange} className="form-input" /></div></div>
                    <div className="form-group"><label className="form-label">Certificate 3</label><div className="input-wrapper file-input-wrapper" data-file-name={files.cert3?.name || "Choose file..."}><FaFileUpload className="input-icon" /><input type="file" name="cert3" onChange={handleFileChange} className="form-input" /></div></div>
                    <div className="form-group"><label className="form-label">Certificate 4</label><div className="input-wrapper file-input-wrapper" data-file-name={files.cert4?.name || "Choose file..."}><FaFileUpload className="input-icon" /><input type="file" name="cert4" onChange={handleFileChange} className="form-input" /></div></div>
                    <div className="form-group"><label className="form-label">Certificate 5</label><div className="input-wrapper file-input-wrapper" data-file-name={files.cert5?.name || "Choose file..."}><FaFileUpload className="input-icon" /><input type="file" name="cert5" onChange={handleFileChange} className="form-input" /></div></div>

                    <button type="submit" className="submit-btn full-width" disabled={loading}>{loading ? 'Submitting...' : 'Post My Idea'}</button>
                </div>
                {submitMessage && <p className="submit-message">{submitMessage}</p>}
            </form>
        </div>
    );
};

export default AddIdea;