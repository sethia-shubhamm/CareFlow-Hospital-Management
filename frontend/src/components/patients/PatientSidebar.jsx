import '../../styles/PatientDashboard.css';

const PatientSidebar = ({ activeTab, setActiveTab, onLogout }) => {
  return (
    <div className="choiceSection">
      <div className="menu-items">
        <div
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          <img src="/images/patientPage/dashboard.png" alt="Dashboard" />
          <h6>Dashboard</h6>
        </div>
        <div
          className={activeTab === 'appointments' ? 'active' : ''}
          onClick={() => setActiveTab('appointments')}
        >
          <img src="/images/patientPage/appointment.png" alt="Appointments" />
          <h6>Appointments</h6>
        </div>
        <div
          className={activeTab === 'records' ? 'active' : ''}
          onClick={() => setActiveTab('records')}
        >
          <img src="/images/patientPage/records.png" alt="Records" />
          <h6>Medical Records</h6>
        </div>
        <div
          className={activeTab === 'profile' ? 'active' : ''}
          onClick={() => setActiveTab('profile')}
        >
          <img src="/images/patientPage/profile.png" alt="Profile" />
          <h6>Profile</h6>
        </div>
        <div
          className={activeTab === 'billing' ? 'active' : ''}
          onClick={() => setActiveTab('billing')}
        >
          <img src="/images/patientPage/invoice.png" alt="Billing" />
          <h6>Billing</h6>
        </div>
        <div
          className={activeTab === 'ai-buddy' ? 'active' : ''}
          onClick={() => setActiveTab('ai-buddy')}
        >
          <img src="/images/patientPage/profile.png" alt="AI Buddy" />
          <h6>AI Buddy</h6>
        </div>
      </div>

      <button className="logout" onClick={onLogout}>
        <img src="/images/patientPage/Logout.png" alt="Logout" />
        <h6>Logout</h6>
      </button>
    </div>
  );
};

export default PatientSidebar;
