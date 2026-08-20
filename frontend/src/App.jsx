import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import SystemStatusBanner from './components/SystemStatusBanner';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import DoctorsPage from './pages/DoctorsPage';
import BookingPage from './pages/BookingPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import DoctorDashboard from './pages/DoctorDashboard';
import MyAppointmentsPage from './pages/MyAppointmentsPage';
import './App.css';

/**
 * Main Application Component
 * Styled with Emerald Health Theme
 * Configured with:
 * - Real-time System Status Banner
 * - Distinct Role-based Pages:
 *    - /my-appointments (Patient Dashboard: view accepted/rejected status)
 *    - /doctor-dashboard (Doctor Portal: accept/reject patient requests)
 *    - /admin (Admin Control Center: full hospital management)
 *    - /, /doctors, /booking (Core Task routes)
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-layout">
          {/* Top Live System Health & DB Connection Status */}
          <SystemStatusBanner />

          <Navbar />
          <main className="app-main">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/doctors" element={<DoctorsPage />} />
              <Route path="/booking" element={<BookingPage />} />
              <Route path="/my-appointments" element={<MyAppointmentsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
            </Routes>
          </main>
          <footer className="app-footer">
            <div className="container footer-container">
              <p>© 2026 MedCare Plus Hospital Appointment System. All rights reserved.</p>
              <p className="exam-tag">ITUE301 — Advanced Web Development Frameworks Practical Examination</p>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
