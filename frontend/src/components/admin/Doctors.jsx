import '../../styles/AdminDashboard.css';
import axios from 'axios';
import API_URL from '../../utils/api';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const Doctors = ({ searchQuery }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [filterSpec, setFilterSpec] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialization: '',
    experience: '',
    education: '',
    address: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/admin/doctors`, { withCredentials: true });
      setDoctors(res.data.doctors || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = !searchQuery || 
      doctor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSpec = !filterSpec || doctor.specialization === filterSpec;
    const matchesStatus = !filterStatus || doctor.status === filterStatus;
    
    return matchesSearch && matchesSpec && matchesStatus;
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/admin/doctors`, formData, { withCredentials: true });
      setShowAddModal(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        specialization: '',
        experience: '',
        education: '',
        address: '',
        status: 'Active'
      });
      fetchDoctors();
    } catch (error) {
      console.error('Error adding doctor:', error);
    }
  };

  const handleUpdateStatus = async (doctorId, newStatus) => {
    try {
      await axios.put(`${API_URL}/api/admin/doctors/${doctorId}/status`, 
        { status: newStatus }, 
        { withCredentials: true }
      );
      fetchDoctors();
      setEditingDoctor(null);
    } catch (error) {
      console.error('Error updating doctor status:', error);
    }
  };

  const handleDeleteDoctor = async (doctorId) => {
    toast((t) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p style={{ margin: 0, fontWeight: '600' }}>Delete this doctor?</p>
        <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>This will permanently remove all doctor data.</p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => toast.dismiss(t.id)}
            style={{
              padding: '6px 16px',
              background: '#f0f0f0',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await axios.delete(`${API_URL}/api/admin/doctors/${doctorId}`, { withCredentials: true });
                toast.success('Doctor deleted successfully');
                fetchDoctors();
                setSelectedDoctor(null);
              } catch (error) {
                console.error('Error deleting doctor:', error);
                toast.error('Failed to delete doctor');
              }
            }}
            style={{
              padding: '6px 16px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Delete
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  if (loading) {
    return <div className="admin-content-wrapper"><p>Loading doctors...</p></div>;
  }

  return (
    <div className="admin-content-wrapper">
      <div className="admin-header-section">
        <h1>Doctors</h1>
        <button className="btn-add-primary" onClick={() => setShowAddModal(true)}>+ Add Doctor</button>
      </div>

      <div className="admin-filters">
        <select 
          value={filterSpec} 
          onChange={(e) => setFilterSpec(e.target.value)}
          className="filter-select"
        >
          <option value="">All Specializations</option>
          <option value="Cardiology">Cardiology</option>
          <option value="Orthopedics">Orthopedics</option>
          <option value="General Medicine">General Medicine</option>
          <option value="Pediatrics">Pediatrics</option>
        </select>

        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Specialization</th>
              <th>Experience</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDoctors.map((doctor) => (
              <tr key={doctor._id}>
                <td><strong>{doctor.name || 'sample'}</strong></td>
                <td>{doctor.email}</td>
                <td>{doctor.phone || 'N/A'}</td>
                <td>{doctor.specialization}</td>
                <td>{doctor.experience} years</td>
                <td>
                  <select
                    value={doctor.status}
                    onChange={(e) => handleUpdateStatus(doctor._id, e.target.value)}
                    className="status-select"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </td>
                <td className="action-buttons">
                  <button 
                    className="admin-btn-view"
                    onClick={() => setSelectedDoctor(doctor)}
                  >
                    View
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => handleDeleteDoctor(doctor._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Doctor Modal */}
      {showAddModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Add New Doctor</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>

            <form onSubmit={handleAddDoctor} className="admin-form">
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
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Experience (Years) *</label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Specialization *</label>
                  <select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Select Specialization</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="ENT">ENT</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-group full-width">
                <label>Education *</label>
                <input
                  type="text"
                  name="education"
                  placeholder="e.g., MBBS, MD (Cardiology)"
                  value={formData.education}
                  onChange={handleFormChange}
                  required
                />
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
                <button type="submit" className="btn-submit">Add Doctor</button>
                <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Doctor Details Modal */}
      {selectedDoctor && (
        <div className="admin-modal-overlay" onClick={() => setSelectedDoctor(null)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Doctor Details</h2>
              <button className="modal-close" onClick={() => setSelectedDoctor(null)}>×</button>
            </div>

            <div className="doctor-details-view">
              {selectedDoctor.image && (
                <div className="detail-row">
                  <img 
                    src={selectedDoctor.image} 
                    alt={selectedDoctor.name}
                    style={{ width: '150px', height: '150px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{selectedDoctor.name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{selectedDoctor.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">{selectedDoctor.phoneNumber}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Specialization:</span>
                <span className="detail-value">{selectedDoctor.specialization}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Experience:</span>
                <span className="detail-value">{selectedDoctor.experience} years</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Education:</span>
                <span className="detail-value">{selectedDoctor.education}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Address:</span>
                <span className="detail-value">{selectedDoctor.address}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className={`badge badge-${selectedDoctor.status?.toLowerCase()}`}>
                  {selectedDoctor.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctors;
