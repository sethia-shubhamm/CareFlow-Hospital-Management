import '../../styles/PatientDashboard.css';
import axios from 'axios';
import API_URL from '../../utils/api';
import { useState, useEffect } from 'react';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchTerm, patients]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/doctors/patients`, { withCredentials: true });
      setPatients(response.data.patients || []);
      setFilteredPatients(response.data.patients || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredPatients(patients);
      return;
    }

    const filtered = patients.filter(patient => 
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.toString().includes(searchTerm)
    );
    setFilteredPatients(filtered);
  };

  const getStatusBadgeClass = (status) => {
    if (!status) return 'status-badge status-none';
    return `status-badge status-${status.toLowerCase()}`;
  };

  if (loading) {
    return <div className="patients-content"><p>Loading patients...</p></div>;
  }

  return (
    <div className="patients-content">
      <div className="section-header">
        <h2>My Patients</h2>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by name, ID, or phone..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="patients-table-container">
        <table className="patients-table">
          <thead>
            <tr>
              <th>Patient ID</th>
              <th>Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Phone</th>
              <th>Last Appointment</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient, index) => (
                <tr key={index}>
                  <td>{patient.patientId}</td>
                  <td className="patient-name">{patient.name}</td>
                  <td>{patient.age || 'N/A'}</td>
                  <td>{patient.gender}</td>
                  <td>{patient.phone}</td>
                  <td>
                    {patient.lastAppointment 
                      ? new Date(patient.lastAppointment).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })
                      : 'No appointments'}
                  </td>
                  <td>
                    <span className={getStatusBadgeClass(patient.appointmentStatus)}>
                      {patient.appointmentStatus || 'None'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="empty-row">
                  {searchTerm ? 'No patients found matching your search' : 'No patients found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Patients;
