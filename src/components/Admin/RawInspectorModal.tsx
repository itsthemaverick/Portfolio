'use client';

import React, { useState } from 'react';

import { useAdmin } from './AdminContext';

export default function RawInspectorModal() {
  const { inspectorPayload, closeInspector, addToast } = useAdmin();
  const [copied, setCopied] = useState(false);

  if (!inspectorPayload) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inspectorPayload.content);
      setCopied(true);
      addToast('info', 'Payload copied to clipboard.');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast('error', 'Failed to copy to clipboard.');
    }
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal wide">
        <div className="admin-modal-header">
          <div>
            <h3 className="admin-modal-title">{inspectorPayload.title}</h3>
            <p
              className="admin-card-subtitle"
              style={{ margin: '0.2rem 0 0 0' }}
            >
              Live generated code / markdown payload before persisting
            </p>
          </div>
          <button
            type="button"
            className="admin-modal-close"
            onClick={closeInspector}
          >
            ✕
          </button>
        </div>

        <div className="admin-modal-body">
          <textarea
            readOnly
            className="admin-textarea mono"
            style={{ height: '420px', width: '100%', fontSize: '0.8rem' }}
            value={inspectorPayload.content}
          />
        </div>

        <div className="admin-modal-footer">
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={handleCopy}
          >
            {copied ? '✓ Copied!' : 'Copy to Clipboard'}
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={closeInspector}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
