import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/AdminDashboard.css';
import AdminSidebar from '../components/admin/AdminSidebar';
import Dashboard from '../components/admin/Dashboard';
import Doctors from '../components/admin/Doctors';
import Patients from '../components/admin/Patients';
import Appointments from '../components/admin/Appointments';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [adminName] = useState('Admin');

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3000/api/auth/logout', {}, { withCredentials: true });
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      navigate('/login');
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="admin-branding">
          <img src="/images/logo.png" alt="Logo" className="admin-logo" />
          <h2>CareFlow - Admin Panel</h2>
        </div>
        
        <div className="admin-search-section">
          <input
            type="text"
            className="admin-search"
            placeholder="Search anything..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="admin-user-info">
          <div className="user-details">
            <p className="user-name">{adminName}</p>
            <p className="user-role">Administrator</p>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="admin-container">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="admin-content">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'doctors' && <Doctors searchQuery={searchQuery} />}
          {activeTab === 'patients' && <Patients searchQuery={searchQuery} />}
          {activeTab === 'appointments' && <Appointments searchQuery={searchQuery} />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
