import '../../styles/PatientDashboard.css';
import axios from 'axios';
import { useState, useEffect } from 'react';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editMode, setEditMode] = useState('info'); // 'info', 'password'
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    experience: '',
    education: '',
    address: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/doctors/profile', { withCredentials: true });
      setProfile(response.data.doctor);
      
      setFormData({
        name: response.data.doctor.name || '',
        email: response.data.doctor.email || '',
        phone: response.data.doctor.phone || '',
        specialization: response.data.doctor.specialization || '',
        experience: response.data.doctor.experience || '',
        education: response.data.doctor.education || '',
        address: response.data.doctor.address || ''
      });

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

  const submitProfileUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await axios.put(
        'http://localhost:3000/api/doctors/profile',
        formData,
        { withCredentials: true }
      );

      setProfile(response.data.doctor);
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
        'http://localhost:3000/api/doctors/update-password',
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
            </div>
          </div>

          <div className="profile-card">
            <div className="profile-section">
              <h3>Profile Photo</h3>
              <div className="profile-photo-placeholder">
                {profile.image ? (
                  <img 
                    src={profile.image} 
                    alt={profile.name}
                    style={{ width: '150px', height: '150px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                ) : (
                  <>
                    <div className="photo-icon">👨‍⚕️</div>
                    <p className="text-muted">Profile photo upload coming soon</p>
                  </>
                )}
              </div>
            </div>

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
                  <p>{profile.phone}</p>
                </div>
                <div className="profile-item">
                  <label>Specialization</label>
                  <p>{profile.specialization}</p>
                </div>
                <div className="profile-item">
                  <label>Experience</label>
                  <p>{profile.experience}</p>
                </div>
                <div className="profile-item">
                  <label>Education</label>
                  <p>{profile.education}</p>
                </div>
              </div>
            </div>

            <div className="profile-section">
              <h3>Address</h3>
              <p>{profile.address}</p>
            </div>

            <div className="profile-section">
              <h3>Status</h3>
              <span className={`status-badge status-${profile.status?.toLowerCase()}`}>
                {profile.status}
              </span>
            </div>
          </div>
        </>
      )}

      {isEditing && (
        <div className="profile-edit-modal">
          <div className="modal-header">
            <h2>
              {editMode === 'info' && 'Edit Profile Information'}
              {editMode === 'password' && 'Change Password'}
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
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Specialization</label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Experience</label>
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleFormChange}
                  placeholder="e.g., 10 years"
                />
              </div>

              <div className="form-group">
                <label>Education</label>
                <input
                  type="text"
                  name="education"
                  value={formData.education}
                  onChange={handleFormChange}
                  placeholder="e.g., MBBS, MD"
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleFormChange}
                  rows="3"
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
        </div>
      )}
    </div>
  );
};

export default Profile;
