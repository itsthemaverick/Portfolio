'use client';

import { useAdmin } from './AdminContext';

const SECTION_TITLES: Record<string, { title: string; route: string }> = {
  profile: { title: 'General Profile & Hero Settings', route: '/' },
  about: { title: 'About Page Editor', route: '/about/' },
  resume: { title: 'Résumé & Career Center', route: '/resume/' },
  projects: { title: 'Projects Register', route: '/projects/' },
  writing: { title: 'Writing & Blog Engine', route: '/writing/' },
  speaking: { title: 'Speaking & Appearances', route: '/speaking/' },
  contact: { title: 'Contact & Social Profiles', route: '/contact/' },
};

export default function AdminHeader() {
  const {
    activeSection,
    openCommitModal,
    openRebuildModal,
    logout,
    data,
    openInspector,
  } = useAdmin();

  const currentInfo = SECTION_TITLES[activeSection] || {
    title: 'Admin Dashboard',
    route: '/',
  };

  const handleInspectRaw = () => {
    if (!data) return;
    let payload = '';
    let title = `${activeSection.toUpperCase()} Raw Data`;

    switch (activeSection) {
      case 'profile':
        payload = JSON.stringify(data.profile, null, 2);
        break;
      case 'about':
        payload = data.about.markdown;
        title = 'About Page Raw Markdown';
        break;
      case 'resume':
        payload = JSON.stringify(
          {
            work: data.work,
            degrees: data.degrees,
            skills: data.skills,
            courses: data.courses,
          },
          null,
          2,
        );
        break;
      case 'projects':
        payload = JSON.stringify(data.projects, null, 2);
        break;
      case 'writing':
        payload = JSON.stringify(
          {
            posts: data.posts,
            externalWriting: data.externalWriting,
          },
          null,
          2,
        );
        break;
      case 'speaking':
        payload = JSON.stringify(data.speaking, null, 2);
        break;
      case 'contact':
        payload = JSON.stringify(data.contact, null, 2);
        break;
      default:
        payload = JSON.stringify(data, null, 2);
    }

    openInspector(title, payload);
  };

  return (
    <header className="admin-header">
      <div className="admin-header-title">
        <h2 className="admin-section-heading">{currentInfo.title}</h2>
      </div>

      <div className="admin-header-actions">
        <button
          type="button"
          onClick={handleInspectRaw}
          className="admin-btn admin-btn-secondary"
          title="Inspect Raw JSON or Markdown"
        >
          <svg
            style={{ width: '14px', height: '14px' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
          </svg>
          Inspect
        </button>

        <a
          href={currentInfo.route}
          target="_blank"
          rel="noopener noreferrer"
          className="admin-btn admin-btn-secondary"
          title="Preview Live Page in New Tab"
        >
          <svg
            style={{ width: '14px', height: '14px' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          Preview Live
        </a>

        <button
          type="button"
          onClick={openRebuildModal}
          className="admin-btn admin-btn-secondary"
          title="Rebuild static assets (icons, OG cards, verify build)"
        >
          <svg
            style={{ width: '14px', height: '14px' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Rebuild Assets
        </button>

        <button
          type="button"
          onClick={openCommitModal}
          className="admin-btn admin-btn-primary"
          title="Review changes and make git commit"
        >
          <svg
            style={{ width: '14px', height: '14px' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          Save & Commit
        </button>

        <button
          type="button"
          onClick={logout}
          className="admin-btn admin-btn-danger admin-btn-sm"
          title="Sign out of Admin Dashboard"
        >
          <svg
            style={{ width: '14px', height: '14px' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Logout
        </button>
      </div>
    </header>
  );
}
