'use client';

import { useAdmin } from './AdminContext';

export default function ToastContainer() {
  const { toasts, removeToast } = useAdmin();

  if (toasts.length === 0) return null;

  return (
    <div className="admin-toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`admin-toast ${toast.type}`}
          role="status"
        >
          <span>{toast.text}</span>
          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-fg-light)',
              cursor: 'pointer',
              padding: '0 0.2rem',
              fontSize: '0.9rem',
              lineHeight: 1,
            }}
            title="Dismiss notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
