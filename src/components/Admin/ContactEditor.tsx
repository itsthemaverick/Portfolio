'use client';

import React, { useState } from 'react';

import { saveContact } from '@/lib/adminApi';
import type { ContactId, ContactItem } from '@/types/admin';
import { useAdmin } from './AdminContext';

const PRESET_ICONS: Record<ContactId, { viewBox: string; path: string }> = {
  linkedin: {
    viewBox: '0 0 448 512',
    path: 'M100.3 448l-92.9 0 0-299.1 92.9 0 0 299.1zM53.8 108.1C24.1 108.1 0 83.5 0 53.8 0 39.5 5.7 25.9 15.8 15.8s23.8-15.8 38-15.8 27.9 5.7 38 15.8 15.8 23.8 15.8 38c0 29.7-24.1 54.3-53.8 54.3zM447.9 448l-92.7 0 0-145.6c0-34.7-.7-79.2-48.3-79.2-48.3 0-55.7 37.7-55.7 76.7l0 148.1-92.8 0 0-299.1 89.1 0 0 40.8 1.3 0c12.4-23.5 42.7-48.3 87.9-48.3 94 0 111.3 61.9 111.3 142.3l0 164.3-.1 0z',
  },
  github: {
    viewBox: '0 0 512 512',
    path: 'M216.5 362.5c-66-8-112.5-55.5-112.5-117 0-25 9-52 24-70-6.5-16.5-5.5-51.5 2-66 20-2.5 47 8 63 22.5 19-6 39-9 63.5-9s44.5 3 62.5 8.5c15.5-14 43-24.5 63-22 7 13.5 8 48.5 1.5 65.5 16 19 24.5 44.5 24.5 70.5 0 61.5-46.5 108-113.5 116.5 17 11 28.5 35 28.5 62.5l0 52C323 491.5 335.5 500 350.5 494 441 459.5 512 369 512 257 512 115.5 397 0 255.5 0S0 115.5 0 257c0 111 70.5 203 165.5 237.5 13.5 5 26.5-4 26.5-17.5l0-40c-7 3-16 5-24 5-33 0-52.5-18-66.5-51.5-5.5-13.5-11.5-21.5-23-23-6-.5-8-3-8-6 0-6 10-10.5 20-10.5 14.5 0 27 9 40 27.5 10 14.5 20.5 21 33 21s20.5-4.5 32-16c8.5-8.5 15-16 21-21z',
  },
  email: {
    viewBox: '0 0 512 512',
    path: 'M61.4 64C27.5 64 0 91.5 0 125.4 0 126.3 0 127.1 .1 128L0 128 0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-256-.1 0c0-.9 .1-1.7 .1-2.6 0-33.9-27.5-61.4-61.4-61.4L61.4 64zM464 192.3L464 384c0 8.8-7.2 16-16 16L64 400c-8.8 0-16-7.2-16-16l0-191.7 154.8 117.4c31.4 23.9 74.9 23.9 106.4 0L464 192.3zM48 125.4C48 118 54 112 61.4 112l389.2 0c7.4 0 13.4 6 13.4 13.4 0 4.2-2 8.2-5.3 10.7L280.2 271.5c-14.3 10.8-34.1 10.8-48.4 0L53.3 136.1c-3.3-2.5-5.3-6.5-5.3-10.7z',
  },
};

