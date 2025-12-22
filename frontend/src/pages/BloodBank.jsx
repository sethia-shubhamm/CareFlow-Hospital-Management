import '../styles/Home.css';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const BloodBank = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('inventory');

  // Dummy blood inventory data
  const bloodInventory = [
    { type: 'O+', units: 45, lastUpdated: 'Today' },
    { type: 'O-', units: 28, lastUpdated: '2 days ago' },
    { type: 'A+', units: 52, lastUpdated: 'Today' },
    { type: 'A-', units: 18, lastUpdated: '3 days ago' },
    { type: 'B+', units: 35, lastUpdated: 'Today' },
    { type: 'B-', units: 12, lastUpdated: '5 days ago' },
    { type: 'AB+', units: 22, lastUpdated: 'Yesterday' },
    { type: 'AB-', units: 8, lastUpdated: '4 days ago' },
  ];

  // Dummy donation requests
  const donationRequests = [
    {
      id: 1,
      name: 'John Doe',
      bloodType: 'A+',
      date: '2025-12-24',
      time: '10:00 AM',
      status: 'Pending',
      location: 'Main Blood Bank'
    },
    {
      id: 2,
      name: 'Jane Smith',
      bloodType: 'O+',
      date: '2025-12-25',
      time: '2:00 PM',
      status: 'Approved',
      location: 'City Medical Center'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      bloodType: 'B+',
      date: '2025-12-26',
      time: '11:30 AM',
      status: 'Pending',
      location: 'Main Blood Bank'
    },
  ];

  // Dummy blood requests (patients needing blood)
  const bloodRequests = [
    {
      id: 1,
      patientName: 'Sarah Williams',
      bloodType: 'O+',
      unitsNeeded: 3,
      reason: 'Post-surgery recovery',
      urgency: 'High',
      hospital: 'Apollo Hospital'
    },
    {
      id: 2,
      patientName: 'David Brown',
      bloodType: 'B-',
      unitsNeeded: 2,
      reason: 'Accident trauma care',
      urgency: 'Critical',
      hospital: 'Max Healthcare'
    },
    {
      id: 3,
      patientName: 'Emma Davis',
      bloodType: 'AB+',
      unitsNeeded: 1,
      reason: 'Scheduled surgery',
      urgency: 'Medium',
      hospital: 'Apollo Hospital'
    },
  ];

  const handleDonate = () => {
    navigate('/login', { state: { activeTab: 'patient' } });
  };

  const handleRequest = () => {
    navigate('/login', { state: { activeTab: 'patient' } });
  };

  return (
    <div className="container">
      <nav className="navbar">
        <div className="logo">
          <img src="/images/logo.png" alt="Hospital Logo" />
          <h1>CareFlow</h1>
        </div>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/doctors">All Doctors</Link>
          <a href="#services">Services</a>
          <a href="#contact">Contact</a>
        </div>
      </nav>

      <div className="blood-bank-container">
        <div className="blood-bank-header">
          <h1>🩸 Blood Bank Management System</h1>
          <p>Help save lives - Donate blood or request blood units</p>
        </div>

        <div className="blood-bank-tabs">
          <button 
            className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            📊 Blood Inventory
          </button>
          <button 
            className={`tab-btn ${activeTab === 'donate' ? 'active' : ''}`}
            onClick={() => setActiveTab('donate')}
          >
            💉 Donate Blood
          </button>
          <button 
            className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            🆘 Blood Requests
          </button>
        </div>

        {/* Blood Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="blood-bank-content">
            <div className="inventory-stats">
              <h2>Current Blood Inventory</h2>
              <div className="inventory-grid">
                {bloodInventory.map((item, idx) => (
                  <div key={idx} className="blood-type-card">
                    <div className="blood-type-icon">
                      <span className={`blood-badge ${item.type.replace('+', 'plus').replace('-', 'minus')}`}>
                        {item.type}
                      </span>
                    </div>
                    <div className="blood-type-info">
                      <p className="units">
                        <strong>{item.units}</strong> units
                      </p>
                      <p className="updated">Last updated: {item.lastUpdated}</p>
                    </div>
                    <div className={`inventory-status ${item.units > 40 ? 'high' : item.units > 20 ? 'medium' : 'low'}`}>
                      {item.units > 40 ? '✓ Good' : item.units > 20 ? '⚠ Low' : '🔴 Critical'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Donate Blood Tab */}
        {activeTab === 'donate' && (
          <div className="blood-bank-content">
            <div className="donate-section">
              <h2>Schedule Your Blood Donation</h2>
              <p className="section-desc">Help us save lives by donating blood. Your contribution can make a difference!</p>

              <div className="upcoming-donations">
                <h3>Upcoming Donation Appointments</h3>
                <div className="donations-list">
                  {donationRequests.map((donation) => (
                    <div key={donation.id} className="donation-card">
                      <div className="donation-header">
                        <h4>{donation.name}</h4>
                        <span className={`status-badge ${donation.status.toLowerCase()}`}>
                          {donation.status}
                        </span>
                      </div>
                      <div className="donation-details">
                        <p><strong>Blood Type:</strong> <span className="blood-type">{donation.bloodType}</span></p>
                        <p><strong>Date & Time:</strong> {donation.date} at {donation.time}</p>
                        <p><strong>Location:</strong> {donation.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="donation-form-section">
                <h3>Schedule New Donation</h3>
                <p className="form-note">To schedule a new blood donation appointment, please log in to your account</p>
                <button className="btn-donate" onClick={handleDonate}>
                  Login to Donate
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Blood Requests Tab */}
        {activeTab === 'requests' && (
          <div className="blood-bank-content">
            <div className="requests-section">
              <h2>Active Blood Requests</h2>
              <p className="section-desc">These patients urgently need blood donations. If you can help, please donate!</p>

              <div className="requests-list">
                {bloodRequests.map((request) => (
                  <div key={request.id} className={`blood-request-card urgency-${request.urgency.toLowerCase()}`}>
                    <div className="request-header">
                      <div className="request-title">
                        <h4>{request.patientName}</h4>
                        <span className={`urgency-badge ${request.urgency.toLowerCase()}`}>
                          {request.urgency} Priority
                        </span>
                      </div>
                      <div className="blood-type-large">
                        {request.bloodType}
                      </div>
                    </div>

                    <div className="request-details">
                      <div className="detail-row">
                        <span className="label">Units Needed:</span>
                        <span className="value">{request.unitsNeeded} units</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Reason:</span>
                        <span className="value">{request.reason}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Hospital:</span>
                        <span className="value">{request.hospital}</span>
                      </div>
                    </div>

                    <div className="request-actions">
                      <button className="btn-request" onClick={handleRequest}>
                        Help This Patient
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="request-info-box">
                <h3>How to Help?</h3>
                <ul>
                  <li>✓ Register as a blood donor in your patient dashboard</li>
                  <li>✓ Choose which blood request you want to fulfill</li>
                  <li>✓ Complete your donation appointment</li>
                  <li>✓ Your donation will save lives!</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer id="contact">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Blood Bank Emergency</h3>
            <p>📞 Blood Bank: +1 234 567 8910</p>
            <p>🚨 Critical Need Hotline: +1 234 567 8911</p>
          </div>
          <div className="footer-section">
            <h3>Donation Centers</h3>
            <p>📍 Main Center: Apollo Hospital, Delhi</p>
            <p>📍 City Branch: Max Healthcare, Delhi</p>
          </div>
          <div className="footer-section">
            <h3>Quick Links</h3>
            <p><Link to="/">Home</Link> | <Link to="/doctors">Doctors</Link> | <a href="#services">Services</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BloodBank;
