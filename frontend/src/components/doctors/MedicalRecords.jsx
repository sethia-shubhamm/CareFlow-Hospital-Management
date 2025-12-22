import '../../styles/PatientDashboard.css';
import axios from 'axios';
import API_URL from '../../utils/api';
import { useState, useEffect } from 'react';

const MedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [formData, setFormData] = useState({
    patientId: '',
    title: '',
    recordType: 'Consultation',
    diagnosis: '',
    treatment: '',
    prescription: '',
    notes: '',
    visitDate: new Date().toISOString().split('T')[0]
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recordsRes, patientsRes] = await Promise.all([
        axios.get(`${API_URL}/api/doctors/medical-records`, { withCredentials: true }),
        axios.get(`${API_URL}/api/doctors/patients`, { withCredentials: true })
      ]);
      
      setRecords(recordsRes.data.records || []);
      setPatients(patientsRes.data.patients || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await axios.post(
        `${API_URL}/api/doctors/medical-records`,
        formData,
        { withCredentials: true }
      );

      setSuccessMessage('Medical record added successfully!');
      setShowAddModal(false);
      setFormData({
        patientId: '',
        title: '',
        recordType: 'Consultation',
        diagnosis: '',
        treatment: '',
        prescription: '',
        notes: '',
        visitDate: new Date().toISOString().split('T')[0]
      });
      fetchData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Error adding medical record');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const getRecordTypeBadgeClass = (type) => {
    const typeMap = {
      'Consultation': 'badge-info',
      'Lab Report': 'badge-warning',
      'X-Ray': 'badge-secondary',
      'Prescription': 'badge-success',
      'Surgery': 'badge-danger',
      'Other': 'badge-light'
    };
    return typeMap[type] || 'badge-light';
  };

  if (loading) {
    return <div className="medical-records-content"><p>Loading medical records...</p></div>;
  }

  return (
    <div className="medical-records-content">
      <div className="section-header">
        <div>
          <h2>Medical Records</h2>
          <p className="section-subtitle">Manage and view patient medical records</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          + Add New Record
        </button>
      </div>

      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {errorMessage && <div className="alert alert-error">{errorMessage}</div>}

      {selectedRecord && (
        <div className="modal-overlay" onClick={() => setSelectedRecord(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedRecord.title}</h2>
              <button className="modal-close" onClick={() => setSelectedRecord(null)}>×</button>
            </div>

            <div className="modal-body record-detail-view">
              <div className="detail-section">
                <h3>Patient Information</h3>
                <div className="detail-row">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{selectedRecord.patientName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Patient ID:</span>
                  <span className="detail-value">{selectedRecord.patientId}</span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Record Information</h3>
                <div className="detail-row">
                  <span className="detail-label">Record Type:</span>
                  <span className={`badge ${getRecordTypeBadgeClass(selectedRecord.recordType)}`}>
                    {selectedRecord.recordType}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Visit Date:</span>
                  <span className="detail-value">
                    {new Date(selectedRecord.visitDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              </div>

              {selectedRecord.diagnosis && (
                <div className="detail-section">
                  <h3>Diagnosis</h3>
                  <p>{selectedRecord.diagnosis}</p>
                </div>
              )}

              {selectedRecord.treatment && (
                <div className="detail-section">
                  <h3>Treatment</h3>
                  <p>{selectedRecord.treatment}</p>
                </div>
              )}

              {selectedRecord.prescription && (
                <div className="detail-section">
                  <h3>Prescription</h3>
                  <p>{selectedRecord.prescription}</p>
                </div>
              )}

              {selectedRecord.notes && (
                <div className="detail-section">
                  <h3>Additional Notes</h3>
                  <p>{selectedRecord.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="records-list">
        {records.length > 0 ? (
          records.map((record, index) => (
            <div key={index} className="medical-record-card">
              <div className="record-header">
                <div className="record-title-section">
                  <h3>{record.title}</h3>
                  <p className="record-patient">
                    <strong>{record.patientName}</strong> • {record.patientId}
                  </p>
                </div>
                <span className={`badge ${getRecordTypeBadgeClass(record.recordType)}`}>
                  {record.recordType}
                </span>
              </div>

              <div className="record-body">
                <div className="record-meta">
                  <div className="meta-item">
                    <span className="meta-label">Visit Date</span>
                    <span className="meta-value">
                      {new Date(record.visitDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                {(record.diagnosis || record.treatment || record.prescription || record.notes) && (
                  <div className="record-preview">
                    {record.diagnosis && (
                      <div className="preview-item">
                        <strong>Diagnosis:</strong>
                        <p>{record.diagnosis.substring(0, 80)}...</p>
                      </div>
                    )}
                    {record.treatment && (
                      <div className="preview-item">
                        <strong>Treatment:</strong>
                        <p>{record.treatment.substring(0, 80)}...</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="record-actions">
                <button 
                  className="btn-secondary btn-sm"
                  onClick={() => setSelectedRecord(record)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No medical records found. Create your first record by clicking "Add New Record".</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Medical Record</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="profile-edit-form">
              <div className="form-group">
                <label>Select Patient *</label>
                <select
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">Choose a patient</option>
                  {patients.map((patient, index) => (
                    <option key={index} value={patient._id}>
                      {patient.name} ({patient.patientId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder="e.g., Annual Checkup, Follow-up Visit"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Record Type *</label>
                  <select
                    name="recordType"
                    value={formData.recordType}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="Consultation">Consultation</option>
                    <option value="Lab Report">Lab Report</option>
                    <option value="X-Ray">X-Ray</option>
                    <option value="Prescription">Prescription</option>
                    <option value="Surgery">Surgery</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Visit Date *</label>
                  <input
                    type="date"
                    name="visitDate"
                    value={formData.visitDate}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Diagnosis</label>
                <textarea
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleFormChange}
                  rows="3"
                  placeholder="Enter diagnosis details"
                />
              </div>

              <div className="form-group">
                <label>Treatment</label>
                <textarea
                  name="treatment"
                  value={formData.treatment}
                  onChange={handleFormChange}
                  rows="3"
                  placeholder="Enter treatment plan"
                />
              </div>

              <div className="form-group">
                <label>Prescription</label>
                <textarea
                  name="prescription"
                  value={formData.prescription}
                  onChange={handleFormChange}
                  rows="3"
                  placeholder="Enter prescribed medications"
                />
              </div>

              <div className="form-group">
                <label>Additional Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  rows="3"
                  placeholder="Any additional notes"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Adding...' : 'Add Record'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;
