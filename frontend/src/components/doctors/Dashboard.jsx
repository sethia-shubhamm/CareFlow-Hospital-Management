import '../../styles/PatientDashboard.css';
import axios from 'axios';
import API_URL from '../../utils/api';
import { useState, useEffect } from 'react';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    doctorName: '',
    specialization: '',
    date: '',
    day: '',
    totalPatients: 0,
    upcomingAppointments: 0,
    todayAppointments: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/doctors/dashboard`, { withCredentials: true });
      
      // Get current date and day
      const today = new Date();
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const formattedDate = today.toLocaleDateString('en-US', options);
      const day = today.toLocaleDateString('en-US', { weekday: 'long' });

      setDashboardData({
        doctorName: response.data.doctor.name,
        specialization: response.data.doctor.specialization,
        date: formattedDate,
        day: day,
        totalPatients: response.data.totalPatients,
        upcomingAppointments: response.data.upcomingAppointments,
        todayAppointments: response.data.todayAppointments || []
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-content"><p>Loading dashboard...</p></div>;
  }

  return (
    <div className="dashboard-content">
      <div className="welcome-section">
        <h1>Welcome, Dr. {dashboardData.doctorName}! 👨‍⚕️</h1>
        <p className="welcome-subtitle">{dashboardData.specialization}</p>
        <p className="date-info">{dashboardData.date}</p>
      </div>

      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{dashboardData.totalPatients}</h3>
            <p>Total Patients</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <h3>{dashboardData.upcomingAppointments}</h3>
            <p>Upcoming Appointments</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏥</div>
          <div className="stat-info">
            <h3>{dashboardData.specialization}</h3>
            <p>Specialization</p>
          </div>
        </div>
      </div>

      <div className="today-appointments-section">
        <h2>Today's Appointments</h2>
        {dashboardData.todayAppointments.length > 0 ? (
          <div className="appointments-list">
            {dashboardData.todayAppointments.map((appointment, index) => (
              <div key={index} className="appointment-card">
                <div className="appointment-time">
                  <span className="time-badge">{appointment.appointmentTime}</span>
                </div>
                <div className="appointment-details">
                  <h3>{appointment.patientName}</h3>
                  <p className="appointment-reason">{appointment.reason}</p>
                  <div className="appointment-meta">
                    <span className="meta-item">📞 {appointment.patientPhone}</span>
                    <span className={`status-badge status-${appointment.status.toLowerCase()}`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No appointments scheduled for today</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
