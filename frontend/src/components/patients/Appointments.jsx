import '../../styles/PatientDashboard.css';
import axios from 'axios';
import { useState, useEffect } from 'react';

const Appointments = ({ onBookAppointment }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/patients/appointments', { withCredentials: true });
      setAppointments(response.data.appointments || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    return `status-badge ${status?.toLowerCase() || 'scheduled'}`;
  };

  return (
    <div className="appointments-content">
      <div className="section-header">
        <h2>My Appointments</h2>
        <button className="btn-primary" onClick={onBookAppointment}>Book New Appointment</button>
      </div>
      <div className="appointments-list">
        {loading ? (
          <p>Loading appointments...</p>
        ) : appointments.length > 0 ? (
          appointments.map((appointment, index) => (
            <div key={index} className="appointment-card">
              <div className="appointment-header">
                <div className="doctor-info">
                  <img src={appointment.doctorImage || "/images/patientPage/doctor.png"} alt="Doctor" />
                  <div>
                    <h3>{appointment.doctorName}</h3>
                    <p>{appointment.specialization}</p>
                  </div>
                </div>
                <span className={getStatusBadgeClass(appointment.status)}>{appointment.status}</span>
              </div>
              <div className="appointment-details">
                <div className="detail-item">
                  <strong>Date:</strong> {new Date(appointment.appointmentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div className="detail-item">
                  <strong>Time:</strong> {appointment.appointmentTime}
                </div>
                <div className="detail-item">
                  <strong>Reason:</strong> {appointment.reason || 'N/A'}
                </div>
              </div>
              <div className="appointment-actions">
                <button className="btn-secondary">Cancel</button>
                <button className="btn-primary">Reschedule</button>
              </div>
            </div>
          ))
        ) : (
          <p>No appointments available</p>
        )}
      </div>
    </div>
  );
};

export default Appointments;
