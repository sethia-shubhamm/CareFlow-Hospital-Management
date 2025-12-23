import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../utils/api';
import '../styles/PatientDashboard.css';
import PatientSidebar from '../components/patients/PatientSidebar';
import Dashboard from '../components/patients/Dashboard';
import Appointments from '../components/patients/Appointments';
import BookAppointment from '../components/patients/BookAppointment';
import Records from '../components/patients/Records';
import Profile from '../components/patients/Profile';
import Billing from '../components/patients/Billing';
import AIBuddy from '../components/patients/AIBuddy';

const PatientDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/api/auth/logout`, {}, { withCredentials: true });
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, redirect to login
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      navigate('/login');
    }
  };

  const handleBookAppointment = () => {
    setActiveTab('book-appointment');
  };

  return (
    <div className="patient-dashboard">
      <div className="navbar">
        <div className="logo">
          <img src="/images/logo.png" alt="Logo" />
          <h6>CareFlow Hospital</h6>
        </div>
        <ul className="nav">
          <li className="nav-item">
            <a className="nav-link active" href="/">HOME</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="/doctors">ALL DOCTORS</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="/blood-bank">BLOOD BANK</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="#contact">CONTACT</a>
          </li>
        </ul>
      </div>

      <div className="mainContainer">
        <PatientSidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
        />

        <div className="content-area">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'appointments' && <Appointments onBookAppointment={handleBookAppointment} />}
          {activeTab === 'book-appointment' && <BookAppointment />}
          {activeTab === 'records' && <Records />}
          {activeTab === 'profile' && <Profile />}
          {activeTab === 'billing' && <Billing />}
          {activeTab === 'ai-buddy' && <AIBuddy />}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
