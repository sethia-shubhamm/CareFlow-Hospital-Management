import '../styles/Home.css';
import axios from 'axios';
import API_URL from '../utils/api';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AllDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [specializations, setSpecializations] = useState([]);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/patients/doctors`, { withCredentials: true });
      const doctorsList = response.data.doctors || [];
      setDoctors(doctorsList);
      setFilteredDoctors(doctorsList);

      // Extract unique specializations
      const specs = [...new Set(doctorsList.map(doc => doc.specialization))];
      setSpecializations(specs.sort());
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    filterDoctors(value, selectedSpecialization);
  };

  const handleSpecializationFilter = (e) => {
    const value = e.target.value;
    setSelectedSpecialization(value);
    filterDoctors(searchTerm, value);
  };

  const filterDoctors = (search, specialization) => {
    let filtered = doctors;

    if (search) {
      filtered = filtered.filter(doctor =>
        doctor.name.toLowerCase().includes(search) ||
        doctor.email.toLowerCase().includes(search)
      );
    }

    if (specialization) {
      filtered = filtered.filter(doctor => doctor.specialization === specialization);
    }

    setFilteredDoctors(filtered);
  };

  return (
    <div className="container">
      <nav className="navbar">
        <div className="logo">
          <img src="/images/logo.png" alt="CareFlow Logo" />
          <h1>CareFlow</h1>
        </div>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/doctors">All Doctors</Link>
          <a href="#services">Services</a>
          <Link to="/login">Login</Link>
        </div>
      </nav>

      <div className="all-doctors-page">
        <div className="doctors-page-header">
          <h1>Our Specialist Doctors</h1>
          <p>Browse our team of experienced medical professionals</p>
        </div>

        <div className="doctors-page-filters">
          <input
            type="text"
            placeholder="Search doctors by name or email..."
            value={searchTerm}
            onChange={handleSearch}
            className="filter-input"
          />

          <select
            value={selectedSpecialization}
            onChange={handleSpecializationFilter}
            className="filter-input"
          >
            <option value="">All Specializations</option>
            {specializations.map((spec, index) => (
              <option key={index} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>

        <div className="all-doctors-cards-grid">
          {loading ? (
            <p className="loading-message">Loading doctors...</p>
          ) : filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor) => (
              <div key={doctor.id} className="all-doctors-card">
                <div className="all-doctors-card-image">
                  <img
                    src={doctor.image || "/images/patientPage/doctor.png"}
                    alt={doctor.name}
                  />
                </div>
                
                <div className="all-doctors-card-content">
                  <h3>{doctor.name}</h3>
                  <p className="all-doctors-card-specialty">{doctor.specialization}</p>
                  
                  <div className="all-doctors-card-details">
                    <p><strong>Experience:</strong> {doctor.experience} yrs</p>
                    <p><strong>Location:</strong> {doctor.address}</p>
                  </div>

                  <div className="all-doctors-card-footer">
                    <span className="all-doctors-available">Available</span>
                    <Link to="/login" className="all-doctors-btn">Book</Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="no-doctors-found">No doctors found matching your criteria</p>
          )}
        </div>
      </div>

      <footer>
        <div className="footer-content">
          <div className="footer-section">
            <h3>About CareFlow</h3>
            <p>Your trusted healthcare companion</p>
            <p>Connecting patients with the best medical professionals</p>
          </div>
          <div className="footer-section">
            <h3>Contact</h3>
            <p>📧 Email: info@careflow.com</p>
            <p>📞 Phone: +91 1234567890</p>
          </div>
          <div className="footer-section">
            <h3>Quick Links</h3>
            <Link to="/">Home</Link>
            <Link to="/doctors">All Doctors</Link>
            <Link to="/login">Login</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 CareFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default AllDoctors;
