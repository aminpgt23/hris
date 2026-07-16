import React from 'react';
import './Badge.css';

const variants = {
  primary: 'badge-primary',
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  info: 'badge-info',
  neutral: 'badge-neutral',
};

const sizes = {
  sm: 'badge-sm',
  md: 'badge-md',
};

export default function Badge({
  children,
  variant = 'neutral',
  size = 'sm',
  dot = false,
  className = '',
}) {
  const classes = [
    'badge',
    variants[variant] || variants.neutral,
    sizes[size] || sizes.sm,
    dot ? 'badge-dot' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <span className={classes}>
      {dot && <span className="badge-dot-indicator" />}
      {children}
    </span>
  );
}
