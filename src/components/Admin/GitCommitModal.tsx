'use client';

import React, { useEffect, useState } from 'react';

import { commitGitChanges, fetchGitStatus } from '@/lib/adminApi';
import { useAdmin } from './AdminContext';

export default function GitCommitModal() {
  const { isCommitOpen, closeCommitModal, addToast } = useAdmin();
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [branch, setBranch] = useState('main');
  const [changedFiles, setChangedFiles] = useState<string[]>([]);
  const [message, setMessage] = useState(
    'feat(content): update portfolio content via admin dashboard',
  );
  const [pushToRemote, setPushToRemote] = useState(false);
  const [commitResult, setCommitResult] = useState<string | null>(null);

  useEffect(() => {
    if (isCommitOpen) {
      setLoadingStatus(true);
      fetchGitStatus()
        .then((res) => {
          if (res.ok) {
            setBranch(res.branch || 'main');
            setChangedFiles(res.changedFiles || []);
          }
        })
        .finally(() => setLoadingStatus(false));
    }
  }, [isCommitOpen]);

  if (!isCommitOpen) return null;

  const handleCommit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      addToast('error', 'Commit message is required.');
      return;
    }

    setCommitting(true);
    setCommitResult(null);
    try {
      const res = await commitGitChanges(message, pushToRemote);
      if (res.ok) {
        addToast('success', 'Changes committed successfully.');
        setCommitResult(
          `✓ Successfully committed changes:\n${res.commit || ''}\n${res.push ? `✓ Remote push completed` : ''}`,
        );
        // Refresh git status
        const status = await fetchGitStatus();
        if (status.ok) {
          setChangedFiles(status.changedFiles || []);
        }
      } else {
        addToast('error', res.error || 'Git commit failed.');
        setCommitResult(`✗ Commit error: ${res.error}`);
      }
    } catch (err) {
      addToast('error', `Git commit failed: ${String(err)}`);
    } finally {
      setCommitting(false);
    }
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal">
        <div className="admin-modal-header">
          <div>
            <h3 className="admin-modal-title">Save & Commit to Git</h3>
            <p
              className="admin-card-subtitle"
              style={{ margin: '0.2rem 0 0 0' }}
            >
              Branch: <code>{branch}</code> · Staged data changes
            </p>
          </div>
          <button
            type="button"
            className="admin-modal-close"
            onClick={closeCommitModal}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleCommit}>
          <div className="admin-modal-body">
            {/* Changed Files */}
            <div
              className="admin-form-group"
              style={{ marginBottom: '1.25rem' }}
            >
              <label className="admin-label">
                Modified & Untracked Files ({changedFiles.length})
                {loadingStatus && <span>Checking...</span>}
              </label>
              <div
                style={{
                  background: 'var(--color-bg-alt)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  padding: '0.75rem',
                  maxHeight: '130px',
                  overflowY: 'auto',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                }}
              >
                {changedFiles.length === 0 ? (
                  <span style={{ color: 'var(--color-fg-light)' }}>
                    Clean working tree. No uncommitted modifications.
                  </span>
                ) : (
                  changedFiles.map((file, i) => (
                    <div
                      key={`file-${i}`}
                      style={{ color: 'var(--color-fg-bold)' }}
                    >
                      {file}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Commit Message */}
            <div
              className="admin-form-group"
              style={{ marginBottom: '1.25rem' }}
            >
              <label className="admin-label">Conventional Commit Message</label>
              <input
                type="text"
                className="admin-input mono"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="feat(content): update portfolio entries"
                required
              />
              <div
                style={{
                  display: 'flex',
                  gap: '0.4rem',
                  marginTop: '0.4rem',
                  flexWrap: 'wrap',
                }}
              >
                {[
                  'feat(content): update profile & bio',
                  'feat(projects): add new shipped project',
                  'feat(writing): publish new blog post',
                  'fix(resume): update experience highlights',
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setMessage(preset)}
                    className="admin-btn admin-btn-sm admin-btn-secondary"
                    style={{ fontSize: '0.7rem' }}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Push Checkbox */}
            <div className="admin-form-group">
              <label className="admin-toggle-label">
                <input
                  type="checkbox"
                  className="admin-toggle-input"
                  checked={pushToRemote}
                  onChange={(e) => setPushToRemote(e.target.checked)}
                />
                <span>Also push to remote repository (git push)</span>
              </label>
            </div>

            {commitResult && (
              <div
                style={{
                  marginTop: '1rem',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  background: 'var(--color-bg-alt)',
                  border: '1px solid var(--color-border)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {commitResult}
              </div>
            )}
          </div>

          <div className="admin-modal-footer">
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={closeCommitModal}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={committing || changedFiles.length === 0}
            >
              {committing ? 'Committing...' : 'Commit Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
