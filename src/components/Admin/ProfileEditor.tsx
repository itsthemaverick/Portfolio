'use client';

import React, { useRef, useState } from 'react';

import { saveProfile, uploadPortrait } from '@/lib/adminApi';
import type { ProfileData } from '@/types/admin';
import { useAdmin } from './AdminContext';

export default function ProfileEditor() {
  const { data, setData, addToast } = useAdmin();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  }>({
    width: 863,
    height: 864,
  });

  const profile = data?.profile;

  if (!profile) {
    return (
      <div className="admin-card">
        <p>Loading profile data...</p>
      </div>
    );
  }

  const handleChange = (field: keyof ProfileData, value: string | number) => {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        profile: {
          ...prev.profile,
          [field]: value,
        },
      };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await saveProfile(profile);
      if (res.ok) {
        addToast('success', 'Profile settings saved to src/data/profile.json');
      } else {
        addToast('error', res.error || 'Failed to save profile');
      }
    } catch (err) {
      addToast('error', `Error saving profile: ${String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('error', 'Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    setUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await uploadPortrait(base64);
        if (res.ok) {
          if (res.width && res.height) {
            setImageDimensions({ width: res.width, height: res.height });
          }
          addToast(
            'success',
            `Portrait uploaded to public/images/me.jpg and auto-synced to SITE_IMAGE_DIMENSIONS (${res.width}x${res.height})`,
          );
        } else {
          addToast('error', res.error || 'Failed to upload portrait image.');
        }
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      addToast('error', `Image upload error: ${String(err)}`);
      setUploadingImage(false);
    }
  };

  return (
    <div className="admin-section-container">
      <form onSubmit={handleSave}>
        {/* Profile Details Card */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">Identity & Role</h3>
              <p className="admin-card-subtitle">
                Core identity facts configured in{' '}
                <code>src/data/profile.json</code>
              </p>
            </div>
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>

          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label htmlFor="profile-name" className="admin-label">
                Full Name
              </label>
              <input
                id="profile-name"
                type="text"
                className="admin-input"
                value={profile.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g. Yashraj Bhogade"
                required
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="profile-role" className="admin-label">
                Professional Role
              </label>
              <input
                id="profile-role"
                type="text"
                className="admin-input"
                value={profile.role}
                onChange={(e) => handleChange('role', e.target.value)}
                placeholder="e.g. AI & Machine Learning Engineer"
                required
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="profile-employer" className="admin-label">
                Employer / Affiliation
              </label>
              <input
                id="profile-employer"
                type="text"
                className="admin-input"
                value={profile.employer}
                onChange={(e) => handleChange('employer', e.target.value)}
                placeholder="e.g. SprougHub Foundation"
                required
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="profile-email" className="admin-label">
                Contact Email
              </label>
              <input
                id="profile-email"
                type="email"
                className="admin-input"
                value={profile.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="e.g. yashrajbhogadepatil@gmail.com"
                required
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="profile-city" className="admin-label">
                Current City
              </label>
              <input
                id="profile-city"
                type="text"
                className="admin-input"
                value={profile.currentCity}
                onChange={(e) => handleChange('currentCity', e.target.value)}
                placeholder="e.g. Pune"
                required
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="profile-birthdate" className="admin-label">
                Birth Date (ISO 8601)
              </label>
              <input
                id="profile-birthdate"
                type="text"
                className="admin-input mono"
                value={profile.birthDate}
                onChange={(e) => handleChange('birthDate', e.target.value)}
                placeholder="2007-07-05T00:00:00+05:30"
                required
              />
              <span className="admin-help-text">
                Used to drive the live age computation on the stats page
              </span>
            </div>

            <div className="admin-form-group">
              <label htmlFor="profile-computing" className="admin-label">
                Computing Since (Year)
              </label>
              <input
                id="profile-computing"
                type="number"
                className="admin-input mono"
                value={profile.computingSince}
                onChange={(e) =>
                  handleChange('computingSince', parseInt(e.target.value, 10))
                }
                required
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="profile-countries" className="admin-label">
                Countries Visited
              </label>
              <input
                id="profile-countries"
                type="number"
                className="admin-input mono"
                value={profile.countriesVisited}
                onChange={(e) =>
                  handleChange('countriesVisited', parseInt(e.target.value, 10))
                }
                required
              />
            </div>

            <div className="admin-form-group full-width">
              <label htmlFor="profile-focus" className="admin-label">
                Focus Area & Research Statement
              </label>
              <textarea
                id="profile-focus"
                className="admin-textarea"
                rows={3}
                value={profile.focus}
                onChange={(e) => handleChange('focus', e.target.value)}
                placeholder="Machine learning, agentic workflows, and neural architectures"
                required
              />
            </div>
          </div>
        </div>

        {/* Portrait Image Uploader Card */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">Portrait Photo (me.jpg)</h3>
              <p className="admin-card-subtitle">
                Target: <code>public/images/me.jpg</code> · Auto-synchronizes{' '}
                <code>SITE_IMAGE_DIMENSIONS</code> in{' '}
                <code>src/lib/utils.ts</code>
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1.5rem',
              alignItems: 'center',
            }}
          >
            <div className="admin-preview-box" style={{ flex: '0 0 auto' }}>
              {/* biome-ignore lint/performance/noImgElement: local file preview */}
              <img
                src="/images/me.jpg"
                alt="Portrait preview"
                className="admin-preview-img"
                style={{ width: '100px', height: '100px' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23333" width="100" height="100"/><text fill="%23fff" x="50%" y="50%" text-anchor="middle" dy=".3em">No Photo</text></svg>';
                }}
              />
              <div className="admin-preview-meta">
                <span style={{ fontWeight: 600 }}>Active Portrait</span>
                <span>File: public/images/me.jpg</span>
                <span>
                  Dimensions: {imageDimensions.width} × {imageDimensions.height}{' '}
                  px
                </span>
                <span style={{ color: '#4ade80' }}>
                  ✓ In sync with SITE_IMAGE_DIMENSIONS
                </span>
              </div>
            </div>

            <div style={{ flex: '1 1 300px' }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={handleImageFileChange}
              />
              <div
                className="admin-dropzone"
                onClick={() => fileInputRef.current?.click()}
              >
                <svg
                  className="admin-dropzone-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  {uploadingImage
                    ? 'Processing & Measuring...'
                    : 'Click to Choose New Portrait Photo'}
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--color-fg-light)',
                  }}
                >
                  Supports JPEG, PNG, WebP (Overwrites me.jpg and updates
                  dimensions)
                </span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
