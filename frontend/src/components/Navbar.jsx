import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  Users,
  CalendarPlus,
  Home,
  ShieldCheck,
  Stethoscope,
  User,
  LogIn,
  LogOut,
  ChevronDown,
  CalendarCheck
} from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isDoctor, isPatient, logout, demoLogin } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleRoleSwitch = (role) => {
    demoLogin(role);
    setDropdownOpen(false);
    if (role === 'admin') navigate('/admin');
    else if (role === 'doctor') navigate('/doctor-dashboard');
    else navigate('/my-appointments');
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="container nav-container">
        {/* Brand Logo */}
        <NavLink to="/" className="brand-logo">
          <div className="logo-icon">
            <Activity size={22} color="#ffffff" />
          </div>
          <div className="brand-text">
            <span className="brand-title">MedCare Plus</span>
            <span className="brand-subtitle">Hospital Appointments</span>
          </div>
        </NavLink>

        {/* Distinct Navigation Links based on Role */}
        <nav className="nav-links">
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            end
          >
            <Home size={18} />
            <span>Home</span>
          </NavLink>

          {/* Doctors list link (visible to patients, guests, and admin, hidden for doctors) */}
          {!isDoctor && (
            <NavLink
              to="/doctors"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              <Users size={18} />
              <span>Doctors</span>
            </NavLink>
          )}

          {/* Patient Navigation */}
          {(!isAuthenticated || isPatient) && (
            <>
              <NavLink
                to="/booking"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                <CalendarPlus size={18} />
                <span>Book Appointment</span>
              </NavLink>

              <NavLink
                to="/my-appointments"
                className={({ isActive }) => (isActive ? 'nav-link active patient-nav' : 'nav-link patient-nav')}
              >
                <CalendarCheck size={18} />
                <span>My Appointments</span>
              </NavLink>
            </>
          )}

          {/* Doctor Navigation */}
          {isDoctor && (
            <NavLink
              to="/doctor-dashboard"
              className={({ isActive }) => (isActive ? 'nav-link active doctor-nav' : 'nav-link doctor-nav')}
            >
              <Stethoscope size={18} />
              <span>Doctor Portal</span>
            </NavLink>
          )}

          {/* Admin Navigation */}
          {isAdmin && (
            <>
              <NavLink
                to="/admin"
                className={({ isActive }) => (isActive ? 'nav-link active admin-nav' : 'nav-link admin-nav')}
              >
                <ShieldCheck size={18} />
                <span>Admin Panel</span>
              </NavLink>

              <NavLink
                to="/booking"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                <CalendarPlus size={18} />
                <span>New Booking</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* User Role Switcher & Auth Section */}
        <div className="nav-auth-section">
          {isAuthenticated ? (
            <div className="user-profile-menu">
              <button
                type="button"
                className="user-profile-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className={`user-role-avatar ${user?.role}`}>
                  {user?.role === 'admin' ? (
                    <ShieldCheck size={16} />
                  ) : user?.role === 'doctor' ? (
                    <Stethoscope size={16} />
                  ) : (
                    <User size={16} />
                  )}
                </div>
                <div className="user-text-info">
                  <span className="user-name">{user?.name || 'User'}</span>
                  <span className={`user-role-tag ${user?.role}`}>
                    {user?.role === 'admin' ? 'ADMINISTRATOR' : user?.role === 'doctor' ? 'DOCTOR' : 'PATIENT'}
                  </span>
                </div>
                <ChevronDown size={14} className="dropdown-arrow" />
              </button>

              {dropdownOpen && (
                <div className="role-dropdown-menu">
                  <div className="dropdown-header">
                    <span>Switch Role (Test Different Access):</span>
                  </div>

                  <button
                    type="button"
                    className={`dropdown-item ${user?.role === 'patient' ? 'selected' : ''}`}
                    onClick={() => handleRoleSwitch('patient')}
                  >
                    <User size={16} />
                    <div>
                      <strong>Patient Portal</strong>
                      <small>Book & track acceptance</small>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`dropdown-item ${user?.role === 'doctor' ? 'selected' : ''}`}
                    onClick={() => handleRoleSwitch('doctor')}
                  >
                    <Stethoscope size={16} />
                    <div>
                      <strong>Doctor Portal</strong>
                      <small>Accept or reject patient requests</small>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`dropdown-item ${user?.role === 'admin' ? 'selected' : ''}`}
                    onClick={() => handleRoleSwitch('admin')}
                  >
                    <ShieldCheck size={16} />
                    <div>
                      <strong>Admin Panel</strong>
                      <small>Full management control</small>
                    </div>
                  </button>

                  <div className="dropdown-divider" />

                  <button type="button" className="dropdown-item logout" onClick={handleLogout}>
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              <LogIn size={16} />
              <span>Login / Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
