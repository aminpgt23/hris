import React from 'react';
import './Card.css';

export default function Card({
  children,
  title,
  subtitle,
  action,
  className = '',
  padding = true,
  hover = false,
  ...props
}) {
  const classes = [
    'card',
    hover ? 'card-hover' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {(title || action) && (
        <div className="card-header">
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {action && <div className="card-action">{action}</div>}
        </div>
      )}
      <div className={padding ? 'card-body' : ''}>
        {children}
      </div>
    </div>
  );
}
