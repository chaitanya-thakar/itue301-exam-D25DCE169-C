import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  CalendarPlus,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  UserCheck,
  Calendar,
  Clock,
  ShieldCheck,
  User
} from 'lucide-react';
import AppointmentCard from '../components/AppointmentCard';
import './BookingPage.css';

/**
 * Task 2: BookingPage Component
 * Enhanced with:
 * 1. Auto-fetch patient name from logged-in user profile
 * 2. Strict future-only booking constraint (Date >= Today)
 * 3. Live state preview & real-time updates
 */
const BookingPage = () => {
  const { user, isPatient } = useAuth();
  const [searchParams] = useSearchParams();
  const preselectedDoctor = searchParams.get('doctor') || '';

  // Get current date string formatted as YYYY-MM-DD
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getTodayString();

  // Task 2: Meaningful useState hooks
  // 1. Form data state (auto-fills patient name if user is logged in)
  const [formData, setFormData] = useState({
    patientName: user?.name || (isPatient ? user?.name : '') || '',
    date: todayStr,
    timeSlot: '10:00 AM - 10:30 AM',
    reason: ''
  });

  // 2. Selected doctor state
  const [selectedDoctor, setSelectedDoctor] = useState(preselectedDoctor || 'Dr. Sarah Patel');

  // 3. UI and submission states
  const [doctorsList, setDoctorsList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [recentBookings, setRecentBookings] = useState([]);
  const [isAutoFilled, setIsAutoFilled] = useState(Boolean(user?.name));

  // Time slot options
  const timeSlots = [
    '09:00 AM - 09:30 AM',
    '10:00 AM - 10:30 AM',
    '11:30 AM - 12:00 PM',
    '02:00 PM - 02:30 PM',
    '03:30 PM - 04:00 PM',
    '05:00 PM - 05:30 PM'
  ];

  // Auto-fill patient name whenever the logged-in user changes
  useEffect(() => {
    if (user?.name) {
      setFormData((prev) => ({
        ...prev,
        patientName: user.name
      }));
      setIsAutoFilled(true);
    }
  }, [user]);

  // Fetch available doctors list from backend
  useEffect(() => {
    fetch('/api/v1/doctors')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load doctors');
        return res.json();
      })
      .then((docs) => {
        if (Array.isArray(docs) && docs.length > 0) {
          setDoctorsList(docs);
          if (!preselectedDoctor) {
            setSelectedDoctor(docs[0].name);
          }
        }
      })
      .catch(() => {
        // Fallback doctor list
        const fallback = [
          { name: 'Dr. Sarah Patel', specialisation: 'Cardiology' },
          { name: 'Dr. Arjun Mehta', specialisation: 'Neurology' },
          { name: 'Dr. Rajesh Verma', specialisation: 'Orthopedics' },
          { name: 'Dr. Ananya Iyer', specialisation: 'Dermatology' }
        ];
        setDoctorsList(fallback);
      });
  }, [preselectedDoctor]);

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'patientName') {
      setIsAutoFilled(value === user?.name);
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    setSubmissionSuccess(false);
    setErrorMessage('');
  };

  // Handle doctor selection change
  const handleDoctorChange = (e) => {
    setSelectedDoctor(e.target.value);
    setSubmissionSuccess(false);
  };

  // Reset to logged-in user profile name
  const handleResetToProfile = () => {
    if (user?.name) {
      setFormData((prev) => ({ ...prev, patientName: user.name }));
      setIsAutoFilled(true);
    }
  };

  // Form submission with strict future-only validation
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.patientName.trim()) {
      setErrorMessage('Please enter the patient name.');
      return;
    }

    if (!selectedDoctor) {
      setErrorMessage('Please select a doctor.');
      return;
    }

    // STRICT FUTURE DATE VALIDATION
    if (!formData.date || formData.date < todayStr) {
      setErrorMessage(
        `Invalid appointment date (${formData.date}). Appointments must be booked for today (${todayStr}) or a future date.`
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        patientName: formData.patientName.trim(),
        doctorName: selectedDoctor,
        date: formData.date,
        timeSlot: formData.timeSlot,
        status: 'pending',
        reason: formData.reason.trim()
      };

      const response = await fetch('/api/v1/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit appointment');
      }

      setSubmissionSuccess(true);
      const newApt = data.data || payload;
      setRecentBookings((prev) => [newApt, ...prev]);

      // Reset form but retain auto-filled patient name if logged in
      setFormData((prev) => ({
        ...prev,
        patientName: user?.name || '',
        reason: ''
      }));
    } catch (err) {
      setErrorMessage(err.message || 'Network error occurred while booking appointment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container booking-page">
      <div className="page-header">
        <div>
          <span className="badge-pill">Appointment Scheduling</span>
          <h1 className="page-title">Book a Consultation</h1>
          <p className="page-subtitle">
            Reserve an appointment slot. Only today and future dates are permitted.
          </p>
        </div>
      </div>

      <div className="booking-layout">
        {/* Left Column: Form */}
        <div className="form-card">
          <div className="form-card-header">
            <CalendarPlus size={22} className="header-icon" />
            <h2 className="card-title">Appointment Form</h2>
          </div>

          {submissionSuccess && (
            <div className="alert-banner success">
              <CheckCircle2 size={18} />
              <span>
                Appointment successfully booked for <strong>{formData.date}</strong>! Status set to{' '}
                <strong>pending</strong>.
              </span>
            </div>
          )}

          {errorMessage && (
            <div className="alert-banner error">
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="appointment-form">
            {/* Auto-filled patient profile banner */}
            {user && (
              <div className="profile-autofill-banner">
                <div className="autofill-info">
                  <UserCheck size={16} className="autofill-icon" />
                  <span>
                    Logged in as <strong>{user.name}</strong> ({user.role?.toUpperCase()})
                  </span>
                </div>
                {!isAutoFilled && (
                  <button
                    type="button"
                    className="btn-use-profile"
                    onClick={handleResetToProfile}
                  >
                    Auto-fill My Name
                  </button>
                )}
              </div>
            )}

            {/* Patient Name */}
            <div className="form-group">
              <div className="label-row">
                <label htmlFor="patientName" className="form-label">
                  Patient Full Name <span className="required">*</span>
                </label>
                {isAutoFilled && user && (
                  <span className="autofill-tag">
                    <UserCheck size={12} />
                    <span>Auto-fetched from profile</span>
                  </span>
                )}
              </div>
              <input
                id="patientName"
                name="patientName"
                type="text"
                className="form-input"
                placeholder="e.g. Rohan Sharma"
                value={formData.patientName}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Doctor Name Dropdown */}
            <div className="form-group">
              <label htmlFor="doctorName" className="form-label">
                Doctor Name <span className="required">*</span>
              </label>
              <select
                id="doctorName"
                name="doctorName"
                className="form-select"
                value={selectedDoctor}
                onChange={handleDoctorChange}
                required
              >
                {doctorsList.length > 0 ? (
                  doctorsList.map((doc) => (
                    <option key={doc._id || doc.id || doc.name} value={doc.name}>
                      {doc.name} {doc.specialisation ? `(${doc.specialisation})` : ''}
                    </option>
                  ))
                ) : (
                  <option value="Dr. Sarah Patel">Dr. Sarah Patel (Cardiology)</option>
                )}
              </select>
            </div>

            {/* Date and Time Slot in 2 columns */}
            <div className="form-row">
              <div className="form-group">
                <div className="label-row">
                  <label htmlFor="date" className="form-label">
                    Appointment Date <span className="required">*</span>
                  </label>
                  <span className="future-only-badge">Future dates only</span>
                </div>
                <input
                  id="date"
                  name="date"
                  type="date"
                  className="form-input"
                  min={todayStr} /* Enforces future bookings only */
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="timeSlot" className="form-label">
                  Time Slot <span className="required">*</span>
                </label>
                <select
                  id="timeSlot"
                  name="timeSlot"
                  className="form-select"
                  value={formData.timeSlot}
                  onChange={handleInputChange}
                  required
                >
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reason */}
            <div className="form-group">
              <label htmlFor="reason" className="form-label">
                Reason / Symptoms (Optional - Max 300 characters)
              </label>
              <textarea
                id="reason"
                name="reason"
                className="form-textarea"
                rows="3"
                maxLength={300}
                placeholder="Briefly describe the consultation purpose..."
                value={formData.reason}
                onChange={handleInputChange}
              />
              <span className="char-count">{formData.reason.length}/300 characters</span>
            </div>

            <button type="submit" className="btn btn-primary btn-submit" disabled={isSubmitting}>
              <CalendarPlus size={18} />
              <span>{isSubmitting ? 'Booking...' : 'Confirm Appointment'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Live State Change Preview & Task 2 Demonstration */}
        <div className="preview-column">
          <div className="live-preview-box">
            <div className="preview-header">
              <div className="live-pill">
                <Sparkles size={14} />
                <span>Live State Preview</span>
              </div>
              <span className="preview-tag">Task 2 Requirement</span>
            </div>

            {/* Task 2: Display entered patient name & doctor state as they change */}
            <div className="state-summary-card">
              <div className="summary-row">
                <span className="summary-label">Active Patient Name:</span>
                <span className="summary-value patient-highlight">
                  {formData.patientName || 'Waiting for user input...'}
                </span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Selected Doctor:</span>
                <span className="summary-value doctor-highlight">
                  {selectedDoctor || 'None Selected'}
                </span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Scheduled Date:</span>
                <span className="summary-value date-highlight">
                  {formData.date || 'N/A'}{' '}
                  {formData.date >= todayStr ? '(Valid Future Date)' : '(Invalid Past Date)'}
                </span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Scheduled Time:</span>
                <span className="summary-value">{formData.timeSlot || 'N/A'}</span>
              </div>
            </div>

            <h4 className="preview-card-title">Live Appointment Card Preview</h4>
            {/* Task 1 & 2: Real-time dynamic AppointmentCard props */}
            <AppointmentCard
              patientName={formData.patientName || 'Preview Patient'}
              doctorName={selectedDoctor || 'Dr. Sarah Patel'}
              date={formData.date}
              timeSlot={formData.timeSlot}
              status="pending"
            />
          </div>
        </div>
      </div>

      {/* Booked Appointments in this session */}
      {recentBookings.length > 0 && (
        <div className="session-bookings-section">
          <div className="section-header">
            <h3 className="section-title">Appointments Booked This Session</h3>
          </div>
          <div className="appointments-grid">
            {recentBookings.map((apt, idx) => (
              <AppointmentCard
                key={apt._id || apt.id || idx}
                patientName={apt.patientName}
                doctorName={apt.doctorName}
                date={apt.date}
                timeSlot={apt.timeSlot}
                status={apt.status || 'pending'}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
