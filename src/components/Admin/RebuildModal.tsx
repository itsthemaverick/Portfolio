'use client';

import { useState } from 'react';

import { triggerRebuild } from '@/lib/adminApi';
import { useAdmin } from './AdminContext';

export default function RebuildModal() {
  const { isRebuildOpen, closeRebuildModal, addToast } = useAdmin();
  const [runningTask, setRunningTask] = useState<string | null>(null);
  const [terminalLogs, setTerminalLogs] = useState<string>('');

  if (!isRebuildOpen) return null;

  const handleRun = async (action: 'icons' | 'og' | 'build') => {
    setRunningTask(action);
    setTerminalLogs((prev) => `${prev}\n> Running npm run ${action}...\n`);
    try {
      const res = await triggerRebuild(action);
      let output = '';
      if (res.stdout) output += `${res.stdout}\n`;
      if (res.stderr) output += `${res.stderr}\n`;

      if (res.ok) {
        output += `✓ Completed "npm run ${action}" with exit code 0\n`;
        addToast('success', `npm run ${action} succeeded.`);
      } else {
        output += `✗ Failed "npm run ${action}" with exit code ${res.exitCode}\n`;
        addToast('error', `npm run ${action} failed. Check terminal log.`);
      }
      setTerminalLogs((prev) => `${prev}${output}\n`);
    } catch (err) {
      setTerminalLogs(
        (prev) => `${prev}✗ Error triggering rebuild: ${String(err)}\n`,
      );
      addToast('error', `Execution error: ${String(err)}`);
    } finally {
      setRunningTask(null);
    }
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal wide">
        <div className="admin-modal-header">
          <div>
            <h3 className="admin-modal-title">Automated Asset Rebuilding</h3>
            <p
              className="admin-card-subtitle"
              style={{ margin: '0.2rem 0 0 0' }}
            >
              Execute static asset generators and validate production export
            </p>
          </div>
          <button
            type="button"
            className="admin-modal-close"
            onClick={closeRebuildModal}
          >
            ✕
          </button>
        </div>

        <div className="admin-modal-body">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            {/* Task 1: Icons */}
            <div
              style={{
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                padding: '1rem',
                background: 'var(--color-bg-alt)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                Regenerate Icons
              </span>
              <span
                style={{ fontSize: '0.75rem', color: 'var(--color-fg-light)' }}
              >
                Rebuilds <code>app/favicon.ico</code>, <code>icon.png</code>,
                and PNG sets from colour tokens.
              </span>
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                disabled={Boolean(runningTask)}
                onClick={() => handleRun('icons')}
                style={{ marginTop: 'auto' }}
              >
                {runningTask === 'icons' ? 'Running...' : 'Run npm run icons'}
              </button>
            </div>

            {/* Task 2: OG Cards */}
            <div
              style={{
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                padding: '1rem',
                background: 'var(--color-bg-alt)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                Render OG Share Cards
              </span>
              <span
                style={{ fontSize: '0.75rem', color: 'var(--color-fg-light)' }}
              >
                Renders 1200x630 cards for site and all published posts,
                updating <code>og.meta.json</code>.
              </span>
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                disabled={Boolean(runningTask)}
                onClick={() => handleRun('og')}
                style={{ marginTop: 'auto' }}
              >
                {runningTask === 'og' ? 'Running...' : 'Run npm run og'}
              </button>
            </div>

            {/* Task 3: Build & Export */}
            <div
              style={{
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                padding: '1rem',
                background: 'var(--color-bg-alt)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                Validate Static Export
              </span>
              <span
                style={{ fontSize: '0.75rem', color: 'var(--color-fg-light)' }}
              >
                Runs <code>next build --webpack</code> to verify that static
                export succeeds without errors.
              </span>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                disabled={Boolean(runningTask)}
                onClick={() => handleRun('build')}
                style={{ marginTop: 'auto' }}
              >
                {runningTask === 'build' ? 'Building...' : 'Run npm run build'}
              </button>
            </div>
          </div>

          <div className="admin-form-group">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.4rem',
              }}
            >
              <span className="admin-label">
                Console & Process Terminal Output
              </span>
              {terminalLogs && (
                <button
                  type="button"
                  onClick={() => setTerminalLogs('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '0.75rem',
                    color: 'var(--color-fg-light)',
                    cursor: 'pointer',
                  }}
                >
                  Clear Terminal
                </button>
              )}
            </div>
            <div className="admin-terminal">
              {terminalLogs ||
                'Ready. Click one of the tasks above to run it in the workspace.'}
            </div>
          </div>
        </div>

        <div className="admin-modal-footer">
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={closeRebuildModal}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
