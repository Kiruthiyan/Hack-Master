import React, {useContext, useState } from 'react';
import { db, storage } from '../firebase'; // Import Realtime DB and Storage
import { ref as dbRef, set, push } from "firebase/database"; // Import DB functions
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import CreatableSelect from 'react-select/creatable';
import './AddStudent.css';
import { FaUser, FaCalendarAlt, FaUniversity, FaGraduationCap, FaAddressCard, FaIdCard, FaFileUpload, FaCheckCircle, FaTools, FaPhone, FaEnvelope, FaVenusMars, FaLinkedin } from 'react-icons/fa';
import { MdWork, MdSchool } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';

const AddStudent = () => {
    const initialState = {
        fullName: '', dateOfBirth: '', sex: 'Male', phoneNo: '', email: '',
        universityEmail: '', linkedin: '', university: '', degree: '',
        status: 'Intern', address: '', nicNo: '', skills: [],
    };
    const [formData, setFormData] = useState(initialState);
    const [files, setFiles] = useState({
        passportPhoto: null,
        nicCopy: null,
        universityIdCopy: null,
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');

    const auth  = useAuth()
    const universities = ["University of Moratuwa", "University of Colombo", "University of Peradeniya", "SLIIT", "NSBM", "Other"];
    const degrees = ["BSc in Computer Science", "BEng in Software Engineering", "BSc in Information Technology", "BBA in Business Administration", "Other"];
    const skillOptions = [
        { value: 'JavaScript', label: 'JavaScript' }, { value: 'React', label: 'React' },
        { value: 'Node.js', label: 'Node.js' }, { value: 'Python', label: 'Python' },
        { value: 'Java', label: 'Java' }, { value: 'Spring Boot', label: 'Spring Boot' },
        { value: 'SQL', label: 'SQL' }, { value: 'NoSQL', label: 'NoSQL' },
        { value: 'Docker', label: 'Docker' }, { value: 'AWS', label: 'AWS' },
    ];

    const validateField = (name, value) => {
        let errorMsg = '';
        const requiredFields = ['fullName', 'dateOfBirth', 'phoneNo', 'email', 'university', 'degree', 'address', 'nicNo'];
        
        if (requiredFields.includes(name) && typeof value === 'string' && !value.trim()) {
            errorMsg = 'This field is required.';
        } else if ((name === 'email' || name === 'universityEmail') && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            errorMsg = 'Invalid email format.';
        } else if (name === 'phoneNo' && value && !/^\+?[0-9]{9,12}$/.test(value.replace(/\s/g, ''))) { // Allow spaces but check numbers
            errorMsg = 'Please enter a valid phone number (9-12 digits).';
        } else if (name === 'nicNo' && value && !/^\d{12}$|^\d{9}[vVxX]$/.test(value)) {
            errorMsg = 'Please enter a valid 12-digit or 9-digit + V/X NIC.';
        } else if (name === 'linkedin' && value && !/^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/.test(value)) {
            errorMsg = 'Please enter a valid LinkedIn profile URL.';
        } else if (name === 'skills' && Array.isArray(value) && value.length === 0) {
            errorMsg = 'Please add at least one skill.';
        }
        
        setErrors(prev => ({ ...prev, [name]: errorMsg }));
        return errorMsg === ''; // Return true if valid, false if error
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        validateField(name, value);
    };

    const handleSkillsChange = (selectedOptions) => {
        const skills = selectedOptions ? selectedOptions.map(option => option.value) : [];
        setFormData(prev => ({ ...prev, skills }));
        validateField('skills', skills);
    };

    const handleFileChange = (e) => {
        const { name, files: inputFiles } = e.target;
        if (inputFiles.length > 0) {
            setFiles(prev => ({ ...prev, [name]: inputFiles[0] }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Run validation on all fields before submitting and collect errors
        let isFormValid = true;
        Object.keys(formData).forEach(key => {
            if (!validateField(key, formData[key])) {
                isFormValid = false;
            }
        });

        if (!files.passportPhoto) {
            isFormValid = false;
        }

        if (!isFormValid) {
            alert('Please fix all errors and upload a passport photo before submitting.');
            return;
        }

        setLoading(true);
        setSubmitMessage('Submitting, please wait...');

        try {
            const uploadFile = async (file, path) => {
                if (!file) return null;
                const fileRef = storageRef(storage, `${path}/${uuidv4()}-${file.name}`);
                await uploadBytes(fileRef, file);
                return await getDownloadURL(fileRef);
            };

            const [passportPhotoUrl, nicCopyUrl, universityIdCopyUrl] = await Promise.all([
                uploadFile(files.passportPhoto, 'student_photos'),
                uploadFile(files.nicCopy, 'student_nic_copies'),
                uploadFile(files.universityIdCopy, 'student_uni_ids')
            ]);

            const finalJsonData = {
                ...formData,
                postedAt: new Date().toISOString(),
                fileUrls: {
                    passportPhotoUrl,
                    nicCopyUrl,
                    universityIdCopyUrl
                }
            };

            const studentListRef = dbRef(db, `students/${auth.currentUser.uid}`);
            await set(studentListRef, finalJsonData);
            
            setSubmitMessage("Data submitted successfully!");
            setFormData(initialState);
            setFiles({ passportPhoto: null, nicCopy: null, universityIdCopy: null });
            e.target.reset(); // Fully reset the form fields, including file inputs
        } catch (error) {
            console.error("Error submitting form: ", error);
            setSubmitMessage("An error occurred during submission.");
        } finally {
            setLoading(false);
            setTimeout(() => setSubmitMessage(''), 5000);
        }
    };

    // Helper to dynamically apply CSS classes for validation
    const getValidationClass = (fieldName) => {
        if (errors[fieldName]) return 'invalid';
        if (Array.isArray(formData[fieldName])) { // Specifically for skills array
            if (formData[fieldName].length > 0 && !errors[fieldName]) return 'valid';
        } else if (formData[fieldName] && !errors[fieldName]) {
            return 'valid';
        }
        return '';
    };

    return (
        <div className="form-container">
            <form onSubmit={handleSubmit} noValidate>
                <h2>Student & Intern Registration</h2>
                <div className="form-grid">
                    {/* -- Personal Details -- */}
                    <div className="form-group full-width"><label className="form-label">Full Name</label><div className="input-wrapper"><FaUser className="input-icon" /><input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className={`form-input ${getValidationClass('fullName')}`} />{formData.fullName && !errors.fullName && <FaCheckCircle className="validation-icon valid" />}</div>{errors.fullName && <span className="validation-error">{errors.fullName}</span>}</div>
                    <div className="form-group"><label className="form-label">Date of Birth</label><div className="input-wrapper"><FaCalendarAlt className="input-icon" /><input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} className={`form-input ${getValidationClass('dateOfBirth')}`} />{formData.dateOfBirth && !errors.dateOfBirth && <FaCheckCircle className="validation-icon valid" />}</div>{errors.dateOfBirth && <span className="validation-error">{errors.dateOfBirth}</span>}</div>
                    <div className="form-group"><label className="form-label">Sex</label><div className="input-wrapper radio-group-sex"><FaVenusMars className="input-icon" /><div className="radio-options-wrapper"><label className="radio-option"><input type="radio" name="sex" value="Male" checked={formData.sex === 'Male'} onChange={handleInputChange} /> Male</label><label className="radio-option"><input type="radio" name="sex" value="Female" checked={formData.sex === 'Female'} onChange={handleInputChange} /> Female</label></div></div></div>
                    <div className="form-group"><label className="form-label">NIC Number</label><div className="input-wrapper"><FaIdCard className="input-icon" /><input type="text" name="nicNo" placeholder="e.g., 200012345678 or 991234567V" value={formData.nicNo} onChange={handleInputChange} className={`form-input ${getValidationClass('nicNo')}`} />{formData.nicNo && !errors.nicNo && <FaCheckCircle className="validation-icon valid" />}</div>{errors.nicNo && <span className="validation-error">{errors.nicNo}</span>}</div>
                    <div className="form-group"><label className="form-label">Phone No</label><div className="input-wrapper"><FaPhone className="input-icon" /><input type="tel" name="phoneNo" placeholder="e.g., 0771234567" value={formData.phoneNo} onChange={handleInputChange} className={`form-input ${getValidationClass('phoneNo')}`} />{formData.phoneNo && !errors.phoneNo && <FaCheckCircle className="validation-icon valid" />}</div>{errors.phoneNo && <span className="validation-error">{errors.phoneNo}</span>}</div>
                    <div className="form-group"><label className="form-label">Personal Email</label><div className="input-wrapper"><FaEnvelope className="input-icon" /><input type="email" name="email" value={formData.email} onChange={handleInputChange} className={`form-input ${getValidationClass('email')}`} />{formData.email && !errors.email && <FaCheckCircle className="validation-icon valid" />}</div>{errors.email && <span className="validation-error">{errors.email}</span>}</div>
                    <div className="form-group"><label className="form-label">University Email (Optional)</label><div className="input-wrapper"><FaEnvelope className="input-icon" /><input type="email" name="universityEmail" value={formData.universityEmail} onChange={handleInputChange} className={`form-input ${getValidationClass('universityEmail')}`} />{formData.universityEmail && !errors.universityEmail && <FaCheckCircle className="validation-icon valid" />}</div>{errors.universityEmail && <span className="validation-error">{errors.universityEmail}</span>}</div>
                    <div className="form-group full-width"><label className="form-label">LinkedIn Profile URL (Optional)</label><div className="input-wrapper"><FaLinkedin className="input-icon" /><input type="url" name="linkedin" placeholder="https://linkedin.com/in/your-profile" value={formData.linkedin} onChange={handleInputChange} className={`form-input ${getValidationClass('linkedin')}`} />{formData.linkedin && !errors.linkedin && <FaCheckCircle className="validation-icon valid" />}</div>{errors.linkedin && <span className="validation-error">{errors.linkedin}</span>}</div>
                    
                    {/* -- Academic Details -- */}
                    <div className="form-group"><label className="form-label">University</label><div className="input-wrapper"><FaUniversity className="input-icon" /><select name="university" value={formData.university} onChange={handleInputChange} className={`form-select ${getValidationClass('university')}`}><option value="">Select University</option>{universities.map(u => <option key={u} value={u}>{u}</option>)}</select></div>{errors.university && <span className="validation-error">{errors.university}</span>}</div>
                    <div className="form-group"><label className="form-label">Degree</label><div className="input-wrapper"><FaGraduationCap className="input-icon" /><select name="degree" value={formData.degree} onChange={handleInputChange} className={`form-select ${getValidationClass('degree')}`}><option value="">Select Degree</option>{degrees.map(d => <option key={d} value={d}>{d}</option>)}</select></div>{errors.degree && <span className="validation-error">{errors.degree}</span>}</div>
                    <div className="form-group"><label className="form-label">Current Status</label><div className="radio-group"><label className="radio-option"><input type="radio" name="status" value="Intern" checked={formData.status === 'Intern'} onChange={handleInputChange} /><MdWork /> Intern</label><label className="radio-option"><input type="radio" name="status" value="Degree Holder" checked={formData.status === 'Degree Holder'} onChange={handleInputChange} /><MdSchool /> Degree Holder</label></div></div>
                    <div className="form-group full-width"><label className="form-label">Address</label><div className="input-wrapper"><FaAddressCard className="input-icon" style={{top: '1rem', transform: 'none'}} /><textarea name="address" value={formData.address} onChange={handleInputChange} className={`form-textarea ${getValidationClass('address')}`}></textarea>{formData.address && !errors.address && <FaCheckCircle className="validation-icon valid" />}</div>{errors.address && <span className="validation-error">{errors.address}</span>}</div>
                    <div className="form-group full-width"><label className="form-label">Skills</label><div className="input-wrapper skills-wrapper"><FaTools className="input-icon" /><CreatableSelect isMulti options={skillOptions} value={formData.skills.map(skill => ({ value: skill, label: skill }))} onChange={handleSkillsChange} placeholder="Select or type to add skills..." className={`skills-select-container ${getValidationClass('skills')}`} classNamePrefix="select"/></div>{errors.skills && <span className="validation-error">{errors.skills}</span>}</div>
                    
                    {/* -- File Uploads -- */}
                    <div className="form-group"><label className="form-label">Passport Sized Photo (Required)</label><div className="input-wrapper file-input-wrapper" data-file-name={files.passportPhoto?.name || "Choose file..."}><FaFileUpload className="input-icon" /><input type="file" name="passportPhoto" onChange={handleFileChange} className="form-input" required /></div></div>
                    <div className="form-group"><label className="form-label">NIC Copy (Image)</label><div className="input-wrapper file-input-wrapper" data-file-name={files.nicCopy?.name || "Choose file..."}><FaFileUpload className="input-icon" /><input type="file" name="nicCopy" onChange={handleFileChange} className="form-input" /></div></div>
                    <div className="form-group"><label className="form-label">University ID Copy (Image)</label><div className="input-wrapper file-input-wrapper" data-file-name={files.universityIdCopy?.name || "Choose file..."}><FaFileUpload className="input-icon" /><input type="file" name="universityIdCopy" onChange={handleFileChange} className="form-input" /></div></div>
                    
                    <button type="submit" className="submit-btn full-width" disabled={loading}>{loading ? 'Submitting...' : 'Submit Registration'}</button>
                </div>
                {submitMessage && <p className="submit-message">{submitMessage}</p>}
            </form>
        </div>
    );
};

export default AddStudent;