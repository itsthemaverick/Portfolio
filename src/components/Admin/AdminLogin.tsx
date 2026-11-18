'use client';

import React, { useState } from 'react';

import { useAdmin } from './AdminContext';

interface AdminLoginProps {
  standalone?: boolean;
}

export default function AdminLogin({ standalone = false }: AdminLoginProps) {
  const { login, isLoading, serverOnline } = useAdmin();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!password.trim()) {
      setError('Password is required.');
      return;
    }

    const res = await login(password);
    if (!res.ok) {
      setError(res.error || 'Authentication failed. Please check password.');
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-login-monogram">YB</div>
          <h1 className="admin-login-title">Portfolio Admin</h1>
          <p className="admin-login-subtitle">
            Secure administrative control center for content & assets
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '1.25rem',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            color: serverOnline ? '#4ade80' : 'var(--color-signal)',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: serverOnline ? '#2e7d32' : 'var(--color-signal)',
              display: 'inline-block',
            }}
          />
          {serverOnline
            ? 'Local Companion Server: Online (Port 3001)'
            : 'Companion Server: Checking / Offline (Run: npm run admin)'}
        </div>

        {error && <div className="admin-login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-form-group">
            <label htmlFor="admin-password" className="admin-label">
              Admin Password
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-fg-light)',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </label>
            <input
              id="admin-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password (default: admin123)"
              className="admin-input"
              autoFocus
              required
            />
          </div>

          <button
            type="submit"
            className="admin-login-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div
          style={{
            marginTop: '1.75rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--color-border)',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: 'var(--color-fg-light)',
          }}
        >
          <p style={{ margin: 0 }}>
            Configured via <code>ADMIN_PASSWORD</code> in{' '}
            <code>.env.local</code>
          </p>
        </div>
      </div>
    </div>
  );
}
