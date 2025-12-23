import '../../styles/PatientDashboard.css';
import axios from 'axios';
import API_URL from '../../utils/api';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
    date: '',
    time: ''
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/doctors/appointments`, { withCredentials: true });
      setAppointments(response.data.appointments || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    toast((t) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p style={{ margin: 0, fontWeight: '600' }}>Cancel this appointment?</p>
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
            No
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await axios.put(
                  `${API_URL}/api/doctors/appointments/${appointmentId}/cancel`,
                  {},
                  { withCredentials: true }
                );
                toast.success('Appointment cancelled successfully');
                fetchAppointments();
              } catch (error) {
                toast.error(error.response?.data?.message || 'Error cancelling appointment');
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
            Yes, Cancel
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const openRescheduleModal = (appointment) => {
    setSelectedAppointment(appointment);
    setRescheduleData({
      date: appointment.appointmentDate.split('T')[0],
      time: appointment.appointmentTime
    });
    setShowRescheduleModal(true);
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${API_URL}/api/doctors/appointments/${selectedAppointment._id}/reschedule`,
        rescheduleData,
        { withCredentials: true }
      );
      toast.success('Appointment rescheduled successfully');
      setShowRescheduleModal(false);
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error rescheduling appointment');
    }
  };

  const getStatusBadgeClass = (status) => {
    return `status-badge status-${status.toLowerCase()}`;
  };

  if (loading) {
    return <div className="appointments-content"><p>Loading appointments...</p></div>;
  }

  return (
    <div className="appointments-content">
      <div className="section-header">
        <h2>All Appointments</h2>
      </div>

      <div className="appointments-list">
        {appointments.length > 0 ? (
          appointments.map((appointment, index) => (
            <div key={index} className="appointment-card">
              <div className="appointment-header">
                <div>
                  <h3>{appointment.patientName}</h3>
                  <p className="appointment-date">
                    {new Date(appointment.appointmentDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })} at {appointment.appointmentTime}
                  </p>
                </div>
                <span className={getStatusBadgeClass(appointment.status)}>
                  {appointment.status}
                </span>
              </div>

              <div className="appointment-body">
                <div className="appointment-detail">
                  <label>Reason</label>
                  <p>{appointment.reason}</p>
                </div>
                <div className="appointment-detail">
                  <label>Patient Phone</label>
                  <p>{appointment.patientPhone}</p>
                </div>
                <div className="appointment-detail">
                  <label>Patient Email</label>
                  <p>{appointment.patientEmail}</p>
                </div>
              </div>

              {appointment.status === 'Scheduled' && (
                <div className="appointment-actions">
                  <button 
                    className="btn-secondary"
                    onClick={() => openRescheduleModal(appointment)}
                  >
                    Reschedule
                  </button>
                  <button 
                    className="btn-danger"
                    onClick={() => handleCancelAppointment(appointment._id)}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No appointments found</p>
          </div>
        )}
      </div>

      {showRescheduleModal && (
        <div className="modal-overlay" onClick={() => setShowRescheduleModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Reschedule Appointment</h2>
              <button className="modal-close" onClick={() => setShowRescheduleModal(false)}>×</button>
            </div>

            <form onSubmit={handleReschedule} className="profile-edit-form">
              <div className="form-group">
                <label>New Date</label>
                <input
                  type="date"
                  value={rescheduleData.date}
                  onChange={(e) => setRescheduleData({...rescheduleData, date: e.target.value})}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="form-group">
                <label>New Time</label>
                <select
                  value={rescheduleData.time}
                  onChange={(e) => setRescheduleData({...rescheduleData, time: e.target.value})}
                  required
                >
                  <option value="">Select Time</option>
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="09:30 AM">09:30 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="10:30 AM">10:30 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="11:30 AM">11:30 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="02:30 PM">02:30 PM</option>
                  <option value="03:00 PM">03:00 PM</option>
                  <option value="03:30 PM">03:30 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">Confirm Reschedule</button>
                <button type="button" className="btn-secondary" onClick={() => setShowRescheduleModal(false)}>
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

export default Appointments;
