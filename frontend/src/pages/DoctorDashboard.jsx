import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/PatientDashboard.css';
import DoctorSidebar from '../components/doctors/DoctorSidebar';
import Dashboard from '../components/doctors/Dashboard';
import Appointments from '../components/doctors/Appointments';
import Patients from '../components/doctors/Patients';
import Profile from '../components/doctors/Profile';
import MedicalRecords from '../components/doctors/MedicalRecords';

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3000/api/auth/logout', {}, { withCredentials: true });
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
        <DoctorSidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
        />

        <div className="content-area">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'appointments' && <Appointments />}
          {activeTab === 'patients' && <Patients />}
          {activeTab === 'profile' && <Profile />}
          {activeTab === 'medical-records' && <MedicalRecords />}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
