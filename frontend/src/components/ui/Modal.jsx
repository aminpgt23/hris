import React, { useEffect, useRef } from 'react';
import './Modal.css';
import CloseIcon from '@mui/icons-material/Close';

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && open) onClose?.();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const sizes = { sm: 'modal-sm', md: 'modal-md', lg: 'modal-lg', xl: 'modal-xl' };

  return (
    <div className="modal-overlay" ref={overlayRef} onClick={(e) => {
      if (e.target === overlayRef.current) onClose?.();
    }}>
      <div className={`modal-content ${sizes[size] || sizes.md}`}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
