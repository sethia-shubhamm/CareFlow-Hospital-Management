import '../../styles/PatientDashboard.css';
import axios from 'axios';
import API_URL from '../../utils/api';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const MedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
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

  const [selectedFiles, setSelectedFiles] = useState([]);
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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Create FormData to handle file uploads
      const submitData = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });
      
      // Append files
      selectedFiles.forEach(file => {
        submitData.append('attachments', file);
      });

      await axios.post(
        `${API_URL}/api/doctors/medical-records`,
        submitData,
        { 
          withCredentials: true
        }
      );

      toast.success('Medical record added successfully!');
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
      setSelectedFiles([]);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error adding medical record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (recordId) => {
    toast((t) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p style={{ margin: 0, fontWeight: '600' }}>Delete this medical record?</p>
        <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>This action cannot be undone.</p>
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
                await axios.delete(
                  `${API_URL}/api/doctors/medical-records/${recordId}`,
                  { withCredentials: true }
                );
                
                toast.success('Medical record deleted successfully!');
                fetchData();
              } catch (error) {
                toast.error(error.response?.data?.message || 'Error deleting medical record');
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

              {selectedRecord.attachments && selectedRecord.attachments.filter(att => att.fileUrl.includes('/image/upload/')).length > 0 && (
                <div className="detail-section">
                  <h3>Attachments</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                    {selectedRecord.attachments.filter(att => att.fileUrl.includes('/image/upload/')).map((attachment, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '10px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        border: '1px solid #e9ecef'
                      }}>
                        <div style={{ 
                          width: '100%',
                          height: '150px',
                          marginBottom: '10px',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          backgroundColor: '#e9ecef'
                        }}>
                          <img 
                            src={attachment.fileUrl} 
                            alt={attachment.fileName}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                          <p style={{ 
                            margin: '0 0 4px 0', 
                            fontWeight: '500', 
                            fontSize: '13px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>{attachment.fileName}</p>
                          <p style={{ margin: 0, fontSize: '11px', color: '#6c757d' }}>
                            {attachment.fileSize || 'Unknown size'}
                          </p>
                        </div>
                        <a 
                          href={attachment.fileUrl} 
                          download={attachment.fileName}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            borderRadius: '4px',
                            textDecoration: 'none',
                            fontSize: '13px',
                            textAlign: 'center',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
                        >
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
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
                <button 
                  className="btn-danger btn-sm"
                  onClick={() => handleDelete(record._id)}
                  style={{ marginLeft: '8px' }}
                >
                  Delete
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

              <div className="form-group">
                <label>Attachments</label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  style={{ display: 'block', marginBottom: '10px' }}
                />
                {selectedFiles.length > 0 && (
                  <div className="selected-files-list" style={{ marginTop: '10px' }}>
                    <p style={{ fontWeight: '600', marginBottom: '8px' }}>Selected Files:</p>
                    {selectedFiles.map((file, index) => (
                      <div key={index} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '4px',
                        marginBottom: '6px'
                      }}>
                        <span style={{ fontSize: '14px' }}>📎 {file.name}</span>
                        <button 
                          type="button" 
                          onClick={() => removeFile(index)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#dc3545',
                            cursor: 'pointer',
                            fontSize: '18px',
                            padding: '0 8px'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
