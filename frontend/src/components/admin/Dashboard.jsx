import '../../styles/AdminDashboard.css';
import axios from 'axios';
import { useState, useEffect } from 'react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
    todayAppointments: 0,
    totalRevenue: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [topDoctors, setTopDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, activitiesRes, appointmentsRes, topDoctorsRes] = await Promise.all([
        axios.get('http://localhost:3000/api/admin/stats', { withCredentials: true }),
        axios.get('http://localhost:3000/api/admin/recent-activities', { withCredentials: true }),
        axios.get('http://localhost:3000/api/admin/today-appointments', { withCredentials: true }),
        axios.get('http://localhost:3000/api/admin/top-doctors', { withCredentials: true })
      ]);

      setStats(statsRes.data.stats || {});
      setRecentActivities(activitiesRes.data.activities || []);
      setTodayAppointments(appointmentsRes.data.appointments || []);
      setTopDoctors(topDoctorsRes.data.doctors || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="admin-content-wrapper"><p>Loading dashboard...</p></div>;
  }

  return (
    <div className="admin-content-wrapper">
      <h1>Dashboard</h1>

      {/* Stats Grid */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#e8f4f8' }}>👨‍⚕️</div>
          <div className="stat-info">
            <p className="stat-label">Total Doctors</p>
            <h3 className="stat-value">{stats.totalDoctors}</h3>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#f0e8f8' }}>👥</div>
          <div className="stat-info">
            <p className="stat-label">Total Patients</p>
            <h3 className="stat-value">{stats.totalPatients}</h3>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#e8f8f0' }}>📅</div>
          <div className="stat-info">
            <p className="stat-label">Total Appointments</p>
            <h3 className="stat-value">{stats.totalAppointments}</h3>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#f8f0e8' }}>💰</div>
          <div className="stat-info">
            <p className="stat-label">Total Revenue</p>
            <h3 className="stat-value">₹{stats.totalRevenue?.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* Today's Appointments & Top Doctors */}
      <div className="admin-content-row">
        <div className="admin-section admin-section-left">
          <h2>Today's Appointments</h2>
          <div className="appointments-list-small">
            {todayAppointments.length > 0 ? (
              todayAppointments.slice(0, 5).map((appointment, index) => (
                <div key={index} className="appointment-item-small">
                  <div className="appointment-time">{appointment.appointmentTime}</div>
                  <div className="appointment-details-small">
                    <p className="appointment-patient"><strong>{appointment.patientName}</strong></p>
                    <p className="appointment-doctor">Dr. {appointment.doctorName}</p>
                    <p className="appointment-reason">{appointment.reason}</p>
                  </div>
                  <span className={`status-badge status-${appointment.status?.toLowerCase()}`}>
                    {appointment.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="no-data">No appointments today</p>
            )}
          </div>
        </div>

        <div className="admin-section admin-section-right">
          <h2>Top Doctors (By Patients)</h2>
          <div className="top-doctors-list">
            {topDoctors.length > 0 ? (
              topDoctors.slice(0, 5).map((doctor, index) => (
                <div key={index} className="top-doctor-item">
                  <div className="doctor-rank">{index + 1}</div>
                  <div className="doctor-details-small">
                    <p className="doctor-name"><strong>Dr. {doctor.name}</strong></p>
                    <p className="doctor-spec">{doctor.specialization}</p>
                  </div>
                  <div className="doctor-stats">
                    <p className="patient-count">{doctor.patientCount} Patients</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">No doctor data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="admin-section admin-section-full">
        <h2>Recent Activities</h2>
        <div className="activities-timeline">
          {recentActivities.length > 0 ? (
            recentActivities.slice(0, 8).map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-time">
                  {new Date(activity.time).toLocaleTimeString()}
                </div>
                <div className="activity-icon">{activity.icon || '•'}</div>
                <div className="activity-description">
                  <p>{activity.description}</p>
                  <small>{new Date(activity.time).toLocaleDateString()}</small>
                </div>
              </div>
            ))
          ) : (
            <p className="no-data">No recent activities</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
