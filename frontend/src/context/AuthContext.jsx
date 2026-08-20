import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const DEMO_ACCOUNTS = [
  {
    role: 'patient',
    label: 'Patient (Rohan Sharma)',
    email: 'rohan.sharma@medcare.com',
    password: 'patient123',
    name: 'Rohan Sharma',
    bloodGroup: 'B+',
    phone: '+91 9876543210'
  },
  {
    role: 'doctor',
    label: 'Doctor (Dr. Sarah Patel)',
    email: 'sarah.patel@medcare.com',
    password: 'doctor123',
    name: 'Dr. Sarah Patel',
    specialisation: 'Cardiology'
  },
  {
    role: 'admin',
    label: 'Admin (Hospital Director)',
    email: 'admin@medcare.com',
    password: 'admin123',
    name: 'Hospital Administrator'
  }
];

export const AuthProvider = ({ children }) => {
  // Load initial user from localStorage if available, or default to patient demo
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('medcare_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('medcare_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('medcare_user');
    }
  }, [user]);

  // Login method
  const login = async (email, password, role) => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setUser(data.user);
      return { success: true, user: data.user };
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Demo Login
  const demoLogin = (roleName) => {
    const demo = DEMO_ACCOUNTS.find((d) => d.role === roleName) || DEMO_ACCOUNTS[0];
    const userObj = {
      id: 'demo_' + demo.role,
      name: demo.name,
      email: demo.email,
      role: demo.role,
      specialisation: demo.specialisation,
      bloodGroup: demo.bloodGroup,
      phone: demo.phone
    };
    setUser(userObj);
    return userObj;
  };

  // Register method
  const register = async (patientData) => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setUser(data.user);
      return { success: true, user: data.user };
    } finally {
      setLoading(false);
    }
  };

  // Logout method
  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isDoctor: user?.role === 'doctor',
        isPatient: user?.role === 'patient',
        login,
        demoLogin,
        register,
        logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
