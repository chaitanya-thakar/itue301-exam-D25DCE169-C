import React from 'react';
import { Calendar, Clock, User, Stethoscope, CheckCircle2, Clock3, XCircle } from 'lucide-react';
import './AppointmentCard.css';

/**
 * Task 1: AppointmentCard Component
 * Accepts props: patientName, doctorName, date, timeSlot, status
 * Displays all five values.
 * Changes appearance dynamically based on status value (confirmed, pending, cancelled).
 */
const AppointmentCard = ({ patientName, doctorName, date, timeSlot, status = 'pending' }) => {
  // Normalize status value
  const normalizedStatus = (status || 'pending').toLowerCase();

  // Status configuration mapping
  const statusConfig = {
    confirmed: {
      label: 'Confirmed',
      className: 'status-confirmed',
      icon: <CheckCircle2 size={16} />
    },
    pending: {
      label: 'Pending',
      className: 'status-pending',
      icon: <Clock3 size={16} />
    },
    cancelled: {
      label: 'Cancelled',
      className: 'status-cancelled',
      icon: <XCircle size={16} />
    }
  };

  const currentStatus = statusConfig[normalizedStatus] || {
    label: normalizedStatus,
    className: 'status-pending',
    icon: <Clock3 size={16} />
  };

  return (
    <div className={`appointment-card ${currentStatus.className}-card`}>
      <div className="card-header">
        <div className="patient-info">
          <div className="avatar-icon">
            <User size={18} />
          </div>
          <div>
            <span className="info-label">Patient Name</span>
            <h4 className="patient-name">{patientName || 'Unnamed Patient'}</h4>
          </div>
        </div>

        {/* Dynamic Status Badge with different CSS classes */}
        <span className={`status-badge ${currentStatus.className}`}>
          {currentStatus.icon}
          <span>{currentStatus.label}</span>
        </span>
      </div>

      <div className="card-divider" />

      <div className="card-details">
        <div className="detail-item doctor-detail">
          <Stethoscope size={16} className="detail-icon" />
          <div>
            <span className="detail-label">Doctor</span>
            <span className="detail-value highlight">{doctorName || 'Not Assigned'}</span>
          </div>
        </div>

        <div className="time-info-grid">
          <div className="detail-item">
            <Calendar size={16} className="detail-icon" />
            <div>
              <span className="detail-label">Date</span>
              <span className="detail-value">{date || 'N/A'}</span>
            </div>
          </div>

          <div className="detail-item">
            <Clock size={16} className="detail-icon" />
            <div>
              <span className="detail-label">Time Slot</span>
              <span className="detail-value">{timeSlot || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;
