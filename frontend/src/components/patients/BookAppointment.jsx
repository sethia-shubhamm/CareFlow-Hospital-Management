import '../../styles/PatientDashboard.css';
import axios from 'axios';
import API_URL from '../../utils/api';
import { useState, useEffect } from 'react';

const BookAppointment = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    appointmentDate: '',
    appointmentTime: '',
    reason: ''
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/patients/doctors`, { withCredentials: true });
      setDoctors(response.data.doctors || []);
      setFilteredDoctors(response.data.doctors || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setErrorMessage('Failed to load doctors');
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = doctors.filter(doctor =>
      doctor.name.toLowerCase().includes(value) ||
      doctor.specialization.toLowerCase().includes(value)
    );
    setFilteredDoctors(filtered);
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setSuccessMessage('');
    setErrorMessage('');
    setFormData({ appointmentDate: '', appointmentTime: '', reason: '' });
    
    // Scroll to booking panel
    const bookingPanel = document.querySelector('.booking-panel');
    if (bookingPanel) {
      bookingPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.appointmentDate || !formData.appointmentTime) {
      setErrorMessage('Please select both date and time');
      return;
    }

    try {
      setBookingLoading(true);
      const response = await axios.post(
        `${API_URL}/api/patients/book-appointment`,
        {
          doctorId: selectedDoctor.id,
          appointmentDate: formData.appointmentDate,
          appointmentTime: formData.appointmentTime,
          reason: formData.reason || 'General Checkup'
        },
        { withCredentials: true }
      );

      setSuccessMessage('Appointment booked successfully!');
      setFormData({ appointmentDate: '', appointmentTime: '', reason: '' });
      setSelectedDoctor(null);
      setBookingLoading(false);

      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to book appointment');
      setBookingLoading(false);
    }
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="book-appointment-content">
      <div className="section-header">
        <h2>Book an Appointment</h2>
      </div>

      {successMessage && (
        <div className="alert alert-success">
          ✓ {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-error">
          ✗ {errorMessage}
        </div>
      )}

      <div className="appointment-booking-container">
        <div className="doctors-panel">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by doctor name or specialty..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>

          <h3>Available Doctors</h3>
          <div className="doctors-list">
            {loading ? (
              <p>Loading doctors...</p>
            ) : filteredDoctors.length > 0 ? (
              filteredDoctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className={`doctor-card ${selectedDoctor?.id === doctor.id ? 'active' : ''}`}
                  onClick={() => handleDoctorSelect(doctor)}
                >
                  <div className="doctor-card-header">
                    <div className="doctor-avatar">
                      <img
                        src={doctor.image || "/images/patientPage/doctor.png"}
                        alt={doctor.name}
                      />
                    </div>
                    <div className="doctor-info-quick">
                      <h4>{doctor.name}</h4>
                      <p className="specialty">{doctor.specialization}</p>
                      {doctor.experience && (
                        <p className="experience">{doctor.experience}+ years experience</p>
                      )}
                    </div>
                  </div>
                  <div className="doctor-details">
                    {doctor.education && (
                      <p><strong>Education:</strong> {doctor.education}</p>
                    )}
                    {doctor.address && (
                      <p><strong>Location:</strong> {doctor.address}</p>
                    )}
                  </div>
                  <div className="availability-badge">
                    Available
                  </div>
                </div>
              ))
            ) : (
              <p className="no-results">No doctors found matching your search</p>
            )}
          </div>
        </div>

        {selectedDoctor && (
          <div className="booking-panel">
            <div className="booking-card">
              <h3>Book Appointment with</h3>
              <div className="selected-doctor-info">
                <div className="doctor-avatar-large">
                  <img
                    src={selectedDoctor.image || "/images/patientPage/doctor.png"}
                    alt={selectedDoctor.name}
                  />
                </div>
                <div className="doctor-info-detailed">
                  <h4>{selectedDoctor.name}</h4>
                  <p>{selectedDoctor.specialization}</p>
                  {selectedDoctor.experience && (
                    <p>{selectedDoctor.experience}+ years experience</p>
                  )}
                </div>
              </div>

              <form onSubmit={handleBookAppointment} className="booking-form">
                <div className="form-group">
                  <label htmlFor="appointmentDate">Appointment Date *</label>
                  <input
                    type="date"
                    id="appointmentDate"
                    name="appointmentDate"
                    value={formData.appointmentDate}
                    onChange={handleFormChange}
                    min={getTomorrowDate()}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="appointmentTime">Appointment Time *</label>
                  <select
                    id="appointmentTime"
                    name="appointmentTime"
                    value={formData.appointmentTime}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Select a time slot</option>
                    <option value="09:00">09:00 AM</option>
                    <option value="09:30">09:30 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="10:30">10:30 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="11:30">11:30 AM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="14:30">02:30 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="15:30">03:30 PM</option>
                    <option value="16:00">04:00 PM</option>
                    <option value="16:30">04:30 PM</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="reason">Reason for Visit</label>
                  <textarea
                    id="reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleFormChange}
                    placeholder="Describe your symptoms or reason for visit..."
                    rows="4"
                  ></textarea>
                </div>

                <div className="booking-actions">
                  <button
                    type="submit"
                    className="btn-primary btn-book"
                    disabled={bookingLoading}
                  >
                    {bookingLoading ? 'Booking...' : 'Confirm Appointment'}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setSelectedDoctor(null);
                      setFormData({ appointmentDate: '', appointmentTime: '', reason: '' });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookAppointment;
