import '../../styles/AdminDashboard.css';
import axios from 'axios';
import API_URL from '../../utils/api';
import { useState, useEffect } from 'react';

const Appointments = ({ searchQuery }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showBillModal, setShowBillModal] = useState(false);
  const [billData, setBillData] = useState({
    amount: '',
    billType: 'Consultation',
    paymentStatus: 'Unpaid',
    paymentMethod: '',
    description: ''
  });
  const [billAppointmentId, setBillAppointmentId] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/admin/appointments`, { withCredentials: true });
      setAppointments(res.data.appointments || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setLoading(false);
    }
  };

  const getFilteredAppointments = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filtered = appointments.filter(apt => {
      const matchesSearch = !searchQuery || 
        apt.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.doctorName?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });

    if (activeFilter === 'today') {
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        aptDate.setHours(0, 0, 0, 0);
        return aptDate.getTime() === today.getTime();
      });
    } else if (activeFilter === 'upcoming') {
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        aptDate.setHours(0, 0, 0, 0);
        return aptDate.getTime() > today.getTime() && apt.status === 'Scheduled';
      });
    } else if (activeFilter === 'past') {
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        aptDate.setHours(0, 0, 0, 0);
        return aptDate.getTime() < today.getTime();
      });
    }

    return filtered;
  };

  const handleGenerateBill = async (appointmentId) => {
    try {
      await axios.post(`${API_URL}/api/admin/bills/generate/${appointmentId}`, 
        billData, 
        { withCredentials: true }
      );
      alert('Bill generated successfully');
      setShowBillModal(false);
      setBillData({
        amount: '',
        billType: 'Consultation',
        paymentStatus: 'Unpaid',
        paymentMethod: '',
        description: ''
      });
      fetchAppointments();
    } catch (error) {
      console.error('Error generating bill:', error);
      alert('Error generating bill: ' + error.response?.data?.message || error.message);
    }
  };

  const openBillModal = (appointmentId, appointmentDetails) => {
    setBillAppointmentId(appointmentId);
    setBillData({
      amount: '500',
      billType: 'Consultation',
      paymentStatus: 'Unpaid',
      paymentMethod: 'Cash',
      description: `Consultation for ${appointmentDetails.reason}`
    });
    setShowBillModal(true);
  };

  const handleBillFormChange = (e) => {
    const { name, value } = e.target;
    setBillData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await axios.put(`${API_URL}/api/admin/appointments/${appointmentId}/cancel`, 
          {}, 
          { withCredentials: true }
        );
        fetchAppointments();
        setSelectedAppointment(null);
      } catch (error) {
        console.error('Error cancelling appointment:', error);
      }
    }
  };

  if (loading) {
    return <div className="admin-content-wrapper"><p>Loading appointments...</p></div>;
  }

  const filteredAppointments = getFilteredAppointments();

  return (
    <div className="admin-content-wrapper">
      <div className="admin-header-section">
        <h1>Appointments</h1>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All Appointments ({appointments.length})
        </button>
        <button
          className={`admin-tab ${activeFilter === 'today' ? 'active' : ''}`}
          onClick={() => setActiveFilter('today')}
        >
          Today
        </button>
        <button
          className={`admin-tab ${activeFilter === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveFilter('upcoming')}
        >
          Upcoming
        </button>
        <button
          className={`admin-tab ${activeFilter === 'past' ? 'active' : ''}`}
          onClick={() => setActiveFilter('past')}
        >
          Past
        </button>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((apt) => (
                <tr key={apt._id}>
                  <td>
                    <strong>
                      {new Date(apt.appointmentDate).toLocaleDateString()} {apt.appointmentTime}
                    </strong>
                  </td>
                  <td>{apt.patientName}</td>
                  <td>Dr. {apt.doctorName}</td>
                  <td>{apt.reason}</td>
                  <td>
                    <span className={`badge badge-${apt.status?.toLowerCase()}`}>
                      {apt.status}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button 
                      className="admin-btn-view"
                      onClick={() => setSelectedAppointment(apt)}
                    >
                      View
                    </button>
                    {apt.status === 'Completed' && (
                      <button 
                        className="btn-bill"
                        onClick={() => openBillModal(apt._id, apt)}
                      >
                        Bill
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                  No appointments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View Appointment Details Modal */}
      {selectedAppointment && (
        <div className="admin-modal-overlay" onClick={() => setSelectedAppointment(null)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Appointment Details</h2>
              <button className="modal-close" onClick={() => setSelectedAppointment(null)}>×</button>
            </div>

            <div className="appointment-details-view">
              <div className="detail-row">
                <span className="detail-label">Date:</span>
                <span className="detail-value">
                  {new Date(selectedAppointment.appointmentDate).toLocaleDateString()}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Time:</span>
                <span className="detail-value">{selectedAppointment.appointmentTime}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Patient:</span>
                <span className="detail-value">{selectedAppointment.patientName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Doctor:</span>
                <span className="detail-value">Dr. {selectedAppointment.doctorName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Reason:</span>
                <span className="detail-value">{selectedAppointment.reason}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className={`badge badge-${selectedAppointment.status?.toLowerCase()}`}>
                  {selectedAppointment.status}
                </span>
              </div>

              {selectedAppointment.status === 'Scheduled' && (
                <div className="modal-actions">
                  <button 
                    className="btn-cancel"
                    onClick={() => handleCancelAppointment(selectedAppointment._id)}
                  >
                    Cancel Appointment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Generate Bill Modal */}
      {showBillModal && billAppointmentId && (
        <div className="admin-modal-overlay" onClick={() => setShowBillModal(false)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Generate Bill</h2>
              <button className="modal-close" onClick={() => setShowBillModal(false)}>×</button>
            </div>

            <form className="admin-form" onSubmit={(e) => {
              e.preventDefault();
              handleGenerateBill(billAppointmentId);
            }}>
              <div className="form-row">
                <div className="form-group">
                  <label>Amount (₹) *</label>
                  <input
                    type="number"
                    name="amount"
                    value={billData.amount}
                    onChange={handleBillFormChange}
                    placeholder="Enter bill amount"
                    step="0.01"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Bill Type *</label>
                  <select
                    name="billType"
                    value={billData.billType}
                    onChange={handleBillFormChange}
                  >
                    <option value="Consultation">Consultation</option>
                    <option value="Lab">Lab</option>
                    <option value="Procedure">Procedure</option>
                    <option value="Medicine">Medicine</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Payment Status *</label>
                  <select
                    name="paymentStatus"
                    value={billData.paymentStatus}
                    onChange={handleBillFormChange}
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Paid">Paid</option>
                    <option value="Partially Paid">Partially Paid</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Payment Method</label>
                  <select
                    name="paymentMethod"
                    value={billData.paymentMethod}
                    onChange={handleBillFormChange}
                  >
                    <option value="">Select Method</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Net Banking">Net Banking</option>
                  </select>
                </div>
              </div>

              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  name="description"
                  value={billData.description}
                  onChange={handleBillFormChange}
                  rows="3"
                  placeholder="Bill description (optional)"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-submit">Generate Bill</button>
                <button type="button" className="btn-cancel" onClick={() => setShowBillModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
