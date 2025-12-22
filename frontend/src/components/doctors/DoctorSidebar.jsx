import '../../styles/PatientDashboard.css';

const DoctorSidebar = ({ activeTab, setActiveTab, onLogout }) => {
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
          className={activeTab === 'patients' ? 'active' : ''}
          onClick={() => setActiveTab('patients')}
        >
          <img src="/images/patientPage/profile.png" alt="Patients" />
          <h6>My Patients</h6>
        </div>
        <div
          className={activeTab === 'medical-records' ? 'active' : ''}
          onClick={() => setActiveTab('medical-records')}
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
      </div>

      <button className="logout" onClick={onLogout}>
        <img src="/images/patientPage/Logout.png" alt="Logout" />
        <h6>Logout</h6>
      </button>
    </div>
  );
};

export default DoctorSidebar;
