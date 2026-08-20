import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  CheckCircle2,
  Clock3,
  XCircle,
  CalendarPlus,
  RefreshCw,
  AlertCircle,
  HeartPulse,
  Phone,
  Droplet
} from 'lucide-react';
import AppointmentCard from '../components/AppointmentCard';
import './MyAppointmentsPage.css';

/**
 * Patient Portal: My Appointments Page
 * Allows patients to view the exact real-time status of their appointments:
 * - Confirmed / Accepted by Doctor
 * - Pending Review
 * - Rejected / Cancelled
 */
const MyAppointmentsPage = () => {
  const { user } = useAuth();
  const patientName = user?.name || 'Rohan Sharma';

  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'confirmed' | 'pending' | 'cancelled'
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');
  const [error, setError] = useState('');

  // Fetch patient's appointments
  const fetchMyAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/appointments');
      if (!res.ok) throw new Error('Failed to load appointments');
      const all = await res.json();

      // Filter for this patient's name
      const myApts = all.filter((a) => {
        if (!a.patientName) return false;
        return (
          a.patientName.toLowerCase().includes(patientName.toLowerCase()) ||
          patientName.toLowerCase().includes(a.patientName.toLowerCase())
        );
      });

      setAppointments(myApts.length > 0 ? myApts : all);
    } catch (err) {
      setError(err.message || 'Error fetching appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAppointments();
  }, [patientName]);

  // Patient cancels their own appointment
  const handleCancelAppointment = async (aptId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment request?')) return;

    try {
      const res = await fetch(`/api/v1/appointments/${aptId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      });

      if (!res.ok) throw new Error('Failed to cancel appointment');

      setAppointments((prev) =>
        prev.map((a) => (a._id === aptId || a.id === aptId ? { ...a, status: 'cancelled' } : a))
      );
      setNotification('Your appointment request has been cancelled.');
      setTimeout(() => setNotification(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // Filtered list
  const filteredAppointments = appointments.filter((apt) => {
    if (filter === 'all') return true;
    return apt.status === filter;
  });

  const confirmedCount = appointments.filter((a) => a.status === 'confirmed').length;
  const pendingCount = appointments.filter((a) => a.status === 'pending').length;
  const cancelledCount = appointments.filter((a) => a.status === 'cancelled').length;

  return (
    <div className="container my-appointments-page">
      {/* Patient Profile Header */}
      <div className="patient-profile-card">
        <div className="profile-info-left">
          <div className="patient-avatar-badge">
            <User size={32} />
          </div>
          <div>
            <span className="badge-pill patient-pill">Patient Portal</span>
            <h1 className="patient-title">{patientName}</h1>
            <div className="patient-meta">
              <span>{user?.email || 'rohan.sharma@medcare.com'}</span>
              {user?.phone && (
                <>
                  <span>•</span>
                  <span><Phone size={13} className="inline-icon" /> {user.phone}</span>
                </>
              )}
              {user?.bloodGroup && (
                <>
                  <span>•</span>
                  <span className="blood-tag"><Droplet size={13} className="inline-icon" /> Blood Group: {user.bloodGroup}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="profile-actions-right">
          <Link to="/booking" className="btn btn-primary">
            <CalendarPlus size={18} />
            <span>Book New Appointment</span>
          </Link>
          <button onClick={fetchMyAppointments} className="btn btn-secondary btn-sm" title="Refresh Statuses">
            <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
            <span>Refresh Status</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="alert-banner success">
          <CheckCircle2 size={18} />
          <span>{notification}</span>
        </div>
      )}

      {error && (
        <div className="alert-banner error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Appointment Status Cards Summary */}
      <div className="patient-status-summary">
        <div
          className={`status-summary-box ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          <div className="box-title">Total Bookings</div>
          <div className="box-number">{appointments.length}</div>
        </div>

        <div
          className={`status-summary-box confirmed-box ${filter === 'confirmed' ? 'active' : ''}`}
          onClick={() => setFilter('confirmed')}
        >
          <div className="box-title">
            <CheckCircle2 size={16} />
            <span>Accepted / Confirmed</span>
          </div>
          <div className="box-number text-success">{confirmedCount}</div>
        </div>

        <div
          className={`status-summary-box pending-box ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          <div className="box-title">
            <Clock3 size={16} />
            <span>Pending Review</span>
          </div>
          <div className="box-number text-warning">{pendingCount}</div>
        </div>

        <div
          className={`status-summary-box cancelled-box ${filter === 'cancelled' ? 'active' : ''}`}
          onClick={() => setFilter('cancelled')}
        >
          <div className="box-title">
            <XCircle size={16} />
            <span>Rejected / Cancelled</span>
          </div>
          <div className="box-number text-danger">{cancelledCount}</div>
        </div>
      </div>

      {/* Appointment Feed with Live Status Indicators */}
      <div className="appointments-section">
        <div className="section-header">
          <div>
            <h2 className="section-title">
              {filter === 'all'
                ? 'All Booked Appointments'
                : filter === 'confirmed'
                ? 'Accepted & Confirmed Consultations'
                : filter === 'pending'
                ? 'Pending Review Requests'
                : 'Rejected & Cancelled Consultations'}
            </h2>
            <p className="section-subtitle">
              Live consultation statuses received from your assigned doctors.
            </p>
          </div>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="empty-apts-card">
            <Calendar size={48} className="empty-icon" />
            <h3>No Appointments Found</h3>
            <p>You do not have any appointments under the '{filter}' filter.</p>
            <Link to="/booking" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              <CalendarPlus size={16} />
              <span>Book an Appointment Now</span>
            </Link>
          </div>
        ) : (
          <div className="patient-apts-grid">
            {filteredAppointments.map((apt) => {
              const aptId = apt._id || apt.id;
              const isConfirmed = apt.status === 'confirmed';
              const isPending = apt.status === 'pending';
              const isCancelled = apt.status === 'cancelled';

              return (
                <div key={aptId} className={`patient-apt-card status-${apt.status}-border`}>
                  {/* Status Banner on Card */}
                  <div className={`status-notification-banner ${apt.status}`}>
                    {isConfirmed && (
                      <>
                        <CheckCircle2 size={16} />
                        <span><strong>ACCEPTED</strong> • Doctor has confirmed your consultation slot.</span>
                      </>
                    )}
                    {isPending && (
                      <>
                        <Clock3 size={16} />
                        <span><strong>PENDING</strong> • Awaiting doctor review and approval.</span>
                      </>
                    )}
                    {isCancelled && (
                      <>
                        <XCircle size={16} />
                        <span><strong>REJECTED / CANCELLED</strong> • This slot is not active.</span>
                      </>
                    )}
                  </div>

                  {/* Appointment Card Props Rendering (Task 1) */}
                  <AppointmentCard
                    patientName={apt.patientName}
                    doctorName={apt.doctorName}
                    date={apt.date}
                    timeSlot={apt.timeSlot}
                    status={apt.status}
                  />

                  {/* Reason if provided */}
                  {apt.reason && (
                    <div className="patient-apt-reason">
                      <strong>Consultation Purpose:</strong> {apt.reason}
                    </div>
                  )}

                  {/* Patient Actions */}
                  {isPending && (
                    <div className="patient-card-footer">
                      <button
                        type="button"
                        className="btn-cancel-request"
                        onClick={() => handleCancelAppointment(aptId)}
                      >
                        <XCircle size={15} />
                        <span>Cancel Booking Request</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointmentsPage;
