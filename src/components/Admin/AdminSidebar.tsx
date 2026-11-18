'use client';

import Link from 'next/link';
import React from 'react';

import ThemeToggle from '@/components/Template/ThemeToggle';
import { type AdminSection, useAdmin } from './AdminContext';

interface NavSectionDef {
  id: AdminSection;
  label: string;
  icon: React.ReactNode;
  subtitle: string;
}

const SECTIONS: NavSectionDef[] = [
  {
    id: 'profile',
    label: 'Profile & Hero',
    subtitle: 'profile.json',
    icon: (
      <svg
        className="admin-nav-icon"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
  {
    id: 'about',
    label: 'About Editor',
    subtitle: 'about.ts',
    icon: (
      <svg
        className="admin-nav-icon"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
  },
  {
    id: 'resume',
    label: 'Career & Résumé',
    subtitle: 'resume/*.ts',
    icon: (
      <svg
        className="admin-nav-icon"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    id: 'projects',
    label: 'Projects Register',
    subtitle: 'projects.ts',
    icon: (
      <svg
        className="admin-nav-icon"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
    ),
  },
  {
    id: 'writing',
    label: 'Writing & Blog',
    subtitle: 'content/writing/*.md',
    icon: (
      <svg
        className="admin-nav-icon"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
    ),
  },
  {
    id: 'speaking',
    label: 'Speaking & Events',
    subtitle: 'speaking.ts',
    icon: (
      <svg
        className="admin-nav-icon"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
        />
      </svg>
    ),
  },
  {
    id: 'contact',
    label: 'Contact & Socials',
    subtitle: 'contact.ts',
    icon: (
      <svg
        className="admin-nav-icon"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  },
];

export default function AdminSidebar() {
  const {
    activeSection,
    setActiveSection,
    isSidebarCollapsed,
    toggleSidebar,
    serverOnline,
  } = useAdmin();

  return (
    <aside className={`admin-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="admin-sidebar-header">
        <Link href="/" className="admin-brand">
          <div className="admin-monogram">YB</div>
          {!isSidebarCollapsed && (
            <div className="admin-brand-title">
              <span className="admin-brand-name">Yashraj Bhogade</span>
              <span className="admin-brand-badge">Admin Center</span>
            </div>
          )}
        </Link>
        <button
          type="button"
          onClick={toggleSidebar}
          className="admin-btn admin-btn-sm"
          style={{ padding: '0.2rem 0.4rem', border: 'none' }}
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            style={{ width: '16px', height: '16px' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isSidebarCollapsed ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            )}
          </svg>
        </button>
      </div>

      <nav className="admin-sidebar-nav" aria-label="Admin Navigation">
        {SECTIONS.map((sec) => {
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => setActiveSection(sec.id)}
              className={`admin-nav-item ${isActive ? 'active' : ''}`}
              title={sec.label}
            >
              {sec.icon}
              {!isSidebarCollapsed && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span>{sec.label}</span>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-fg-light)',
                    }}
                  >
                    {sec.subtitle}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      <div className="admin-sidebar-footer">
        {!isSidebarCollapsed && (
          <div className="admin-mode-pill">
            <span className="admin-mode-status">
              <span
                className={`admin-status-dot ${serverOnline ? 'online' : ''}`}
              />
              {serverOnline ? 'Local Companion' : 'Companion Offline'}
            </span>
            <span>:3001</span>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
          }}
        >
          {!isSidebarCollapsed && (
            <span
              style={{ fontSize: '0.75rem', color: 'var(--color-fg-light)' }}
            >
              Theme
            </span>
          )}
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