export default function ContactEditor() {
  const { data, setData, addToast } = useAdmin();
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    index: number;
    item: ContactItem;
  } | null>(null);

  const contactList = data?.contact || [];

  const handleSaveContact = async (newList: ContactItem[]) => {
    setSaving(true);
    try {
      const res = await saveContact(newList);
      if (res.ok) {
        setData((prev) => (prev ? { ...prev, contact: newList } : prev));
        addToast('success', 'Contact profiles saved to src/data/contact.ts');
        setEditingItem(null);
      } else {
        addToast('error', res.error || 'Failed to save contact profiles.');
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
            <h3 className="admin-card-title">Contact & Social Profiles</h3>
            <p className="admin-card-subtitle">
              Public contact channels and footer social links (
              <code>src/data/contact.ts</code>)
            </p>
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={() =>
              setEditingItem({
                index: -1,
                item: {
                  id: 'linkedin',
                  label: '',
                  link: 'https://',
                  icon: PRESET_ICONS.linkedin,
                },
              })
            }
          >
            + Add Social Link
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {contactList.map((item, idx) => (
            <div key={`${item.id}-${idx}`} className="admin-item-row">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    background: 'var(--color-bg-alt)',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg
                    style={{
                      width: '16px',
                      height: '16px',
                      fill: 'currentColor',
                    }}
                    viewBox={item.icon.viewBox}
                  >
                    <path d={item.icon.path} />
                  </svg>
                </div>
                <div className="admin-item-main">
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span className="admin-item-title">{item.label}</span>
                    <span className="admin-badge">{item.id}</span>
                  </div>
                  <div className="admin-item-meta">
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: 'var(--color-fg-light)' }}
                    >
                      {item.link}
                    </a>
                  </div>
                </div>
              </div>
              <div className="admin-item-actions">
                <button
                  type="button"
                  className="admin-btn admin-btn-sm admin-btn-secondary"
                  onClick={() =>
                    setEditingItem({ index: idx, item: { ...item } })
                  }
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-sm admin-btn-danger"
                  onClick={() => {
                    if (confirm(`Delete ${item.label}?`)) {
                      handleSaveContact(
                        contactList.filter((_, i) => i !== idx),
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

      {editingItem && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {editingItem.index === -1
                  ? 'Add Social Link'
                  : 'Edit Social Link'}
              </h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setEditingItem(null)}
              >
                ✕
              </button>
            </div>
            <div className="admin-modal-body">
              <div
                className="admin-form-group"
                style={{ marginBottom: '1rem' }}
              >
                <label className="admin-label">Profile ID / Platform</label>
                <select
                  className="admin-select"
                  value={editingItem.item.id}
                  onChange={(e) => {
                    const newId = e.target.value as ContactId;
                    setEditingItem({
                      ...editingItem,
                      item: {
                        ...editingItem.item,
                        id: newId,
                        icon: PRESET_ICONS[newId] || editingItem.item.icon,
                      },
                    });
                  }}
                >
                  <option value="linkedin">LinkedIn</option>
                  <option value="github">GitHub</option>
                  <option value="email">Email</option>
                </select>
              </div>

              <div
                className="admin-form-group"
                style={{ marginBottom: '1rem' }}
              >
                <label className="admin-label">Display Label</label>
                <input
                  type="text"
                  className="admin-input"
                  value={editingItem.item.label}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      item: { ...editingItem.item, label: e.target.value },
                    })
                  }
                  placeholder="e.g. LinkedIn"
                  required
                />
              </div>

              <div
                className="admin-form-group"
                style={{ marginBottom: '1rem' }}
              >
                <label className="admin-label">Profile URL / mailto</label>
                <input
                  type="text"
                  className="admin-input mono"
                  value={editingItem.item.link}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      item: { ...editingItem.item, link: e.target.value },
                    })
                  }
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">SVG Path</label>
                <textarea
                  className="admin-textarea mono"
                  rows={3}
                  value={editingItem.item.icon.path}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      item: {
                        ...editingItem.item,
                        icon: {
                          ...editingItem.item.icon,
                          path: e.target.value,
                        },
                      },
                    })
                  }
                  required
                />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setEditingItem(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                disabled={saving}
                onClick={() => {
                  const newArr = [...contactList];
                  if (editingItem.index === -1) {
                    newArr.push(editingItem.item);
                  } else {
                    newArr[editingItem.index] = editingItem.item;
                  }
                  handleSaveContact(newArr);
                }}
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
