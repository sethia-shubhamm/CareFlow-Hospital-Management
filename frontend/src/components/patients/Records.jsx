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
                <img src="/images/document-icon.png" alt="Record" />
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

              {selectedRecord.attachments && selectedRecord.attachments.length > 0 && (
                <div className="record-detail-section">
                  <h3>Attachments</h3>
                  <div className="attachments-list">
                    {selectedRecord.attachments.map((attachment, index) => (
                      <div key={index} className="attachment-item">
                        <div className="attachment-icon">
                          📎
                        </div>
                        <div className="attachment-info">
                          <p className="attachment-name">{attachment.fileName}</p>
                          <a href={attachment.fileUrl} target="_blank" rel="noopener noreferrer" className="attachment-link">
                            Download File
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
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
