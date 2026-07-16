import React from 'react';
import './Input.css';

export default function Input({
  label,
  error,
  hint,
  icon,
  className = '',
  id,
  ...props
}) {
  const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}
      <div className={`input-wrapper ${error ? 'input-error' : ''} ${icon ? 'input-has-icon' : ''}`}>
        {icon && <span className="input-icon">{icon}</span>}
        <input
          id={inputId}
          className="input-field"
          {...props}
        />
      </div>
      {error && <p className="input-error-text">{error}</p>}
      {hint && !error && <p className="input-hint">{hint}</p>}
    </div>
  );
}
