'use client';

import React, { useRef, useState } from 'react';

import { saveProjects, uploadProjectScreenshot } from '@/lib/adminApi';
import type { Project, ProjectStatus } from '@/types/admin';
import { useAdmin } from './AdminContext';

export default function ProjectsEditor() {
  const { data, setData, addToast } = useAdmin();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<ProjectStatus>('shipped');
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingProject, setEditingProject] = useState<{
    index: number;
    item: Project;
  } | null>(null);

  const projects = data?.projects || [];
  const workPositions = data?.work || [];

  const displayedProjects = projects.filter((p) => p.status === activeTab);

  const handleSaveProjects = async (newProjects: Project[]) => {
    // Inline validation against rules in projects.test.ts
    const titles = new Set<string>();
    for (const p of newProjects) {
      if (titles.has(p.title)) {
        addToast(
          'error',
          `Duplicate project title: "${p.title}". Titles must be unique.`,
        );
        return;
      }
      titles.add(p.title);

      if (p.ongoing && p.endDate) {
        addToast(
          'error',
          `Project "${p.title}" cannot be marked ongoing and have an end date.`,
        );
        return;
      }

      if (p.endDate && Date.parse(p.endDate) <= Date.parse(p.date)) {
        addToast(
          'error',
          `Project "${p.title}": End date must be after start date.`,
        );
        return;
      }
    }

    setSaving(true);
    try {
      const res = await saveProjects(newProjects);
      if (res.ok) {
        setData((prev) => (prev ? { ...prev, projects: newProjects } : prev));
        addToast(
          'success',
          'Projects register updated in src/data/projects.ts',
        );
        setEditingProject(null);
      } else {
        addToast('error', res.error || 'Failed to save projects.');
      }
    } catch (err) {
      addToast('error', `Save error: ${String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleScreenshotUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !editingProject) return;

    setUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const filename = `${editingProject.item.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;
        const res = await uploadProjectScreenshot(filename, base64);
        if (res.ok && res.path) {
          setEditingProject({
            ...editingProject,
            item: { ...editingProject.item, image: res.path },
          });
          addToast('success', `Screenshot saved to public${res.path}`);
        } else {
          addToast('error', res.error || 'Failed to upload screenshot');
        }
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      addToast('error', `Screenshot error: ${String(err)}`);
      setUploadingImage(false);
    }
  };

  return (
    <div className="admin-section-container">
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">Projects Register</h3>
            <p className="admin-card-subtitle">
              Manage production work (shipped) and experimental prototypes
              (archive)
            </p>
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={() =>
              setEditingProject({
                index: -1,
                item: {
                  title: '',
                  subtitle: '',
                  link: 'https://',
                  date: new Date().toISOString().slice(0, 10),
                  desc: '',
                  tech: [],
                  status: activeTab,
                  ongoing: false,
                },
              })
            }
          >
            + Add{' '}
            {activeTab === 'shipped' ? 'Shipped Project' : 'Archive Entry'}
          </button>
        </div>

        {/* Shipped vs Archive Tabs */}
        <div className="admin-tabs">
          <button
            type="button"
            className={`admin-tab ${activeTab === 'shipped' ? 'active' : ''}`}
            onClick={() => setActiveTab('shipped')}
          >
            Shipped Production Work (
            {projects.filter((p) => p.status === 'shipped').length})
          </button>
          <button
            type="button"
            className={`admin-tab ${activeTab === 'archive' ? 'active' : ''}`}
            onClick={() => setActiveTab('archive')}
          >
            Archive & Experiments (
            {projects.filter((p) => p.status === 'archive').length})
          </button>
        </div>

        {/* Project Entries List */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {displayedProjects.map((project, idx) => {
            const actualIndex = projects.findIndex(
              (p) => p.title === project.title,
            );
            return (
              <div key={`${project.title}-${idx}`} className="admin-item-row">
                <div className="admin-item-main">
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span className="admin-item-title">{project.title}</span>
                    {project.subtitle && (
                      <span
                        style={{
                          fontSize: '0.8rem',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--color-fg-light)',
                        }}
                      >
                        · {project.subtitle}
                      </span>
                    )}
                    {project.ongoing && (
                      <span className="admin-badge active">Ongoing</span>
                    )}
                    <span
                      className={`admin-badge ${project.status === 'shipped' ? 'shipped' : 'archive'}`}
                    >
                      {project.status}
                    </span>
                  </div>
                  <div className="admin-item-meta">
                    <span>
                      {project.date}
                      {project.endDate ? ` — ${project.endDate}` : ''}
                    </span>
                    {project.tech && project.tech.length > 0 && (
                      <>
                        <span>·</span>
                        <span>{project.tech.join(', ')}</span>
                      </>
                    )}
                    {project.link && (
                      <>
                        <span>·</span>
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: 'var(--color-fg-light)' }}
                        >
                          Live Link
                        </a>
                      </>
                    )}
                  </div>
                  <p
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--color-fg)',
                      margin: '0.35rem 0 0 0',
                    }}
                  >
                    {project.desc}
                  </p>
                </div>
                <div className="admin-item-actions">
                  <button
                    type="button"
                    className="admin-btn admin-btn-sm admin-btn-secondary"
                    onClick={() =>
                      setEditingProject({
                        index: actualIndex,
                        item: { ...project },
                      })
                    }
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn-sm admin-btn-danger"
                    onClick={() => {
                      if (confirm(`Delete project "${project.title}"?`)) {
                        const updated = projects.filter(
                          (_, i) => i !== actualIndex,
                        );
                        handleSaveProjects(updated);
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Project Modal */}
      {editingProject && (
        <div className="admin-modal-overlay">
          <div className="admin-modal wide">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {editingProject.index === -1 ? 'Add Project' : 'Edit Project'}
              </h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setEditingProject(null)}
              >
                ✕
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label className="admin-label">Title (Must be unique)</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={editingProject.item.title}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        item: { ...editingProject.item, title: e.target.value },
                      })
                    }
                    placeholder="e.g. Neural Network from Scratch in C"
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">Subtitle / Venue / Role</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={editingProject.item.subtitle || ''}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        item: {
                          ...editingProject.item,
                          subtitle: e.target.value || undefined,
                        },
                      })
                    }
                    placeholder="e.g. Machine learning in C"
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">Status Category</label>
                  <select
                    className="admin-select"
                    value={editingProject.item.status}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        item: {
                          ...editingProject.item,
                          status: e.target.value as ProjectStatus,
                        },
                      })
                    }
                  >
                    <option value="shipped">Shipped (Production)</option>
                    <option value="archive">
                      Archive (Experiments/Hackathons)
                    </option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">Public Link (HTTPS)</label>
                  <input
                    type="url"
                    className="admin-input mono"
                    value={editingProject.item.link || ''}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        item: {
                          ...editingProject.item,
                          link: e.target.value || undefined,
                        },
                      })
                    }
                    placeholder="https://..."
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">
                    Source Repository (HTTPS)
                  </label>
                  <input
                    type="url"
                    className="admin-input mono"
                    value={editingProject.item.sourceRepository || ''}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        item: {
                          ...editingProject.item,
                          sourceRepository: e.target.value || undefined,
                        },
                      })
                    }
                    placeholder="https://github.com/..."
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">
                    Linked Résumé Role (sourceWork)
                  </label>
                  <select
                    className="admin-select"
                    value={editingProject.item.sourceWork || ''}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        item: {
                          ...editingProject.item,
                          sourceWork: e.target.value || undefined,
                        },
                      })
                    }
                  >
                    <option value="">None (Personal Project)</option>
                    {workPositions.map((w) => (
                      <option key={w.name} value={w.name}>
                        {w.name} ({w.position})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">Start Date (YYYY-MM-DD)</label>
                  <input
                    type="date"
                    className="admin-input mono"
                    value={editingProject.item.date}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        item: { ...editingProject.item, date: e.target.value },
                      })
                    }
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">
                    End Date (Omit if one-off or ongoing)
                  </label>
                  <input
                    type="date"
                    className="admin-input mono"
                    disabled={editingProject.item.ongoing}
                    value={editingProject.item.endDate || ''}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        item: {
                          ...editingProject.item,
                          endDate: e.target.value || undefined,
                        },
                      })
                    }
                  />
                </div>

                <div
                  className="admin-form-group"
                  style={{ justifyContent: 'center' }}
                >
                  <label className="admin-toggle-label">
                    <input
                      type="checkbox"
                      className="admin-toggle-input"
                      checked={Boolean(editingProject.item.ongoing)}
                      onChange={(e) => {
                        const isOngoing = e.target.checked;
                        setEditingProject({
                          ...editingProject,
                          item: {
                            ...editingProject.item,
                            ongoing: isOngoing ? true : undefined,
                            endDate: isOngoing
                              ? undefined
                              : editingProject.item.endDate,
                          },
                        });
                      }}
                    />
                    <span>
                      Project is actively ongoing (mutually exclusive with End
                      Date)
                    </span>
                  </label>
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">
                    Technologies (comma-separated)
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    value={(editingProject.item.tech || []).join(', ')}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        item: {
                          ...editingProject.item,
                          tech: e.target.value
                            .split(',')
                            .map((t) => t.trim())
                            .filter(Boolean),
                        },
                      })
                    }
                    placeholder="Python, PyTorch, C, Next.js"
                  />
                </div>

                <div className="admin-form-group full-width">
                  <label className="admin-label">
                    Description (Markdown supported)
                  </label>
                  <textarea
                    className="admin-textarea"
                    rows={4}
                    value={editingProject.item.desc}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        item: { ...editingProject.item, desc: e.target.value },
                      })
                    }
                    placeholder="Summary of architecture, impact, and engineering accomplishments..."
                    required
                  />
                </div>

                <div className="admin-form-group full-width">
                  <label className="admin-label">
                    Screenshot Image (public/images/projects/)
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      alignItems: 'center',
                    }}
                  >
                    <input
                      type="text"
                      className="admin-input mono"
                      style={{ flex: 1 }}
                      value={editingProject.item.image || ''}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          item: {
                            ...editingProject.item,
                            image: e.target.value || undefined,
                          },
                        })
                      }
                      placeholder="/images/projects/project-name.png"
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      style={{ display: 'none' }}
                      onChange={handleScreenshotUpload}
                    />
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploadingImage ? 'Uploading...' : 'Upload File'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setEditingProject(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                disabled={saving}
                onClick={() => {
                  const newProjects = [...projects];
                  if (editingProject.index === -1) {
                    newProjects.unshift(editingProject.item);
                  } else {
                    newProjects[editingProject.index] = editingProject.item;
                  }
                  handleSaveProjects(newProjects);
                }}
              >
                {saving ? 'Saving...' : 'Save Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
