import '../../styles/PatientDashboard.css';
import axios from 'axios';
import API_URL from '../../utils/api';
import { useState, useEffect } from 'react';

const Records = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  const fetchMedicalRecords = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/patients/medicalRecords`, { withCredentials: true });
      setRecords(response.data.records || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching medical records:', error);
      setLoading(false);
    }
  };

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
  };

  const closeModal = () => {
    setSelectedRecord(null);
  };

  return (
    <div className="records-content">
      <div className="section-header">
        <h2>Medical Records</h2>
      </div>
      <div className="records-list">
        {loading ? (
          <p>Loading medical records...</p>
        ) : records.length > 0 ? (
          records.map((record, index) => (
            <div key={index} className="record-card">
              <div className="record-icon">
                <img src={record.doctorImage || "/images/patientPage/doctor.png"} alt="Record" />
              </div>
              <div className="record-info">
                <h3>{record.title}</h3>
                <p>{record.doctorName}</p>
                <p className="record-date">{new Date(record.visitDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <button className="btn-view" onClick={() => handleViewRecord(record)}>View</button>
            </div>
          ))
        ) : (
          <p>No medical records available</p>
        )}
      </div>

      {selectedRecord && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Medical Record Details</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>

            <div className="modal-body">
              <div className="record-detail-section">
                <h3>Record Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Title</label>
                    <p>{selectedRecord.title}</p>
                  </div>
                  <div className="detail-item">
                    <label>Record Type</label>
                    <p>{selectedRecord.recordType}</p>
                  </div>
                  <div className="detail-item">
                    <label>Visit Date</label>
                    <p>{new Date(selectedRecord.visitDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div className="detail-item">
                    <label>Doctor</label>
                    <p>{selectedRecord.doctorName}</p>
                  </div>
                  <div className="detail-item">
                    <label>Specialization</label>
                    <p>{selectedRecord.specialization}</p>
                  </div>
                </div>
              </div>

              <div className="record-detail-section">
                <h3>Description</h3>
                <div className="description-box">
                  <p>{selectedRecord.description || 'No description provided'}</p>
                </div>
              </div>

              {selectedRecord.attachments && selectedRecord.attachments.filter(att => att.fileUrl.includes('/image/upload/')).length > 0 && (
                <div className="record-detail-section">
                  <h3>Attachments</h3>
                  <div className="attachments-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
                    {selectedRecord.attachments.filter(att => att.fileUrl.includes('/image/upload/')).map((attachment, index) => (
                      <div key={index} className="attachment-item" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '12px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        border: '1px solid #e9ecef'
                      }}>
                        <div style={{ 
                          width: '100%',
                          height: '200px',
                          marginBottom: '12px',
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
                        <div className="attachment-info" style={{ marginBottom: '12px' }}>
                          <p className="attachment-name" style={{ 
                            margin: '0 0 4px 0', 
                            fontWeight: '500',
                            fontSize: '14px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>{attachment.fileName}</p>
                          {attachment.fileSize && (
                            <p style={{ 
                              margin: 0, 
                              fontSize: '12px', 
                              color: '#6c757d' 
                            }}>{attachment.fileSize}</p>
                          )}
                        </div>
                        <a
                          href={attachment.fileUrl}
                          download={attachment.fileName}
                          className="attachment-link"
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            borderRadius: '6px',
                            border: 'none',
                            fontSize: '14px',
                            fontWeight: '500',
                            textAlign: 'center',
                            textDecoration: 'none',
                            cursor: 'pointer',
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

              {(!selectedRecord.attachments || selectedRecord.attachments.filter(att => att.fileUrl.includes('/image/upload/')).length === 0) && (
                <div className="record-detail-section">
                  <h3>Attachments</h3>
                  <p style={{ color: '#6c757d', fontStyle: 'italic' }}>No image attachments available for this record</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-primary" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Records;
