import '../../styles/AdminDashboard.css';
import axios from 'axios';
import API_URL from '../../utils/api';
import { useState, useEffect } from 'react';

const Patients = ({ searchQuery }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [filterGender, setFilterGender] = useState('');
  const [filterBlood, setFilterBlood] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    gender: 'Male',
    contactNumber: '',
    address: '',
    bloodType: 'O+'
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/admin/patients`, { withCredentials: true });
      setPatients(res.data.patients || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = !searchQuery || 
      patient.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.patientId?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesGender = !filterGender || patient.gender === filterGender;
    const matchesBlood = !filterBlood || patient.bloodType === filterBlood;
    
    return matchesSearch && matchesGender && matchesBlood;
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/admin/patients`, formData, { withCredentials: true });
      setShowAddModal(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        dateOfBirth: '',
        gender: 'Male',
        contactNumber: '',
        address: '',
        bloodType: 'O+'
      });
      fetchPatients();
    } catch (error) {
      console.error('Error adding patient:', error);
    }
  };

  const handleDeletePatient = async (patientId) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await axios.delete(`${API_URL}/api/admin/patients/${patientId}`, { withCredentials: true });
        fetchPatients();
        setSelectedPatient(null);
      } catch (error) {
        console.error('Error deleting patient:', error);
      }
    }
  };

  if (loading) {
    return <div className="admin-content-wrapper"><p>Loading patients...</p></div>;
  }

  return (
    <div className="admin-content-wrapper">
      <div className="admin-header-section">
        <h1>Patients</h1>
        <button className="btn-add-primary" onClick={() => setShowAddModal(true)}>+ Add Patient</button>
      </div>

      <div className="admin-filters">
        <select 
          value={filterGender} 
          onChange={(e) => setFilterGender(e.target.value)}
          className="filter-select"
        >
          <option value="">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <select 
          value={filterBlood} 
          onChange={(e) => setFilterBlood(e.target.value)}
          className="filter-select"
        >
          <option value="">All Blood Types</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
        </select>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Patient ID</th>
              <th>Email</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Blood Type</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient) => (
              <tr key={patient._id}>
                <td><strong>{patient.name}</strong></td>
                <td>{patient.patientId}</td>
                <td>{patient.email}</td>
                <td>{patient.age}</td>
                <td>{patient.gender}</td>
                <td>
                  <span className={`badge badge-blood-${patient.bloodType?.replace('+', 'plus').replace('-', 'minus')}`}>
                    {patient.bloodType}
                  </span>
                </td>
                <td>{patient.contactNumber}</td>
                <td className="action-buttons">
                  <button 
                    className="admin-btn-view"
                    onClick={() => setSelectedPatient(patient)}
                  >
                    View
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => handleDeletePatient(patient._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Add New Patient</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>

            <form onSubmit={handleAddPatient} className="admin-form">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date of Birth *</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Gender *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Blood Type *</label>
                  <select
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div className="form-group full-width">
                <label>Address *</label>
                <textarea
                  name="address"
                  rows="3"
                  value={formData.address}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-submit">Add Patient</button>
                <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Patient Details Modal */}
      {selectedPatient && (
        <div className="admin-modal-overlay" onClick={() => setSelectedPatient(null)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Patient Details</h2>
              <button className="modal-close" onClick={() => setSelectedPatient(null)}>×</button>
            </div>

            <div className="patient-details-view">
              <div className="detail-row">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{selectedPatient.name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Patient ID:</span>
                <span className="detail-value">{selectedPatient.patientId}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{selectedPatient.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">{selectedPatient.contactNumber}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Age:</span>
                <span className="detail-value">{selectedPatient.age}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Gender:</span>
                <span className="detail-value">{selectedPatient.gender}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Blood Type:</span>
                <span className={`badge badge-blood-${selectedPatient.bloodType?.replace('+', 'plus').replace('-', 'minus')}`}>
                  {selectedPatient.bloodType}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Address:</span>
                <span className="detail-value">{selectedPatient.address}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;
