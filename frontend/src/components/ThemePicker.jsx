import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Palette, Check, Sparkles } from 'lucide-react';
import './ThemePicker.css';

const ThemePicker = () => {
  const { currentTheme, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const activeThemeObj = themes.find((t) => t.id === currentTheme) || themes[0];

  return (
    <div className="theme-picker-wrapper">
      <button
        type="button"
        className="theme-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Customize App Theme / Colors"
      >
        <span
          className="theme-color-dot"
          style={{ backgroundColor: activeThemeObj.previewColor }}
        />
        <Palette size={16} />
        <span className="theme-btn-text">{activeThemeObj.name}</span>
      </button>

      {isOpen && (
        <div className="theme-popup-menu">
          <div className="theme-popup-header">
            <div className="popup-title">
              <Sparkles size={14} />
              <span>Choose App Color Theme</span>
            </div>
            <small>Personalize your project look</small>
          </div>

          <div className="theme-options-list">
            {themes.map((theme) => {
              const isSelected = theme.id === currentTheme;
              return (
                <button
                  key={theme.id}
                  type="button"
                  className={`theme-option-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    setTheme(theme.id);
                    setIsOpen(false);
                  }}
                >
                  <div className="theme-preview-swatch" style={{ background: theme.gradient }} />
                  <div className="theme-info-text">
                    <span className="theme-name">{theme.name}</span>
                    <span className="theme-desc">{theme.description}</span>
                  </div>
                  {isSelected && <Check size={16} className="check-icon" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemePicker;
