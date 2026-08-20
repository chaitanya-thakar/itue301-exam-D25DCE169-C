import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Mail, CheckCircle2, XCircle, AlertTriangle, RefreshCw, CalendarPlus } from 'lucide-react';
import './DoctorsPage.css';

/**
 * Task 4: DoctorsPage Component
 * Consumes GET /api/v1/doctors from Express backend
 * Uses useEffect() on mount
 * Maintains 3 states: data, loading, and error
 * Displays loading indicator, error message on failure, and doctor data (name, specialisation, availability)
 */
const DoctorsPage = () => {
  // Three distinct states required by Task 4
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Asynchronous fetch function
  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch from Express REST API
      const response = await fetch('/api/v1/doctors');

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status} (${response.statusText})`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError(err.message || 'Failed to fetch doctor information. Please ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // useEffect triggers API call when component mounts
  useEffect(() => {
    fetchDoctors();
  }, []);

  return (
    <div className="container doctors-page">
      <div className="page-header">
        <div>
          <span className="badge-pill">Medical Staff Directory</span>
          <h1 className="page-title">Specialist Doctors</h1>
          <p className="page-subtitle">
            Browse our team of certified medical specialists and check their current availability.
          </p>
        </div>
        <button onClick={fetchDoctors} className="btn btn-secondary btn-sm" title="Refresh List">
          <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 1. Loading State */}
      {loading && (
        <div className="state-card loading-state">
          <div className="loading-spinner" />
          <p className="state-title">Loading Doctors...</p>
          <p className="state-text">Fetching doctors list from <code>GET /api/v1/doctors</code></p>
        </div>
      )}

      {/* 2. Error State */}
      {!loading && error && (
        <div className="state-card error-state">
          <AlertTriangle size={40} className="error-icon" />
          <h3 className="state-title">Unable to Load Doctors</h3>
          <p className="state-text">{error}</p>
          <button onClick={fetchDoctors} className="btn btn-primary">
            <RefreshCw size={16} />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* 3. Successful Data State */}
      {!loading && !error && data && data.length > 0 && (
        <div className="doctors-grid">
          {data.map((doctor) => {
            const isAvailable = doctor.available !== false;
            return (
              <div key={doctor._id || doctor.id || doctor.name} className="doctor-card">
                <div className="doctor-card-top">
                  <div className="doctor-avatar">
                    <Stethoscope size={24} />
                  </div>
                  {/* Availability Badge */}
                  <span className={`availability-badge ${isAvailable ? 'available' : 'unavailable'}`}>
                    {isAvailable ? (
                      <>
                        <CheckCircle2 size={14} />
                        <span>Available</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={14} />
                        <span>Unavailable</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="doctor-details">
                  {/* Doctor Name */}
                  <h3 className="doctor-name">{doctor.name}</h3>

                  {/* Specialisation */}
                  <div className="doctor-spec-tag">
                    <span>{doctor.specialisation}</span>
                  </div>

                  {/* Email */}
                  {doctor.email && (
                    <div className="doctor-contact">
                      <Mail size={14} />
                      <span>{doctor.email}</span>
                    </div>
                  )}
                </div>

                <div className="doctor-card-footer">
                  <Link
                    to={`/booking?doctor=${encodeURIComponent(doctor.name)}`}
                    className={`btn btn-block ${isAvailable ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    <CalendarPlus size={16} />
                    <span>{isAvailable ? 'Book Appointment' : 'View Schedule'}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && data && data.length === 0 && (
        <div className="state-card">
          <p className="state-title">No Doctors Found</p>
          <p className="state-text">No doctor records are currently registered in the database.</p>
        </div>
      )}
    </div>
  );
};

export default DoctorsPage;
