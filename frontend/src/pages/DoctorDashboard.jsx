import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Stethoscope,
  CheckCircle2,
  Clock,
  XCircle,
  ToggleLeft,
  ToggleRight,
  User,
  Calendar,
  RefreshCw,
  AlertCircle,
  Clock3,
  CalendarCheck2,
  FileText
} from 'lucide-react';
import AppointmentCard from '../components/AppointmentCard';
import './DoctorDashboard.css';

/**
 * Doctor Portal Component
 * Doctors can:
 * - Accept/Confirm incoming patient appointment requests
 * - Reject/Decline requests
 * - Toggle on-duty availability
 * - View filtered schedules (Pending requests, Confirmed patients, Past/Declined)
 */
const DoctorDashboard = () => {
  const { user } = useAuth();
  const doctorName = user?.name || 'Dr. Sarah Patel';
  const specialisation = user?.specialisation || 'Cardiology';

  const [appointments, setAppointments] = useState([]);
  const [activeFilter, setActiveFilter] = useState('pending'); // 'pending' | 'confirmed' | 'cancelled' | 'all'
  const [available, setAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');
  const [error, setError] = useState('');

  const fetchDoctorAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/appointments');
      if (res.ok) {
        const all = await res.json();
        // Filter appointments for this doctor (or all if general demo)
        const docFirstName = doctorName.replace(/^Dr\.\s*/i, '').split(' ')[0];
        const filtered = all.filter((a) => {
          if (!a.doctorName) return true;
          return (
            a.doctorName.toLowerCase().includes(docFirstName.toLowerCase()) ||
            doctorName.toLowerCase().includes(a.doctorName.toLowerCase())
          );
        });
        setAppointments(filtered.length > 0 ? filtered : all);
      }
    } catch (err) {
      setError('Error loading doctor appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorAppointments();
  }, [doctorName]);

  // Doctor accepts or rejects appointment
  const handleDecision = async (aptId, newStatus) => {
    try {
      const res = await fetch(`/api/v1/appointments/${aptId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('Status update failed');

      setAppointments((prev) =>
        prev.map((a) => (a._id === aptId || a.id === aptId ? { ...a, status: newStatus } : a))
      );

      if (newStatus === 'confirmed') {
        setNotification('✅ Appointment ACCEPTED & CONFIRMED. Patient has been notified.');
      } else if (newStatus === 'cancelled') {
        setNotification('❌ Appointment DECLINED / REJECTED.');
      }
      setTimeout(() => setNotification(''), 4000);
    } catch (err) {
      setError(err.message);
    }
  };

  const pendingApts = appointments.filter((a) => a.status === 'pending');
  const confirmedApts = appointments.filter((a) => a.status === 'confirmed');
  const cancelledApts = appointments.filter((a) => a.status === 'cancelled');

  const displayedList =
    activeFilter === 'pending'
      ? pendingApts
      : activeFilter === 'confirmed'
      ? confirmedApts
      : activeFilter === 'cancelled'
      ? cancelledApts
      : appointments;

  return (
    <div className="container doctor-dashboard">
      {/* Profile Header */}
      <div className="doctor-header-card">
        <div className="doctor-info-section">
          <div className="doctor-avatar-large">
            <Stethoscope size={36} />
          </div>
          <div>
            <span className="badge-pill doctor-badge-pill">Doctor Portal</span>
            <h1 className="page-title">{doctorName}</h1>
            <p className="page-subtitle">
              Specialisation: <strong>{specialisation}</strong> • Medical Staff ID: <code>MED-{user?.id || 'DOC01'}</code>
            </p>
          </div>
        </div>

        <div className="availability-toggle-box">
          <span className="toggle-label">Duty & Consultation Status:</span>
          <button
            type="button"
            className={`toggle-btn ${available ? 'is-active' : 'is-inactive'}`}
            onClick={() => setAvailable(!available)}
          >
            {available ? (
              <>
                <ToggleRight size={28} color="#10b981" />
                <span className="status-text online">Accepting Consultations (On Duty)</span>
              </>
            ) : (
              <>
                <ToggleLeft size={28} color="#94a3b8" />
                <span className="status-text offline">Not Accepting Bookings (Off Duty)</span>
              </>
            )}
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

      {/* Metrics Row */}
      <div className="doctor-metrics-grid">
        <div
          className={`metric-box ${activeFilter === 'pending' ? 'active-metric' : ''}`}
          onClick={() => setActiveFilter('pending')}
        >
          <span className="metric-label">
            <Clock3 size={15} />
            <span>Pending Requests ({pendingApts.length})</span>
          </span>
          <span className="metric-value text-warning">{pendingApts.length}</span>
          <small className="metric-hint">Requires your decision</small>
        </div>

        <div
          className={`metric-box ${activeFilter === 'confirmed' ? 'active-metric' : ''}`}
          onClick={() => setActiveFilter('confirmed')}
        >
          <span className="metric-label">
            <CalendarCheck2 size={15} />
            <span>Confirmed Schedule ({confirmedApts.length})</span>
          </span>
          <span className="metric-value text-success">{confirmedApts.length}</span>
          <small className="metric-hint">Accepted appointments</small>
        </div>

        <div
          className={`metric-box ${activeFilter === 'cancelled' ? 'active-metric' : ''}`}
          onClick={() => setActiveFilter('cancelled')}
        >
          <span className="metric-label">
            <XCircle size={15} />
            <span>Declined / Cancelled ({cancelledApts.length})</span>
          </span>
          <span className="metric-value text-muted">{cancelledApts.length}</span>
          <small className="metric-hint">Rejected requests</small>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="doc-filter-tabs">
        <button
          className={`doc-tab ${activeFilter === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveFilter('pending')}
        >
          <span>⏳ New Booking Requests</span>
          <span className="count-tag yellow">{pendingApts.length}</span>
        </button>

        <button
          className={`doc-tab ${activeFilter === 'confirmed' ? 'active' : ''}`}
          onClick={() => setActiveFilter('confirmed')}
        >
          <span>✅ Confirmed Consultations</span>
          <span className="count-tag green">{confirmedApts.length}</span>
        </button>

        <button
          className={`doc-tab ${activeFilter === 'cancelled' ? 'active' : ''}`}
          onClick={() => setActiveFilter('cancelled')}
        >
          <span>❌ Declined / Cancelled</span>
          <span className="count-tag red">{cancelledApts.length}</span>
        </button>

        <button
          className={`doc-tab ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          <span>All Records ({appointments.length})</span>
        </button>

        <button onClick={fetchDoctorAppointments} className="btn-refresh-inline" title="Refresh">
          <RefreshCw size={15} className={loading ? 'spin-icon' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Appointments List */}
      <div className="doctor-apts-grid">
        {displayedList.length === 0 ? (
          <div className="doc-empty-card">
            <Calendar size={42} className="empty-icon" />
            <h3>No Appointments in this tab</h3>
            <p>No patient requests are currently marked as '{activeFilter}'.</p>
          </div>
        ) : (
          displayedList.map((apt) => {
            const aptId = apt._id || apt.id;
            const isPending = apt.status === 'pending';
            const isConfirmed = apt.status === 'confirmed';

            return (
              <div key={aptId} className={`doctor-apt-card status-${apt.status}-border`}>
                <div className="apt-top">
                  <div className="patient-avatar-box">
                    <div className="user-icon-circle">
                      <User size={18} />
                    </div>
                    <div>
                      <span className="patient-label">Patient Name</span>
                      <h4 className="patient-name">{apt.patientName}</h4>
                    </div>
                  </div>
                  <span className={`status-badge status-${apt.status}`}>
                    {apt.status}
                  </span>
                </div>

                <div className="apt-mid-details">
                  <div className="apt-detail-row">
                    <Calendar size={15} className="detail-icon" />
                    <span><strong>Date:</strong> {apt.date}</span>
                  </div>
                  <div className="apt-detail-row">
                    <Clock size={15} className="detail-icon" />
                    <span><strong>Time Slot:</strong> {apt.timeSlot}</span>
                  </div>
                  {apt.reason && (
                    <div className="apt-reason-box">
                      <FileText size={14} className="detail-icon" />
                      <span><strong>Symptoms / Reason:</strong> {apt.reason}</span>
                    </div>
                  )}
                </div>

                {/* Accept / Reject Decision Buttons for Doctors */}
                <div className="apt-decision-actions">
                  {isPending && (
                    <>
                      <button
                        className="btn btn-sm btn-accept"
                        onClick={() => handleDecision(aptId, 'confirmed')}
                      >
                        <CheckCircle2 size={16} />
                        <span>Accept & Confirm</span>
                      </button>

                      <button
                        className="btn btn-sm btn-decline"
                        onClick={() => handleDecision(aptId, 'cancelled')}
                      >
                        <XCircle size={16} />
                        <span>Decline / Reject</span>
                      </button>
                    </>
                  )}

                  {isConfirmed && (
                    <div className="confirmed-action-bar">
                      <span className="confirmed-label">
                        <CheckCircle2 size={15} /> Confirmed Slot
                      </span>
                      <button
                        className="btn-link-cancel"
                        onClick={() => handleDecision(aptId, 'cancelled')}
                      >
                        Cancel Slot
                      </button>
                    </div>
                  )}

                  {apt.status === 'cancelled' && (
                    <div className="cancelled-action-bar">
                      <span className="cancelled-label">
                        <XCircle size={15} /> Declined / Inactive
                      </span>
                      <button
                        className="btn-link-reopen"
                        onClick={() => handleDecision(aptId, 'confirmed')}
                      >
                        Re-Accept
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
