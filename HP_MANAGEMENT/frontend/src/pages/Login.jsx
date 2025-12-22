import { useState } from 'react';
import '../styles/Login.css';
import {useLocation} from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {

  const location = useLocation();
  const navigator = useNavigate();

  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleDemo = (role = 'patient') => {
    let credentials = {};
    
    if (role === 'patient') {
      credentials = { email: 'patient@hospital.com', password: 'password123' };
    } else if (role === 'doctor') {
      credentials = { email: 'arjun.mehta@hospital.com', password: 'password123' };
    } else if (role === 'admin') {
      credentials = { email: 'admin@hospital.com', password: 'password123' };
    }

    setActiveTab(role);
    setEmail(credentials.email);
    setPassword(credentials.password);

    // Auto-submit after setting state
    setTimeout(() => {
      submitLogin(role, credentials.email, credentials.password);
    }, 100);
  };

  const submitLogin = (role, email, password) => {
    setError('');
    const loginData = {
      role,
      email,
      password
    };
    axios.post('http://localhost:3000/api/auth/login', loginData, { withCredentials: true })
      .then(response => {
        if (role === 'patient') {
          navigator('/patient');
        } else if (role === 'doctor') {
          navigator('/doctor');
        } else if (role === 'admin') {
          navigator('/admin');
        }
      })
      .catch(error => {
        const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
        setError(errorMessage);
        console.error('Login failed:', errorMessage);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitLogin(activeTab, email, password);
  };

  return (
    <div className="desktop">
      <div className="navbar">
        <div className="logo">
          <img src="/images/logo.png" alt="Logo" />
          <h6>CareFlow Hospital</h6>
        </div>
        <ul className="nav">
          <li className="nav-item">
            <Link className="nav-link active" to="/">HOME</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/doctors">ALL DOCTORS</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/blood-bank">BLOOD BANK</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/#contact">CONTACT</Link>
          </li>
        </ul>
        <div className="login">
          <Link to="/login"><button type="button" className="btn">Login</button></Link>
          <Link to="/signup"><button type="button" className="btn">Sign Up</button></Link>
        </div>
      </div>

      <div className="mainContainer">
        <img src="/images/doctorimg.png" alt="Doctor" />
        <div className="loginForm">
          <div className="slider">
            <button 
              className={activeTab === 'patient' ? 'active' : ''} 
              onClick={() => setActiveTab('patient')}
            >
              Patient
            </button>
            <button 
              className={activeTab === 'doctor' ? 'active' : ''} 
              onClick={() => setActiveTab('doctor')}
            >
              Doctor
            </button>
            <button 
              className={activeTab === 'admin' ? 'active' : ''} 
              onClick={() => setActiveTab('admin')}
            >
              Admin
            </button>
          </div>
          <img src="/images/Company.png" alt="Company" />
          <h1>
            {activeTab === 'patient' && 'Patient Login'}
            {activeTab === 'doctor' && 'Doctor Login'}
            {activeTab === 'admin' && 'Admin Login'}
          </h1>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <form id="loginForm" className="inputFeilds" onSubmit={handleSubmit}>
            <div className="right">
              <label htmlFor="email">Enter Email :</label>
              <input
                type="email"
                placeholder="xyz@gmail.com"
                name="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label htmlFor="password">Enter Password :</label>
              <input
                type="password"
                placeholder="Enter Password"
                name="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit" className="btn">
                Login
              </button>
              <div id="loginStatus" className="mt-2"></div>
            </div>
          </form>
        </div>
      </div>

      {/* Floating Demo Login Button */}
      <div className="demo-buttons-container">
        <button type="button" className="demo-btn patient" onClick={() => handleDemo('patient')}>
          <div className="demo-icon">👤 Demo Patient</div>
        </button>
        <button type="button" className="demo-btn doctor" onClick={() => handleDemo('doctor')}>
          <div className="demo-icon">👨‍⚕️ Demo Doctor</div>
        </button>
        <button type="button" className="demo-btn admin" onClick={() => handleDemo('admin')}>
          <div className="demo-icon">👨‍💼 Demo Admin</div>
        </button>
      </div>
    </div>
  );
};

export default Login;
