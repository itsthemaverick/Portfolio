'use client';

import { useState } from 'react';

import { saveSpeaking } from '@/lib/adminApi';
import type { Appearance, AppearanceFormat } from '@/types/admin';
import { useAdmin } from './AdminContext';

export default function SpeakingEditor() {
  const { data, setData, addToast } = useAdmin();
  const [saving, setSaving] = useState(false);
  const [editingAppearance, setEditingAppearance] = useState<{
    index: number;
    item: Appearance;
  } | null>(null);

  const appearances = data?.speaking || [];

  const handleSaveAppearances = async (newAppearances: Appearance[]) => {
    setSaving(true);
    try {
      const res = await saveSpeaking(newAppearances);
      if (res.ok) {
        setData((prev) =>
          prev ? { ...prev, speaking: newAppearances } : prev,
        );
        addToast('success', 'Appearances saved to src/data/speaking.ts');
        setEditingAppearance(null);
      } else {
        addToast('error', res.error || 'Failed to save appearances.');
      }
    } catch (err) {
      addToast('error', `Save error: ${String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-section-container">
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">Speaking & Appearances</h3>
            <p className="admin-card-subtitle">
              Public presentations, hackathon pitches, and competition demos (
              <code>src/data/speaking.ts</code>)
            </p>
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={() =>
              setEditingAppearance({
                index: -1,
                item: {
                  title: '',
                  format: 'Tech session',
                  date: new Date().toISOString().slice(0, 10),
                  place: 'Pune',
                  desc: '',
                  link: 'https://',
                },
              })
            }
          >
            + Add Appearance
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {appearances.map((item, idx) => (
            <div key={`${item.title}-${idx}`} className="admin-item-row">
              <div className="admin-item-main">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span className="admin-item-title">{item.title}</span>
                  <span className="admin-badge">{item.format}</span>
                </div>
                <div className="admin-item-meta">
                  <span>{item.date}</span>
                  <span>·</span>
                  <span>{item.place}</span>
                  <span>·</span>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'var(--color-fg-light)' }}
                  >
                    Event Link
                  </a>
                </div>
                <p
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--color-fg)',
                    margin: '0.25rem 0 0 0',
                  }}
                >
                  {item.desc}
                </p>
              </div>
              <div className="admin-item-actions">
                <button
                  type="button"
                  className="admin-btn admin-btn-sm admin-btn-secondary"
                  onClick={() =>
                    setEditingAppearance({ index: idx, item: { ...item } })
                  }
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-sm admin-btn-danger"
                  onClick={() => {
                    if (confirm(`Delete appearance "${item.title}"?`)) {
                      handleSaveAppearances(
                        appearances.filter((_, i) => i !== idx),
                      );
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editingAppearance && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {editingAppearance.index === -1
                  ? 'Add Appearance'
                  : 'Edit Appearance'}
              </h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setEditingAppearance(null)}
              >
                ✕
              </button>
            </div>
            <div className="admin-modal-body">
              <div
                className="admin-form-group"
                style={{ marginBottom: '1rem' }}
              >
                <label className="admin-label">Title / Event Name</label>
                <input
                  type="text"
                  className="admin-input"
                  value={editingAppearance.item.title}
                  onChange={(e) =>
                    setEditingAppearance({
                      ...editingAppearance,
                      item: {
                        ...editingAppearance.item,
                        title: e.target.value,
                      },
                    })
                  }
                  required
                />
              </div>

              <div
                className="admin-form-group"
                style={{ marginBottom: '1rem' }}
              >
                <label className="admin-label">Format</label>
                <select
                  className="admin-select"
                  value={editingAppearance.item.format}
                  onChange={(e) =>
                    setEditingAppearance({
                      ...editingAppearance,
                      item: {
                        ...editingAppearance.item,
                        format: e.target.value as AppearanceFormat,
                      },
                    })
                  }
                >
                  <option value="Tech session">Tech session</option>
                  <option value="Panel">Panel</option>
                  <option value="Arsenal Lab">Arsenal Lab</option>
                  <option value="Pitch">Pitch</option>
                </select>
              </div>

              <div
                className="admin-form-group"
                style={{ marginBottom: '1rem' }}
              >
                <label className="admin-label">Date (YYYY-MM-DD)</label>
                <input
                  type="date"
                  className="admin-input mono"
                  value={editingAppearance.item.date}
                  onChange={(e) =>
                    setEditingAppearance({
                      ...editingAppearance,
                      item: { ...editingAppearance.item, date: e.target.value },
                    })
                  }
                  required
                />
              </div>

              <div
                className="admin-form-group"
                style={{ marginBottom: '1rem' }}
              >
                <label className="admin-label">Location / City</label>
                <input
                  type="text"
                  className="admin-input"
                  value={editingAppearance.item.place}
                  onChange={(e) =>
                    setEditingAppearance({
                      ...editingAppearance,
                      item: {
                        ...editingAppearance.item,
                        place: e.target.value,
                      },
                    })
                  }
                  required
                />
              </div>

              <div
                className="admin-form-group"
                style={{ marginBottom: '1rem' }}
              >
                <label className="admin-label">Public Link (URL)</label>
                <input
                  type="url"
                  className="admin-input mono"
                  value={editingAppearance.item.link}
                  onChange={(e) =>
                    setEditingAppearance({
                      ...editingAppearance,
                      item: { ...editingAppearance.item, link: e.target.value },
                    })
                  }
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Description / Highlights</label>
                <textarea
                  className="admin-textarea"
                  rows={3}
                  value={editingAppearance.item.desc}
                  onChange={(e) =>
                    setEditingAppearance({
                      ...editingAppearance,
                      item: { ...editingAppearance.item, desc: e.target.value },
                    })
                  }
                  placeholder="Details of topic, awards, or presentation..."
                  required
                />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setEditingAppearance(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                disabled={saving}
                onClick={() => {
                  const newArr = [...appearances];
                  if (editingAppearance.index === -1) {
                    newArr.unshift(editingAppearance.item);
                  } else {
                    newArr[editingAppearance.index] = editingAppearance.item;
                  }
                  handleSaveAppearances(newArr);
                }}
              >
                Save Appearance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
