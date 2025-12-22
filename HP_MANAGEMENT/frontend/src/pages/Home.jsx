import '../styles/Home.css';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container">
      <nav className="navbar">
        <div className="logo">
          <img src="/images/logo.png" alt="Hospital Logo" />
          <h1>CareFlow</h1>
        </div>
        <div className="nav-links">
          <Link to="/doctors">All Doctors</Link>
          <Link to="/blood-bank">Blood Bank</Link>
          <a href="#services">Services</a>
          <a href="#contact">Contact</a>
        </div>
      </nav>

      <div className="hero-section">
        <h1>Welcome to Our Healthcare Platform</h1>
        <p>Providing quality healthcare services</p>
      </div>

      <div className="stats-section">
        <div className="hstat-card">
          <h3>700+</h3>
          <p>Specialist Doctors</p>
        </div>
        <div className="hstat-card">
          <h3>10000+</h3>
          <p>Happy Patients</p>
        </div>
        <div className="hstat-card">
          <h3>24/7</h3>
          <p>Emergency Service</p>
        </div>
        <div className="hstat-card">
          <h3>15+</h3>
          <p>Years Experience</p>
        </div>
      </div>

      <div className="login-options">
        <div className="card patient">
          <img src="/images/patient.png" alt="Patient" />
          <h2>Patient Portal</h2>
          <p>Access your medical records, appointments, and more</p>
          <div className="buttons">
            <Link to="/login" state={{ activeTab: 'patient' }} className="btn login">Login</Link>
            <Link to="/signup" className="btn signup">Sign Up</Link>
          </div>
        </div>

        <div className="card doctor">
          <img src="/images/doctor.png" alt="Doctor" />
          <h2>Doctor Portal</h2>
          <p>Manage your patients view your appointments</p>
          <Link to="/login" state={{ activeTab: 'doctor' }} className="btn login">Doctor Login</Link>
        </div>

        <div className="card admin">
          <img src="/images/admin.png" alt="Admin" />
          <h2>Admin Portal</h2>
          <p>Hospital management and system administration</p>
          <Link to="/login" state={{ activeTab: 'admin' }} className="btn login">Admin Login</Link>
        </div>
      </div>

      <div className="services-section" id="services">
        <h2>Our Services</h2>
        <div className="services-grid">
          <div className="service-card">
            <img src="/images/ambulance.png" alt="Emergency" />
            <h3>24/7 Emergency</h3>
            <p>Round-the-clock emergency medical services</p>
          </div>
          <div className="service-card">
            <img src="/images/medical-appointment.png" alt="Appointment" />
            <h3>Appointments</h3>
            <p>Schedule appointments with your preferred doctors through our system.</p>
          </div>
          <div className="service-card">
            <img src="/images/vaccine-record.png" alt="Records" />
            <h3>Medical Records</h3>
            <p>Access your medical history and records securely from anywhere.</p>
          </div>
        </div>
      </div>

      <footer id="contact">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Contact Us</h3>
            <p>📞 Emergency: 911</p>
            <p>📱 Helpline: +1 234 567 890</p>
            <p>📧 Email: info@hospital.com</p>
          </div>
          <div className="footer-section">
            <h3>Location</h3>
            <p>123 Healthcare Street</p>
            <p>Medical City, MC 12345</p>
            <p>India</p>
          </div>
          <div className="footer-section">
            <h3>Quick Links</h3>
            <a href="/doctors">All Doctors</a>
            <a href="/blood-bank">Blood Bank</a>
            <a href="#services">Services</a>
            <a href="/login">Patient Login</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 CareFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
