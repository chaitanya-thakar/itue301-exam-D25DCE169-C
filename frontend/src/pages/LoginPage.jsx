import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';
import { User, ShieldCheck, Stethoscope, Lock, Mail, ArrowRight, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import './LoginPage.css';

const LoginPage = () => {
  const { login, register, demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [selectedRole, setSelectedRole] = useState('patient'); // 'patient' | 'doctor' | 'admin'

  const [email, setEmail] = useState('rohan.sharma@medcare.com');
  const [password, setPassword] = useState('patient123');

  // Register state
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    bloodGroup: 'B+',
    age: 26
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Switch role handler: autofills matching demo credentials
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    const demo = DEMO_ACCOUNTS.find((d) => d.role === role);
    if (demo) {
      setEmail(demo.email);
      setPassword(demo.password);
    }
    setError('');
  };

  // Quick 1-Click Demo Login
  const handleOneClickDemo = (role) => {
    demoLogin(role);
    if (role === 'admin') navigate('/admin');
    else if (role === 'doctor') navigate('/doctor-dashboard');
    else navigate('/booking');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password, selectedRole);
      if (result.success) {
        if (result.user.role === 'admin') navigate('/admin');
        else if (result.user.role === 'doctor') navigate('/doctor-dashboard');
        else navigate('/booking');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await register(registerData);
      if (result.success) {
        navigate('/booking');
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container login-page">
      <div className="login-container">
        {/* Header */}
        <div className="login-header">
          <span className="login-badge">Portal Access</span>
          <h1 className="login-title">MedCare Plus Authentication</h1>
          <p className="login-subtitle">
            Sign in as a Patient, Specialist Doctor, or Hospital Administrator.
          </p>
        </div>

        {/* Quick 1-Click Demo Cards */}
        <div className="demo-shortcuts">
          <div className="demo-shortcuts-title">
            <Sparkles size={16} />
            <span>Instant 1-Click Demo Logins:</span>
          </div>
          <div className="demo-grid">
            <button
              type="button"
              className="demo-btn patient-btn"
              onClick={() => handleOneClickDemo('patient')}
            >
              <User size={18} />
              <div>
                <strong>Patient</strong>
                <small>Rohan Sharma</small>
              </div>
            </button>

            <button
              type="button"
              className="demo-btn doctor-btn"
              onClick={() => handleOneClickDemo('doctor')}
            >
              <Stethoscope size={18} />
              <div>
                <strong>Doctor</strong>
                <small>Dr. Sarah Patel</small>
              </div>
            </button>

            <button
              type="button"
              className="demo-btn admin-btn"
              onClick={() => handleOneClickDemo('admin')}
            >
              <ShieldCheck size={18} />
              <div>
                <strong>Admin</strong>
                <small>Full Panel</small>
              </div>
            </button>
          </div>
        </div>

        {/* Card Box */}
        <div className="auth-card">
          {/* Top Role Selector */}
          <div className="role-selector">
            <button
              type="button"
              className={`role-tab ${selectedRole === 'patient' ? 'active' : ''}`}
              onClick={() => handleRoleSelect('patient')}
            >
              <User size={16} />
              <span>Patient</span>
            </button>

            <button
              type="button"
              className={`role-tab ${selectedRole === 'doctor' ? 'active' : ''}`}
              onClick={() => handleRoleSelect('doctor')}
            >
              <Stethoscope size={16} />
              <span>Doctor</span>
            </button>

            <button
              type="button"
              className={`role-tab ${selectedRole === 'admin' ? 'active' : ''}`}
              onClick={() => handleRoleSelect('admin')}
            >
              <ShieldCheck size={16} />
              <span>Admin</span>
            </button>
          </div>

          {error && (
            <div className="auth-alert error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input
                    type="password"
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                <span>{loading ? 'Authenticating...' : `Sign in as ${selectedRole.toUpperCase()}`}</span>
                <ArrowRight size={16} />
              </button>

              {selectedRole === 'patient' && (
                <p className="auth-switch-text">
                  New patient?{' '}
                  <button
                    type="button"
                    className="switch-btn"
                    onClick={() => setActiveTab('register')}
                  >
                    Create an account
                  </button>
                </p>
              )}
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Vikram Singh"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="vikram@example.com"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Create a password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select
                    className="form-select"
                    value={registerData.bloodGroup}
                    onChange={(e) => setRegisterData({ ...registerData, bloodGroup: e.target.value })}
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input
                    type="number"
                    className="form-input"
                    min="1"
                    max="120"
                    value={registerData.age}
                    onChange={(e) => setRegisterData({ ...registerData, age: e.target.value })}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                <span>{loading ? 'Creating Account...' : 'Register as Patient'}</span>
                <CheckCircle2 size={16} />
              </button>

              <p className="auth-switch-text">
                Already registered?{' '}
                <button
                  type="button"
                  className="switch-btn"
                  onClick={() => setActiveTab('login')}
                >
                  Back to Sign In
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
