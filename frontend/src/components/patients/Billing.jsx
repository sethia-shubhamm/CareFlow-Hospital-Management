import '../../styles/PatientDashboard.css';
import axios from 'axios';
import API_URL from '../../utils/api';
import { useState, useEffect } from 'react';

const Billing = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/patients/bills`, { withCredentials: true });
      setBills(response.data.bills || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bills:', error);
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    return `status-badge ${status?.toLowerCase() || 'unpaid'}`;
  };

  return (
    <div className="billing-content">
      <div className="section-header">
        <h2>Billing & Payments</h2>
      </div>
      <div className="billing-list">
        {loading ? (
          <p>Loading bills...</p>
        ) : bills.length > 0 ? (
          bills.map((bill, index) => (
            <div key={index} className="bill-card">
              <div className="bill-header">
                <h3>{bill.description || 'Consultation Fee'}</h3>
                <span className={getStatusBadgeClass(bill.paymentStatus)}>{bill.paymentStatus}</span>
              </div>
              <div className="bill-details">
                <div className="bill-item">
                  <span>Amount:</span>
                  <strong>${bill.amount?.toFixed(2) || '0.00'}</strong>
                </div>
                <div className="bill-item">
                  <span>Date Issued:</span>
                  <strong>{new Date(bill.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                </div>
                {bill.paymentStatus === 'paid' && bill.paidAt && (
                  <div className="bill-item">
                    <span>Payment Date:</span>
                    <strong>{new Date(bill.paidAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                  </div>
                )}
                {bill.paymentStatus !== 'paid' && bill.dueDate && (
                  <div className="bill-item">
                    <span>Due Date:</span>
                    <strong>{new Date(bill.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                  </div>
                )}
              </div>
              {bill.paymentStatus === 'paid' ? (
                <button className="btn-view">View Receipt</button>
              ) : (
                <button className="pay-bill-btn">Pay Now</button>
              )}
            </div>
          ))
        ) : (
          <p>No bills available</p>
        )}
      </div>
    </div>
  );
};

export default Billing;
