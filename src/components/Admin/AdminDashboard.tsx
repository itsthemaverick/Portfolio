'use client';

import React from 'react';

import AboutEditor from './AboutEditor';
import { useAdmin } from './AdminContext';
import AdminHeader from './AdminHeader';
import AdminLogin from './AdminLogin';
import AdminSidebar from './AdminSidebar';
import ContactEditor from './ContactEditor';
import GitCommitModal from './GitCommitModal';
import ProfileEditor from './ProfileEditor';
import ProjectsEditor from './ProjectsEditor';
import RawInspectorModal from './RawInspectorModal';
import RebuildModal from './RebuildModal';
import ResumeEditor from './ResumeEditor';
import SpeakingEditor from './SpeakingEditor';
import ToastContainer from './ToastContainer';
import WritingEditor from './WritingEditor';

export default function AdminDashboard() {
  const { isAuthenticated, isLoading, activeSection } = useAdmin();

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-bg-alt)',
          color: 'var(--color-fg-light)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.9rem',
        }}
      >
        Connecting to Admin Companion Server...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <AdminLogin />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <AdminHeader />
        <main className="admin-content">
          {activeSection === 'profile' && <ProfileEditor />}
          {activeSection === 'about' && <AboutEditor />}
          {activeSection === 'resume' && <ResumeEditor />}
          {activeSection === 'projects' && <ProjectsEditor />}
          {activeSection === 'writing' && <WritingEditor />}
          {activeSection === 'speaking' && <SpeakingEditor />}
          {activeSection === 'contact' && <ContactEditor />}
        </main>
      </div>

      {/* Global Admin Modals & Alerts */}
      <RebuildModal />
      <GitCommitModal />
      <RawInspectorModal />
      <ToastContainer />
    </div>
  );
}
