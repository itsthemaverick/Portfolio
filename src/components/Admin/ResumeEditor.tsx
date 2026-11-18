'use client';

import React, { useState } from 'react';

import { saveCourses, saveDegrees, saveSkills, saveWork } from '@/lib/adminApi';
import type { Course, Degree, Position, Skill } from '@/types/admin';
import { useAdmin } from './AdminContext';

export default function ResumeEditor() {
  const { data, setData, addToast } = useAdmin();
  const [subTab, setSubTab] = useState<
    'work' | 'degrees' | 'skills' | 'courses'
  >('work');
  const [saving, setSaving] = useState(false);

  // Edit modals state
  const [editingPosition, setEditingPosition] = useState<{
    index: number;
    item: Position;
  } | null>(null);
  const [editingDegree, setEditingDegree] = useState<{
    index: number;
    item: Degree;
  } | null>(null);
  const [editingSkill, setEditingSkill] = useState<{
    index: number;
    item: Skill;
  } | null>(null);
  const [editingCourse, setEditingCourse] = useState<{
    index: number;
    item: Course;
  } | null>(null);

  const work = data?.work || [];
  const degrees = data?.degrees || [];
  const skills = data?.skills || [];
  const courses = data?.courses || [];

  // =========================================================================
  // WORK EXPERIENCE
  // =========================================================================
  const handleSaveWork = async (newWork: Position[]) => {
    setSaving(true);
    try {
      const res = await saveWork(newWork);
      if (res.ok) {
        setData((prev) => (prev ? { ...prev, work: newWork } : prev));
        addToast('success', 'Work experience saved to src/data/resume/work.ts');
        setEditingPosition(null);
      } else {
        addToast('error', res.error || 'Failed to save work experience.');
      }
    } catch (err) {
      addToast('error', `Error: ${String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  // =========================================================================
  // DEGREES
  // =========================================================================
  const handleSaveDegrees = async (newDegrees: Degree[]) => {
    setSaving(true);
    try {
      const res = await saveDegrees(newDegrees);
      if (res.ok) {
        setData((prev) => (prev ? { ...prev, degrees: newDegrees } : prev));
        addToast('success', 'Education saved to src/data/resume/degrees.ts');
        setEditingDegree(null);
      } else {
        addToast('error', res.error || 'Failed to save education.');
      }
    } catch (err) {
      addToast('error', `Error: ${String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  // =========================================================================
  // SKILLS
  // =========================================================================
  const handleSaveSkills = async (newSkills: Skill[]) => {
    setSaving(true);
    try {
      const res = await saveSkills(newSkills);
      if (res.ok) {
        setData((prev) => (prev ? { ...prev, skills: newSkills } : prev));
        addToast('success', 'Skills matrix saved to src/data/resume/skills.ts');
        setEditingSkill(null);
      } else {
        addToast('error', res.error || 'Failed to save skills.');
      }
    } catch (err) {
      addToast('error', `Error: ${String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  // =========================================================================
  // COURSES
  // =========================================================================
  const handleSaveCourses = async (newCourses: Course[]) => {
    setSaving(true);
    try {
      const res = await saveCourses(newCourses);
      if (res.ok) {
        setData((prev) => (prev ? { ...prev, courses: newCourses } : prev));
        addToast('success', 'Coursework saved to src/data/resume/courses.ts');
        setEditingCourse(null);
      } else {
        addToast('error', res.error || 'Failed to save courses.');
      }
    } catch (err) {
      addToast('error', `Error: ${String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-section-container">
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">Career Center & Résumé Data</h3>
            <p className="admin-card-subtitle">
              Manage positions, academic credentials, competencies, and
              coursework
            </p>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="admin-tabs">
          <button
            type="button"
            className={`admin-tab ${subTab === 'work' ? 'active' : ''}`}
            onClick={() => setSubTab('work')}
          >
            Work Experience ({work.length})
          </button>
          <button
            type="button"
            className={`admin-tab ${subTab === 'degrees' ? 'active' : ''}`}
            onClick={() => setSubTab('degrees')}
          >
            Education & Degrees ({degrees.length})
          </button>
          <button
            type="button"
            className={`admin-tab ${subTab === 'skills' ? 'active' : ''}`}
            onClick={() => setSubTab('skills')}
          >
            Skills Matrix ({skills.length})
          </button>
          <button
            type="button"
            className={`admin-tab ${subTab === 'courses' ? 'active' : ''}`}
            onClick={() => setSubTab('courses')}
          >
            Coursework ({courses.length})
          </button>
        </div>

        {/* =============================================================== */}
        {/* TAB 1: WORK EXPERIENCE                                          */}
        {/* =============================================================== */}
        {subTab === 'work' && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '1rem',
              }}
            >
              <span className="admin-help-text">
                Chronological career entries in{' '}
                <code>src/data/resume/work.ts</code>
              </span>
              <button
                type="button"
                className="admin-btn admin-btn-sm admin-btn-primary"
                onClick={() =>
                  setEditingPosition({
                    index: -1,
                    item: {
                      name: '',
                      position: '',
                      url: 'https://',
                      startDate: new Date().toISOString().slice(0, 10),
                      summary: '',
                      highlights: [],
                    },
                  })
                }
              >
                + Add Work Position
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {work.map((pos, idx) => (
                <div key={`${pos.name}-${idx}`} className="admin-item-row">
                  <div className="admin-item-main">
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <span className="admin-item-title">{pos.position}</span>
                      <span
                        style={{
                          color: 'var(--color-fg-light)',
                          fontSize: '0.85rem',
                        }}
                      >
                        at
                      </span>
                      <span style={{ fontWeight: 600 }}>{pos.name}</span>
                      {pos.commitment && (
                        <span className="admin-badge">{pos.commitment}</span>
                      )}
                      {!pos.endDate && (
                        <span className="admin-badge active">Present</span>
                      )}
                    </div>
                    <div className="admin-item-meta">
                      <span>
                        {pos.startDate} — {pos.endDate || 'Present'}
                      </span>
                      <span>·</span>
                      <a
                        href={pos.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'var(--color-fg-light)' }}
                      >
                        {pos.url}
                      </a>
                    </div>
                  </div>
                  <div className="admin-item-actions">
                    <button
                      type="button"
                      className="admin-btn admin-btn-sm admin-btn-secondary"
                      onClick={() =>
                        setEditingPosition({ index: idx, item: { ...pos } })
                      }
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn-sm admin-btn-danger"
                      onClick={() => {
                        if (confirm(`Delete position at ${pos.name}?`)) {
                          const updated = work.filter((_, i) => i !== idx);
                          handleSaveWork(updated);
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
        )}

        {/* =============================================================== */}
        {/* TAB 2: EDUCATION & DEGREES                                      */}
        {/* =============================================================== */}
        {subTab === 'degrees' && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '1rem',
              }}
            >
              <span className="admin-help-text">
                Degree credentials in <code>src/data/resume/degrees.ts</code>
              </span>
              <button
                type="button"
                className="admin-btn admin-btn-sm admin-btn-primary"
                onClick={() =>
                  setEditingDegree({
                    index: -1,
                    item: {
                      school: '',
                      degree: '',
                      link: 'https://',
                      year: new Date().getFullYear(),
                    },
                  })
                }
              >
                + Add Degree
              </button>
            </div>

            <div>
              {degrees.map((deg, idx) => (
                <div key={`${deg.school}-${idx}`} className="admin-item-row">
                  <div className="admin-item-main">
                    <span className="admin-item-title">{deg.degree}</span>
                    <div className="admin-item-meta">
                      <span>{deg.school}</span>
                      <span>·</span>
                      <span>Class of {deg.year}</span>
                    </div>
                  </div>
                  <div className="admin-item-actions">
                    <button
                      type="button"
                      className="admin-btn admin-btn-sm admin-btn-secondary"
                      onClick={() =>
                        setEditingDegree({ index: idx, item: { ...deg } })
                      }
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn-sm admin-btn-danger"
                      onClick={() => {
                        if (confirm(`Delete degree ${deg.degree}?`)) {
                          handleSaveDegrees(
                            degrees.filter((_, i) => i !== idx),
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
        )}

        {/* =============================================================== */}
        {/* TAB 3: SKILLS MATRIX                                            */}
        {/* =============================================================== */}
        {subTab === 'skills' && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '1rem',
              }}
            >
              <span className="admin-help-text">
                Skill competencies (1–5) and categories in{' '}
                <code>src/data/resume/skills.ts</code>
              </span>
              <button
                type="button"
                className="admin-btn admin-btn-sm admin-btn-primary"
                onClick={() =>
                  setEditingSkill({
                    index: -1,
                    item: { title: '', competency: 4, category: ['Languages'] },
                  })
                }
              >
                + Add Skill
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '0.75rem',
              }}
            >
              {skills.map((skill, idx) => (
                <div
                  key={`${skill.title}-${idx}`}
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'var(--color-bg-alt)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      {skill.title}
                    </span>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        marginTop: '0.2rem',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--color-hero)',
                        }}
                      >
                        {'★'.repeat(skill.competency)}
                        {'☆'.repeat(5 - skill.competency)}
                      </span>
                      <span
                        className="admin-badge"
                        style={{ fontSize: '0.65rem' }}
                      >
                        {skill.category.join(', ')}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <button
                      type="button"
                      className="admin-btn admin-btn-sm admin-btn-secondary"
                      onClick={() =>
                        setEditingSkill({ index: idx, item: { ...skill } })
                      }
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn-sm admin-btn-danger"
                      onClick={() => {
                        handleSaveSkills(skills.filter((_, i) => i !== idx));
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* TAB 4: COURSEWORK                                               */}
        {/* =============================================================== */}
        {subTab === 'courses' && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '1rem',
              }}
            >
              <span className="admin-help-text">
                Coursework in <code>src/data/resume/courses.ts</code>{' '}
                (University must match a Degree school exactly)
              </span>
              <button
                type="button"
                className="admin-btn admin-btn-sm admin-btn-primary"
                onClick={() =>
                  setEditingCourse({
                    index: -1,
                    item: {
                      title: '',
                      number: 'AIDS ',
                      link: degrees[0]?.link || 'https://dypvp.edu.in',
                      university: degrees[0]?.school || '',
                    },
                  })
                }
              >
                + Add Course
              </button>
            </div>

            <div>
              {courses.map((course, idx) => (
                <div key={`${course.number}-${idx}`} className="admin-item-row">
                  <div className="admin-item-main">
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <span className="admin-badge">{course.number}</span>
                      <span className="admin-item-title">{course.title}</span>
                    </div>
                    <div className="admin-item-meta">
                      <span>{course.university}</span>
                    </div>
                  </div>
                  <div className="admin-item-actions">
                    <button
                      type="button"
                      className="admin-btn admin-btn-sm admin-btn-secondary"
                      onClick={() =>
                        setEditingCourse({ index: idx, item: { ...course } })
                      }
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn-sm admin-btn-danger"
                      onClick={() => {
                        handleSaveCourses(courses.filter((_, i) => i !== idx));
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* =============================================================== */}
      {/* POSITION MODAL                                                  */}
      {/* =============================================================== */}
      {editingPosition && (
        <div className="admin-modal-overlay">
          <div className="admin-modal wide">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {editingPosition.index === -1
                  ? 'Add Position'
                  : 'Edit Position'}
              </h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setEditingPosition(null)}
              >
                ✕
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label className="admin-label">Company / Organization</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={editingPosition.item.name}
                    onChange={(e) =>
                      setEditingPosition({
                        ...editingPosition,
                        item: { ...editingPosition.item, name: e.target.value },
                      })
                    }
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Position / Role Title</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={editingPosition.item.position}
                    onChange={(e) =>
                      setEditingPosition({
                        ...editingPosition,
                        item: {
                          ...editingPosition.item,
                          position: e.target.value,
                        },
                      })
                    }
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Website URL</label>
                  <input
                    type="url"
                    className="admin-input mono"
                    value={editingPosition.item.url}
                    onChange={(e) =>
                      setEditingPosition({
                        ...editingPosition,
                        item: { ...editingPosition.item, url: e.target.value },
                      })
                    }
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Commitment</label>
                  <select
                    className="admin-select"
                    value={editingPosition.item.commitment || 'full-time'}
                    onChange={(e) =>
                      setEditingPosition({
                        ...editingPosition,
                        item: {
                          ...editingPosition.item,
                          commitment:
                            e.target.value === 'part-time'
                              ? 'part-time'
                              : undefined,
                        },
                      })
                    }
                  >
                    <option value="full-time">Full-Time (Default)</option>
                    <option value="part-time">Part-Time</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Start Date (YYYY-MM-DD)</label>
                  <input
                    type="date"
                    className="admin-input mono"
                    value={editingPosition.item.startDate}
                    onChange={(e) =>
                      setEditingPosition({
                        ...editingPosition,
                        item: {
                          ...editingPosition.item,
                          startDate: e.target.value,
                        },
                      })
                    }
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">
                    End Date (Leave blank if Present)
                  </label>
                  <input
                    type="date"
                    className="admin-input mono"
                    value={editingPosition.item.endDate || ''}
                    onChange={(e) =>
                      setEditingPosition({
                        ...editingPosition,
                        item: {
                          ...editingPosition.item,
                          endDate: e.target.value || undefined,
                        },
                      })
                    }
                  />
                </div>
                <div className="admin-form-group full-width">
                  <label className="admin-label">Summary Overview</label>
                  <textarea
                    className="admin-textarea"
                    rows={3}
                    value={editingPosition.item.summary || ''}
                    onChange={(e) =>
                      setEditingPosition({
                        ...editingPosition,
                        item: {
                          ...editingPosition.item,
                          summary: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="admin-form-group full-width">
                  <label className="admin-label">
                    Bullet Highlights (One per line)
                  </label>
                  <textarea
                    className="admin-textarea"
                    rows={4}
                    value={(editingPosition.item.highlights || []).join('\n')}
                    onChange={(e) =>
                      setEditingPosition({
                        ...editingPosition,
                        item: {
                          ...editingPosition.item,
                          highlights: e.target.value
                            .split('\n')
                            .filter(Boolean),
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setEditingPosition(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                disabled={saving}
                onClick={() => {
                  const newWork = [...work];
                  if (editingPosition.index === -1) {
                    newWork.unshift(editingPosition.item);
                  } else {
                    newWork[editingPosition.index] = editingPosition.item;
                  }
                  handleSaveWork(newWork);
                }}
              >
                {saving ? 'Saving...' : 'Save Position'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =============================================================== */}
      {/* DEGREE MODAL                                                    */}
      {/* =============================================================== */}
      {editingDegree && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {editingDegree.index === -1 ? 'Add Degree' : 'Edit Degree'}
              </h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setEditingDegree(null)}
              >
                ✕
              </button>
            </div>
            <div className="admin-modal-body">
              <div
                className="admin-form-group"
                style={{ marginBottom: '1rem' }}
              >
                <label className="admin-label">Institution / School</label>
                <input
                  type="text"
                  className="admin-input"
                  value={editingDegree.item.school}
                  onChange={(e) =>
                    setEditingDegree({
                      ...editingDegree,
                      item: { ...editingDegree.item, school: e.target.value },
                    })
                  }
                  required
                />
              </div>
              <div
                className="admin-form-group"
                style={{ marginBottom: '1rem' }}
              >
                <label className="admin-label">Degree Title</label>
                <input
                  type="text"
                  className="admin-input"
                  value={editingDegree.item.degree}
                  onChange={(e) =>
                    setEditingDegree({
                      ...editingDegree,
                      item: { ...editingDegree.item, degree: e.target.value },
                    })
                  }
                  required
                />
              </div>
              <div
                className="admin-form-group"
                style={{ marginBottom: '1rem' }}
              >
                <label className="admin-label">Institution Link</label>
                <input
                  type="url"
                  className="admin-input mono"
                  value={editingDegree.item.link}
                  onChange={(e) =>
                    setEditingDegree({
                      ...editingDegree,
                      item: { ...editingDegree.item, link: e.target.value },
                    })
                  }
                  required
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Completion Year</label>
                <input
                  type="number"
                  className="admin-input mono"
                  value={editingDegree.item.year}
                  onChange={(e) =>
                    setEditingDegree({
                      ...editingDegree,
                      item: {
                        ...editingDegree.item,
                        year: parseInt(e.target.value, 10),
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
                onClick={() => setEditingDegree(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                disabled={saving}
                onClick={() => {
                  const newDegrees = [...degrees];
                  if (editingDegree.index === -1) {
                    newDegrees.push(editingDegree.item);
                  } else {
                    newDegrees[editingDegree.index] = editingDegree.item;
                  }
                  handleSaveDegrees(newDegrees);
                }}
              >
                Save Degree
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =============================================================== */}
      {/* SKILL MODAL                                                     */}
      {/* =============================================================== */}
      {editingSkill && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {editingSkill.index === -1 ? 'Add Skill' : 'Edit Skill'}
              </h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setEditingSkill(null)}
              >
                ✕
              </button>
            </div>
            <div className="admin-modal-body">
              <div
                className="admin-form-group"
                style={{ marginBottom: '1rem' }}
              >
                <label className="admin-label">Skill Title</label>
                <input
                  type="text"
                  className="admin-input"
                  value={editingSkill.item.title}
                  onChange={(e) =>
                    setEditingSkill({
                      ...editingSkill,
                      item: { ...editingSkill.item, title: e.target.value },
                    })
                  }
                  required
                />
              </div>
              <div
                className="admin-form-group"
                style={{ marginBottom: '1rem' }}
              >
                <label className="admin-label">
                  Competency Rating (1 to 5): {editingSkill.item.competency}
                </label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={editingSkill.item.competency}
                  onChange={(e) =>
                    setEditingSkill({
                      ...editingSkill,
                      item: {
                        ...editingSkill.item,
                        competency: parseInt(e.target.value, 10),
                      },
                    })
                  }
                  style={{ width: '100%', accentColor: 'var(--color-hero)' }}
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">
                  Categories (comma separated, e.g. Languages, ML Engineering,
                  Tools)
                </label>
                <input
                  type="text"
                  className="admin-input"
                  value={editingSkill.item.category.join(', ')}
                  onChange={(e) =>
                    setEditingSkill({
                      ...editingSkill,
                      item: {
                        ...editingSkill.item,
                        category: e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
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
                onClick={() => setEditingSkill(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                disabled={saving}
                onClick={() => {
                  const newSkills = [...skills];
                  if (editingSkill.index === -1) {
                    newSkills.push(editingSkill.item);
                  } else {
                    newSkills[editingSkill.index] = editingSkill.item;
                  }
                  handleSaveSkills(newSkills);
                }}
              >
                Save Skill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =============================================================== */}
      {/* COURSE MODAL                                                    */}
      {/* =============================================================== */}
      {editingCourse && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {editingCourse.index === -1 ? 'Add Course' : 'Edit Course'}
              </h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setEditingCourse(null)}
              >
                ✕
              </button>
            </div>
            <div className="admin-modal-body">
              <div
                className="admin-form-group"
                style={{ marginBottom: '1rem' }}
              >
                <label className="admin-label">Course Title</label>
                <input
                  type="text"
                  className="admin-input"
                  value={editingCourse.item.title}
                  onChange={(e) =>
                    setEditingCourse({
                      ...editingCourse,
                      item: { ...editingCourse.item, title: e.target.value },
                    })
                  }
                  required
                />
              </div>
              <div
                className="admin-form-group"
                style={{ marginBottom: '1rem' }}
              >
                <label className="admin-label">Course Number / Code</label>
                <input
                  type="text"
                  className="admin-input mono"
                  value={editingCourse.item.number}
                  onChange={(e) =>
                    setEditingCourse({
                      ...editingCourse,
                      item: { ...editingCourse.item, number: e.target.value },
                    })
                  }
                  placeholder="AIDS 201"
                  required
                />
              </div>
              <div
                className="admin-form-group"
                style={{ marginBottom: '1rem' }}
              >
                <label className="admin-label">University / School</label>
                <select
                  className="admin-select"
                  value={editingCourse.item.university}
                  onChange={(e) => {
                    const selSchool = e.target.value;
                    const matchDeg = degrees.find(
                      (d) => d.school === selSchool,
                    );
                    setEditingCourse({
                      ...editingCourse,
                      item: {
                        ...editingCourse.item,
                        university: selSchool,
                        link: matchDeg?.link || editingCourse.item.link,
                      },
                    });
                  }}
                >
                  {degrees.map((d) => (
                    <option key={d.school} value={d.school}>
                      {d.school}
                    </option>
                  ))}
                </select>
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Link</label>
                <input
                  type="url"
                  className="admin-input mono"
                  value={editingCourse.item.link}
                  onChange={(e) =>
                    setEditingCourse({
                      ...editingCourse,
                      item: { ...editingCourse.item, link: e.target.value },
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
                onClick={() => setEditingCourse(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                disabled={saving}
                onClick={() => {
                  const newCourses = [...courses];
                  if (editingCourse.index === -1) {
                    newCourses.push(editingCourse.item);
                  } else {
                    newCourses[editingCourse.index] = editingCourse.item;
                  }
                  handleSaveCourses(newCourses);
                }}
              >
                Save Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
