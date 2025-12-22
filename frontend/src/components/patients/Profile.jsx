import '../../styles/PatientDashboard.css';
import axios from 'axios';
import { useState, useEffect } from 'react';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editMode, setEditMode] = useState('info'); // 'info', 'password', 'emergency'
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    bloodType: '',
    medicalHistory: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [emergencyContactData, setEmergencyContactData] = useState({
    emergencyName: '',
    emergencyPhone: ''
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/patients/profile', { withCredentials: true });
      setProfile(response.data.patient);
      
      // Set initial form data
      setFormData({
        name: response.data.patient.name || '',
        contactNumber: response.data.patient.contactNumber || '',
        address: response.data.patient.address || '',
        dateOfBirth: response.data.patient.dateOfBirth ? response.data.patient.dateOfBirth.split('T')[0] : '',
        gender: response.data.patient.gender || '',
        bloodType: response.data.patient.bloodType || '',
        medicalHistory: response.data.patient.medicalHistory ? response.data.patient.medicalHistory.join(', ') : ''
      });

      if (response.data.patient.emergencyContact) {
        setEmergencyContactData({
          emergencyName: response.data.patient.emergencyContact.name || '',
          emergencyPhone: response.data.patient.emergencyContact.emergencyPhone || ''
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
    }
  };

  const handleEditClick = (mode) => {
    setIsEditing(true);
    setEditMode(mode);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditMode('info');
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEmergencyChange = (e) => {
    const { name, value } = e.target;
    setEmergencyContactData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const submitProfileUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await axios.put(
        'http://localhost:3000/api/patients/profile',
        {
          name: formData.name,
          contactNumber: formData.contactNumber,
          address: formData.address,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          bloodType: formData.bloodType,
          medicalHistory: formData.medicalHistory.split(',').map(item => item.trim()).filter(item => item)
        },
        { withCredentials: true }
      );

      setProfile(response.data.patient);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => {
        setIsEditing(false);
        setSuccessMessage('');
      }, 2000);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Error updating profile');
    } finally {
      setSubmitting(false);
    }
  };

  const submitPasswordUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage('Passwords do not match');
      setSubmitting(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      setSubmitting(false);
      return;
    }

    try {
      await axios.put(
        'http://localhost:3000/api/patients/update-password',
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        { withCredentials: true }
      );

      setSuccessMessage('Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setIsEditing(false);
        setSuccessMessage('');
      }, 2000);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Error updating password');
    } finally {
      setSubmitting(false);
    }
  };

  const submitEmergencyContact = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await axios.put(
        'http://localhost:3000/api/patients/emergency-contact',
        {
          emergencyName: emergencyContactData.emergencyName,
          emergencyPhone: emergencyContactData.emergencyPhone
        },
        { withCredentials: true }
      );

      setProfile(response.data.patient);
      setSuccessMessage('Emergency contact updated successfully!');
      setTimeout(() => {
        setIsEditing(false);
        setSuccessMessage('');
      }, 2000);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Error updating emergency contact');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="profile-content"><p>Loading profile...</p></div>;
  }

  if (!profile) {
    return <div className="profile-content"><p>Unable to load profile</p></div>;
  }

  return (
    <div className="profile-content">
      {!isEditing && (
        <>
          <div className="section-header">
            <h2>My Profile</h2>
            <div className="profile-action-buttons">
              <button className="btn-secondary" onClick={() => handleEditClick('info')}>Edit Information</button>
              <button className="btn-secondary" onClick={() => handleEditClick('password')}>Change Password</button>
              <button className="btn-secondary" onClick={() => handleEditClick('emergency')}>Update Emergency Contact</button>
            </div>
          </div>

          <div className="profile-card">
            <div className="profile-section">
              <h3>Personal Information</h3>
              <div className="profile-grid">
                <div className="profile-item">
                  <label>Full Name</label>
                  <p>{profile.name}</p>
                </div>
                <div className="profile-item">
                  <label>Email</label>
                  <p>{profile.email}</p>
                </div>
                <div className="profile-item">
                  <label>Phone Number</label>
                  <p>{profile.contactNumber}</p>
                </div>
                <div className="profile-item">
                  <label>Date of Birth</label>
                  <p>{profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="profile-item">
                  <label>Gender</label>
                  <p>{profile.gender}</p>
                </div>
                <div className="profile-item">
                  <label>Blood Type</label>
                  <p>{profile.bloodType}</p>
                </div>
              </div>
            </div>

            <div className="profile-section">
              <h3>Address</h3>
              <p>{profile.address}</p>
            </div>

            <div className="profile-section">
              <h3>Patient ID</h3>
              <p>{profile.patientId}</p>
            </div>

            <div className="profile-section">
              <h3>Emergency Contact</h3>
              {profile.emergencyContact && profile.emergencyContact.name ? (
                <div className="profile-grid">
                  <div className="profile-item">
                    <label>Name</label>
                    <p>{profile.emergencyContact.name}</p>
                  </div>
                  <div className="profile-item">
                    <label>Phone Number</label>
                    <p>{profile.emergencyContact.emergencyPhone}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted">No emergency contact added</p>
              )}
            </div>

            {profile.medicalHistory && profile.medicalHistory.length > 0 && (
              <div className="profile-section">
                <h3>Medical History</h3>
                <p>{profile.medicalHistory.join(', ')}</p>
              </div>
            )}
          </div>
        </>
      )}

      {isEditing && (
        <div className="profile-edit-modal">
          <div className="modal-header">
            <h2>
              {editMode === 'info' && 'Edit Personal Information'}
              {editMode === 'password' && 'Change Password'}
              {editMode === 'emergency' && 'Update Emergency Contact'}
            </h2>
            <button className="modal-close" onClick={handleCancel}>×</button>
          </div>

          {successMessage && <div className="alert alert-success">{successMessage}</div>}
          {errorMessage && <div className="alert alert-error">{errorMessage}</div>}

          {editMode === 'info' && (
            <form onSubmit={submitProfileUpdate} className="profile-edit-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="number"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleFormChange}
                />
              </div>

              <div className="form-group">
                <label>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleFormChange} required>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Blood Type</label>
                <select name="bloodType" value={formData.bloodType} onChange={handleFormChange} required>
                  <option value="">Select Blood Type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div className="form-group">
                <label>Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleFormChange}
                  required
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Medical History (comma-separated)</label>
                <textarea
                  name="medicalHistory"
                  value={formData.medicalHistory}
                  onChange={handleFormChange}
                  rows="3"
                  placeholder="e.g., Diabetes, Hypertension, Asthma"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" className="btn-secondary" onClick={handleCancel}>Cancel</button>
              </div>
            </form>
          )}

          {editMode === 'password' && (
            <form onSubmit={submitPasswordUpdate} className="profile-edit-form">
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength="6"
                />
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength="6"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Updating...' : 'Update Password'}
                </button>
                <button type="button" className="btn-secondary" onClick={handleCancel}>Cancel</button>
              </div>
            </form>
          )}

          {editMode === 'emergency' && (
            <form onSubmit={submitEmergencyContact} className="profile-edit-form">
              <div className="form-group">
                <label>Emergency Contact Name</label>
                <input
                  type="text"
                  name="emergencyName"
                  value={emergencyContactData.emergencyName}
                  onChange={handleEmergencyChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Emergency Contact Phone</label>
                <input
                  type="number"
                  name="emergencyPhone"
                  value={emergencyContactData.emergencyPhone}
                  onChange={handleEmergencyChange}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Emergency Contact'}
                </button>
                <button type="button" className="btn-secondary" onClick={handleCancel}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
