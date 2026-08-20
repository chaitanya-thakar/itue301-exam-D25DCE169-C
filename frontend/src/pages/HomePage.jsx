import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, CalendarPlus, CheckCircle2, Clock, Users, ArrowRight } from 'lucide-react';
import AppointmentCard from '../components/AppointmentCard';
import './HomePage.css';

const HomePage = () => {
  // Sample appointments illustrating Task 1 props and status styling
  const [appointments, setAppointments] = useState([
    {
      patientName: 'Rohan Sharma',
      doctorName: 'Dr. Sarah Patel (Cardiologist)',
      date: '2026-08-25',
      timeSlot: '10:00 AM - 10:30 AM',
      status: 'confirmed'
    },
    {
      patientName: 'Sneha Joshi',
      doctorName: 'Dr. Arjun Mehta (Neurologist)',
      date: '2026-08-26',
      timeSlot: '02:00 PM - 02:30 PM',
      status: 'pending'
    },
    {
      patientName: 'Amit Kumar',
      doctorName: 'Dr. Rajesh Verma (Orthopedic)',
      date: '2026-08-22',
      timeSlot: '11:30 AM - 12:00 PM',
      status: 'cancelled'
    }
  ]);

  // Fetch latest appointments from backend if available
  useEffect(() => {
    fetch('/api/v1/appointments')
      .then((res) => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAppointments(data);
        }
      })
      .catch(() => {
        // Keeps initial showcase data
      });
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <span className="hero-badge">MedCare Plus Hospital Management</span>
            <h1 className="hero-title">
              Modern Healthcare Appointments, <span className="highlight-text">Simplified</span>.
            </h1>
            <p className="hero-description">
              Welcome to the MedCare Plus Hospital Appointment System. Browse our specialist doctors,
              book new consultations effortlessly, and track real-time appointment statuses.
            </p>
            <div className="hero-actions">
              <Link to="/booking" className="btn btn-primary">
                <CalendarPlus size={18} />
                <span>Book Appointment</span>
              </Link>
              <Link to="/doctors" className="btn btn-secondary">
                <Users size={18} />
                <span>Explore Doctors</span>
              </Link>
            </div>
          </div>

          <div className="hero-stats-card">
            <h3 className="stats-header">Today's Hospital Overview</h3>
            <div className="stats-grid">
              <div className="stat-box">
                <div className="stat-icon-wrapper primary">
                  <Stethoscope size={20} />
                </div>
                <div className="stat-number">5+</div>
                <div className="stat-label">Specialist Doctors</div>
              </div>

              <div className="stat-box">
                <div className="stat-icon-wrapper success">
                  <CheckCircle2 size={20} />
                </div>
                <div className="stat-number">{appointments.filter(a => a.status === 'confirmed').length}</div>
                <div className="stat-label">Confirmed Appointments</div>
              </div>

              <div className="stat-box">
                <div className="stat-icon-wrapper warning">
                  <Clock size={20} />
                </div>
                <div className="stat-number">{appointments.filter(a => a.status === 'pending').length}</div>
                <div className="stat-label">Pending Reviews</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Section - Showcase Appointment Cards (Task 1) */}
      <section className="container section-container">
        <div className="section-header">
          <div>
            <h2 className="section-title">Recent Appointments</h2>
            <p className="section-subtitle">
              Displaying appointment cards with dynamic status styling (Confirmed, Pending, Cancelled)
            </p>
          </div>
          <Link to="/booking" className="link-action">
            <span>New Booking</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="appointments-grid">
          {appointments.map((apt, index) => (
            <AppointmentCard
              key={apt._id || apt.id || index}
              patientName={apt.patientName}
              doctorName={apt.doctorName}
              date={apt.date}
              timeSlot={apt.timeSlot}
              status={apt.status}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
