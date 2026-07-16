import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

const ToastContext = createContext(null);

let nextId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((type, message, duration = 3500) => {
    const id = ++nextId;
    setToasts(prev => [...prev, { id, type, message }]);
    timers.current[id] = setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  const toast = addToast;
  toast.success = (msg, dur) => addToast('success', msg, dur);
  toast.error   = (msg, dur) => addToast('error', msg, dur);
  toast.info    = (msg, dur) => addToast('info', msg, dur);
  toast.warning = (msg, dur) => addToast('warning', msg, dur);

  useEffect(() => {
    const t = timers.current;
    return () => { Object.values(t).forEach(clearTimeout); };
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`} onClick={() => dismiss(t.id)}>
            <span className="toast-icon">
              {t.type === 'success' ? '\u2713' : t.type === 'error' ? '\u2715' : t.type === 'warning' ? '\u26A0' : '\u2139'}
            </span>
            <span className="toast-message">{t.message}</span>
            <button className="toast-close" onClick={e => { e.stopPropagation(); dismiss(t.id); }}>&times;</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export default ToastContext;
