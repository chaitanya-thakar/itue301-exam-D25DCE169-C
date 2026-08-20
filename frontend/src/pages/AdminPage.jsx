import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, Navigate } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  Calendar,
  Stethoscope,
  CheckCircle2,
  Clock,
  XCircle,
  PlusCircle,
  Trash2,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import './AdminPage.css';

const AdminPage = () => {
  const { user, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState('appointments'); // 'appointments' | 'doctors' | 'patients'
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');

  // Add Doctor Form State
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    email: '',
    specialisation: '',
    available: true
  });
  const [isAddingDoc, setIsAddingDoc] = useState(false);

  // Fetch all admin data
  const fetchAllData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, aptsRes, docsRes, patsRes] = await Promise.all([
        fetch('/api/v1/admin/stats'),
        fetch('/api/v1/appointments'),
        fetch('/api/v1/doctors'),
        fetch('/api/v1/patients')
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (aptsRes.ok) setAppointments(await aptsRes.json());
      if (docsRes.ok) setDoctors(await docsRes.json());
      if (patsRes.ok) setPatients(await patsRes.json());
    } catch (err) {
      setError('Error loading administrative data. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Update appointment status (confirm / pending / cancel)
  const handleStatusChange = async (aptId, newStatus) => {
    try {
      const res = await fetch(`/api/v1/appointments/${aptId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('Failed to update status');

      setAppointments((prev) =>
        prev.map((apt) => (apt._id === aptId || apt.id === aptId ? { ...apt, status: newStatus } : apt))
      );
      setNotification(`Appointment status updated to '${newStatus}'`);
      setTimeout(() => setNotification(''), 3000);
      fetchAllData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Toggle Doctor Availability
  const handleToggleDocAvailability = async (docId, currentStatus) => {
    try {
      const res = await fetch(`/api/v1/doctors/${docId}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: !currentStatus })
      });

      if (!res.ok) throw new Error('Failed to toggle availability');

      setDoctors((prev) =>
        prev.map((doc) => (doc._id === docId || doc.id === docId ? { ...doc, available: !currentStatus } : doc))
      );
      setNotification('Doctor availability updated successfully');
      setTimeout(() => setNotification(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete Doctor
  const handleDeleteDoc = async (docId) => {
    if (!window.confirm('Are you sure you want to remove this doctor?')) return;
    try {
      const res = await fetch(`/api/v1/doctors/${docId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete doctor');

      setDoctors((prev) => prev.filter((d) => d._id !== docId && d.id !== docId));
      setNotification('Doctor removed from directory');
      setTimeout(() => setNotification(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // Add New Doctor
  const handleAddDoctorSubmit = async (e) => {
    e.preventDefault();
    if (!newDoctor.name || !newDoctor.specialisation) {
      setError('Doctor name and specialisation are required');
      return;
    }

    try {
      const res = await fetch('/api/v1/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDoctor)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add doctor');

      setDoctors((prev) => [data.data, ...prev]);
      setNewDoctor({ name: '', email: '', specialisation: '', available: true });
      setIsAddingDoc(false);
      setNotification('New specialist doctor added successfully!');
      setTimeout(() => setNotification(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container admin-page">
      {/* Top Header */}
      <div className="admin-header">
        <div>
          <div className="admin-badge">
            <ShieldCheck size={18} />
            <span>Hospital Administration Portal</span>
          </div>
          <h1 className="page-title">Executive Control Center</h1>
          <p className="page-subtitle">
            Manage appointments, specialist doctors, patient records, and live hospital operations.
          </p>
        </div>

        <button onClick={fetchAllData} className="btn btn-secondary btn-sm" title="Refresh">
          <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
          <span>Refresh Data</span>
        </button>
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

      {/* Overview Statistics Cards */}
      <div className="admin-stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon doc-color">
            <Stethoscope size={22} />
          </div>
          <div>
            <span className="stat-card-label">Specialist Doctors</span>
            <div className="stat-card-value">
              {stats?.totalDoctors || doctors.length}{' '}
              <small>({stats?.availableDoctors || doctors.filter((d) => d.available !== false).length} Active)</small>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon pat-color">
            <Users size={22} />
          </div>
          <div>
            <span className="stat-card-label">Registered Patients</span>
            <div className="stat-card-value">{stats?.totalPatients || patients.length}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon apt-color">
            <Calendar size={22} />
          </div>
          <div>
            <span className="stat-card-label">Total Appointments</span>
            <div className="stat-card-value">{stats?.totalAppointments || appointments.length}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon confirm-color">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <span className="stat-card-label">Confirmed Slots</span>
            <div className="stat-card-value">
              {stats?.confirmedAppointments || appointments.filter((a) => a.status === 'confirmed').length}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="admin-tabs">
        <button
          className={`admin-tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
          onClick={() => setActiveTab('appointments')}
        >
          <Calendar size={18} />
          <span>Appointments Management ({appointments.length})</span>
        </button>

        <button
          className={`admin-tab-btn ${activeTab === 'doctors' ? 'active' : ''}`}
          onClick={() => setActiveTab('doctors')}
        >
          <Stethoscope size={18} />
          <span>Doctor Roster ({doctors.length})</span>
        </button>

        <button
          className={`admin-tab-btn ${activeTab === 'patients' ? 'active' : ''}`}
          onClick={() => setActiveTab('patients')}
        >
          <Users size={18} />
          <span>Patient Registry ({patients.length})</span>
        </button>
      </div>

      {/* TAB 1: Appointments Management */}
      {activeTab === 'appointments' && (
        <div className="admin-panel-card">
          <div className="panel-card-header">
            <h2 className="panel-title">All Hospital Appointments</h2>
            <Link to="/booking" className="btn btn-primary btn-sm">
              <PlusCircle size={16} />
              <span>New Appointment</span>
            </Link>
          </div>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date & Time</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => {
                  const aptId = apt._id || apt.id;
                  return (
                    <tr key={aptId}>
                      <td>
                        <strong>{apt.patientName}</strong>
                      </td>
                      <td>{apt.doctorName}</td>
                      <td>
                        <div className="datetime-cell">
                          <span>{apt.date}</span>
                          <small>{apt.timeSlot}</small>
                        </div>
                      </td>
                      <td>{apt.reason || 'General Checkup'}</td>
                      <td>
                        <span className={`status-badge status-${apt.status}`}>
                          {apt.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-btn-group">
                          {apt.status !== 'confirmed' && (
                            <button
                              className="action-btn confirm"
                              title="Set Confirmed"
                              onClick={() => handleStatusChange(aptId, 'confirmed')}
                            >
                              Confirm
                            </button>
                          )}
                          {apt.status !== 'pending' && (
                            <button
                              className="action-btn pending"
                              title="Set Pending"
                              onClick={() => handleStatusChange(aptId, 'pending')}
                            >
                              Pending
                            </button>
                          )}
                          {apt.status !== 'cancelled' && (
                            <button
                              className="action-btn cancel"
                              title="Set Cancelled"
                              onClick={() => handleStatusChange(aptId, 'cancelled')}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Doctors Management */}
      {activeTab === 'doctors' && (
        <div className="admin-panel-card">
          <div className="panel-card-header">
            <h2 className="panel-title">Doctors & Specialists Management</h2>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setIsAddingDoc(!isAddingDoc)}
            >
              <PlusCircle size={16} />
              <span>{isAddingDoc ? 'Close Form' : 'Add New Doctor'}</span>
            </button>
          </div>

          {/* Add Doctor Form */}
          {isAddingDoc && (
            <form onSubmit={handleAddDoctorSubmit} className="add-doctor-form">
              <h3>Register New Medical Specialist</h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Doctor Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Dr. Ramesh Gupta"
                    value={newDoctor.name}
                    onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="e.g. ramesh.gupta@medcare.com"
                    value={newDoctor.email}
                    onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Specialisation</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Oncology, Cardiology, Orthopedics"
                    value={newDoctor.specialisation}
                    onChange={(e) => setNewDoctor({ ...newDoctor, specialisation: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Availability Status</label>
                  <select
                    className="form-select"
                    value={newDoctor.available ? 'true' : 'false'}
                    onChange={(e) => setNewDoctor({ ...newDoctor, available: e.target.value === 'true' })}
                  >
                    <option value="true">Available for Consultations</option>
                    <option value="false">Currently Unavailable</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary">
                Save Doctor Record
              </button>
            </form>
          )}

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Specialisation</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doc) => {
                  const docId = doc._id || doc.id;
                  const isAvail = doc.available !== false;
                  return (
                    <tr key={docId}>
                      <td>
                        <strong>{doc.name}</strong>
                      </td>
                      <td>
                        <span className="spec-badge">{doc.specialisation}</span>
                      </td>
                      <td>{doc.email || 'N/A'}</td>
                      <td>
                        <span className={`availability-badge ${isAvail ? 'available' : 'unavailable'}`}>
                          {isAvail ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td>
                        <div className="action-btn-group">
                          <button
                            className="btn-icon"
                            title="Toggle Availability"
                            onClick={() => handleToggleDocAvailability(docId, isAvail)}
                          >
                            {isAvail ? <ToggleRight size={22} color="#10b981" /> : <ToggleLeft size={22} color="#94a3b8" />}
                          </button>
                          <button
                            className="btn-icon delete"
                            title="Delete Doctor"
                            onClick={() => handleDeleteDoc(docId)}
                          >
                            <Trash2 size={18} color="#ef4444" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Patients Registry */}
      {activeTab === 'patients' && (
        <div className="admin-panel-card">
          <div className="panel-card-header">
            <h2 className="panel-title">Registered Hospital Patients</h2>
          </div>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                  <th>Blood Group</th>
                  <th>Age</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((pat) => (
                  <tr key={pat._id || pat.id || pat.email}>
                    <td>
                      <strong>{pat.name}</strong>
                    </td>
                    <td>{pat.email}</td>
                    <td>{pat.phone || '+91 9876543210'}</td>
                    <td>
                      <span className="blood-badge">{pat.bloodGroup || 'O+'}</span>
                    </td>
                    <td>{pat.age || 30} yrs</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
