import React, { createContext, useContext, useState, useEffect } from 'react';

export const THEMES = [
  {
    id: 'emerald',
    name: 'Emerald Health',
    description: 'Fresh & Trustworthy Clinical Green',
    primary: '#059669',
    primaryDark: '#047857',
    primaryLight: '#ecfdf5',
    gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    previewColor: '#10b981'
  },
  {
    id: 'indigo',
    name: 'Royal Indigo',
    description: 'Modern Premium Tech Hospital',
    primary: '#4f46e5',
    primaryDark: '#4338ca',
    primaryLight: '#eef2ff',
    gradient: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
    previewColor: '#6366f1'
  },
  {
    id: 'teal',
    name: 'Teal Marine',
    description: 'Calm & Professional Medical Teal',
    primary: '#0d9488',
    primaryDark: '#0f766e',
    primaryLight: '#f0fdfa',
    gradient: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
    previewColor: '#14b8a6'
  },
  {
    id: 'rose',
    name: 'Rose Vitality',
    description: 'Warm & Vibrant Care Red',
    primary: '#e11d48',
    primaryDark: '#be123c',
    primaryLight: '#fff1f2',
    gradient: 'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)',
    previewColor: '#f43f5e'
  },
  {
    id: 'purple',
    name: 'Deep Violet',
    description: 'Sophisticated Healthcare Purple',
    primary: '#7c3aed',
    primaryDark: '#6d28d9',
    primaryLight: '#f5f3ff',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
    previewColor: '#8b5cf6'
  },
  {
    id: 'amber',
    name: 'Amber Glow',
    description: 'Energetic & Welcoming Warm Gold',
    primary: '#d97706',
    primaryDark: '#b45309',
    primaryLight: '#fffbeb',
    gradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
    previewColor: '#f59e0b'
  },
  {
    id: 'blue',
    name: 'Ocean Blue',
    description: 'Classic Sky Blue',
    primary: '#0284c7',
    primaryDark: '#0369a1',
    primaryLight: '#e0f2fe',
    gradient: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
    previewColor: '#0ea5e9'
  }
];

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  // Load saved theme or default to Emerald Health (distinct from common default blue)
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('medcare_theme');
    return saved || 'emerald';
  });

  const applyTheme = (themeId) => {
    const theme = THEMES.find((t) => t.id === themeId) || THEMES[0];
    setCurrentTheme(theme.id);
    localStorage.setItem('medcare_theme', theme.id);

    // Apply CSS variables to root document
    const root = document.documentElement;
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--primary-dark', theme.primaryDark);
    root.style.setProperty('--primary-light', theme.primaryLight);
    root.style.setProperty('--primary-gradient', theme.gradient);
  };

  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme: applyTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
