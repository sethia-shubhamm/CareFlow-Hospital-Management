import '../../styles/PatientDashboard.css';
import axios from 'axios';
import API_URL from '../../utils/api';
import { useState, useEffect, use } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {

  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [nextAppointment, setNextAppointment] = useState('');
  const [totalMedicalRecords, setTotalMedicalRecords] = useState(0);
  const [billPending, setBillPending] = useState('$0');
  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard data
      const dashboardResponse = await axios.get(`${API_URL}/api/patients/`, { withCredentials: true });
      const dashboardData = dashboardResponse.data;
      
      setName(dashboardData.patient.name);
      
      // Set next appointment
      if (dashboardData.latestAppointment) {
        const appointmentDate = new Date(dashboardData.latestAppointment.date);
        const appointmentTime = dashboardData.latestAppointment.time;
        const formattedDate = appointmentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        setNextAppointment(`${formattedDate} - ${appointmentTime}`);
      } else {
        setNextAppointment('No upcoming appointments');
      }
      
      // Set bill pending
      if (dashboardData.latestBill) {
        setBillPending(`$${dashboardData.latestBill.amount}`);
      } else {
        setBillPending('$0');
      }
      
      // Fetch all appointments
      const appointmentsResponse = await axios.get(`${API_URL}/api/patients/appointments`, { withCredentials: true });
      setAppointments(appointmentsResponse.data.appointments || []);
      
      // Fetch medical records
      const recordsResponse = await axios.get(`${API_URL}/api/patients/medicalRecords`, { withCredentials: true });
      setMedicalRecords(recordsResponse.data.records || []);
      setTotalMedicalRecords(recordsResponse.data.count || 0);
      
      // Fetch bills
      const billsResponse = await axios.get(`${API_URL}/api/patients/bills`, { withCredentials: true });
      setBills(billsResponse.data.bills || []);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 401) {
        navigate('/login', { state: { activeTab: 'patient' } });
      }
      setLoading(false);
    }
  };



  return (
    <div className="dashboard-content">
      <div className="welcome-section">
        <h1>Welcome back, <span>{name}</span></h1>
        <p>Here's what's happening with your health today</p>
      </div>

      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon">
            <img src="/images/patientPage/appointment.png" alt="Appointments" />
          </div>
          <div className="stat-info">
            <h3>Next Appointment</h3>
            <p>{nextAppointment}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <img src="/images/patientPage/records.png" alt="Records" />
          </div>
          <div className="stat-info">
            <h3>Medical Records</h3>
            <p>{totalMedicalRecords} records available</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <img src="/images/patientPage/invoice.png" alt="Bills" />
          </div>
          <div className="stat-info">
            <h3>Pending Bills</h3>
            <p>{billPending} due</p>
          </div>
        </div>
      </div>

      <div className="info-grid">
        <div className="info-card">
          <h3>Upcoming Appointments</h3>
          {appointments.length > 0 ? (
            appointments.slice(0, 2).map((appointment, index) => (
              <div key={index} className="appointment-item">
                <img src="/images/patientPage/doctor.png" alt="Doctor" />
                <div>
                  <h4>{appointment.doctorName}</h4>
                  <p>{appointment.specialization}</p>
                  <p>{new Date(appointment.appointmentDate).toLocaleDateString()} - {appointment.appointmentTime}</p>
                  <span>{appointment.status}</span>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: '#666', padding: '15px 0' }}>No upcoming appointments</p>
          )}
        </div>

        <div className="info-card">
          <h3>Recent Medical Records</h3>
          {medicalRecords.length > 0 ? (
            medicalRecords.slice(0, 2).map((record, index) => (
              <div key={index} className="record-item">
                <div>
                  <h4>{record.title}</h4>
                  <p>{record.doctorName} - {new Date(record.visitDate).toLocaleDateString()}</p>
                  <span style={{ cursor: 'pointer' }}>View Details</span>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: '#666', padding: '15px 0' }}>No medical records available</p>
          )}
        </div>

        <div className="info-card">
          <h3>Billing Summary</h3>
          {bills.length > 0 ? (
            bills.slice(0, 1).map((bill, index) => (
              <div key={index} className="bill-item">
                <div>
                  <h4>{bill.description || 'Consultation Fee'}</h4>
                  <p>Amount: ${bill.amount}</p>
                  <p>Status: <span className={bill.paymentStatus === 'paid' ? 'paid' : 'unpaid'}>{bill.paymentStatus}</span></p>
                  {bill.paymentStatus !== 'paid' && <button className="pay-bill-btn">Pay Now</button>}
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: '#666', padding: '15px 0' }}>No bills available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
