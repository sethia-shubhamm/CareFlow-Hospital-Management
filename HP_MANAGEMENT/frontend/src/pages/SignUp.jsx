import { useState } from 'react';
import '../styles/SignUp.css';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const navigator = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: '',
    phoneNumber: '',
    address: '',
    bloodType: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    axios.post('http://localhost:3000/api/auth/signup', formData, {withCredentials:true})
      .then(response => {
        console.log('Registration successful:', response.data);
        navigator('/login');
      })
      .catch(error => {
        console.error('Registration failed:', error);
        setError('Registration failed. Please try again.');
      });

  };

  return (
    <div className="signup-page">
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
            <Link className="nav-link" to="/">CONTACT</Link>
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
          <h1>Register as Patient</h1>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="inputFeilds">
            <div className="left">
              <input
                type="text"
                placeholder="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                placeholder="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input
                type="password"
                placeholder="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <input
                type="number"
                placeholder="Age"
                name="age"
                value={formData.age}
                onChange={handleChange}
              />
              <div className="gender">
                <input
                  type="radio"
                  name="gender"
                  id="male"
                  value="Male"
                  checked={formData.gender === 'Male'}
                  onChange={handleChange}
                />
                Male
                <input
                  type="radio"
                  name="gender"
                  id="female"
                  value="Female"
                  checked={formData.gender === 'Female'}
                  onChange={handleChange}
                />
                Female
              </div>
              <p>Already have an account? <a href="/login">Login</a></p>
            </div>
            <div className="right">
              <input
                type="text"
                placeholder="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
              <input
                type="text"
                placeholder="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
              <input
                type="password"
                placeholder="Confirm Password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <select
                name="bloodType"
                className="form-select"
                value={formData.bloodType}
                onChange={handleChange}
              >
                <option value="" disabled>Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
              <button type="submit" className="btn">
                Sign Up
              </button>
              <div id="signUpStatus" className="mt-2"></div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
