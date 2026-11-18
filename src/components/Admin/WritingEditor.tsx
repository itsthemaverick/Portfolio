'use client';

import Markdown from 'markdown-to-jsx';
import React, { useState } from 'react';

import { deletePost, saveExternalWriting, savePost } from '@/lib/adminApi';
import type { PostItem, WritingEntry } from '@/types/admin';
import { useAdmin } from './AdminContext';

export default function WritingEditor() {
  const { data, setData, addToast } = useAdmin();
  const [subTab, setSubTab] = useState<'posts' | 'external'>('posts');
  const [saving, setSaving] = useState(false);

  // Active post being edited (null = list view)
  const [activePost, setActivePost] = useState<{
    isNew: boolean;
    originalSlug: string;
    slug: string;
    title: string;
    date: string;
    description: string;
    draft: boolean;
    canonicalUrl: string;
    content: string;
  } | null>(null);

  // External writing modal
  const [editingExternal, setEditingExternal] = useState<{
    index: number;
    item: WritingEntry;
  } | null>(null);

  const posts = data?.posts || [];
  const externalWriting = data?.externalWriting || [];

  const handleCreateNewPost = () => {
    setActivePost({
      isNew: true,
      originalSlug: '',
      slug: 'new-post-slug',
      title: 'New Post Title',
      date: new Date().toISOString().slice(0, 10),
      description: 'A brief description of this article...',
      draft: true,
      canonicalUrl: '',
      content:
        'Write your post in Markdown here...\n\n## First Heading\n\nParagraph text.',
    });
  };

  const handleEditPost = (post: PostItem) => {
    setActivePost({
      isNew: false,
      originalSlug: post.slug,
      slug: post.slug,
      title: post.frontmatter.title || '',
      date: post.frontmatter.date || '',
      description: post.frontmatter.description || '',
      draft: Boolean(post.frontmatter.draft),
      canonicalUrl: post.frontmatter.canonicalUrl || '',
      content: post.content || '',
    });
  };

  const handleSaveActivePost = async () => {
    if (!activePost) return;
    if (!activePost.title.trim()) {
      addToast('error', 'Post title is required.');
      return;
    }
    if (!activePost.slug.trim()) {
      addToast('error', 'Post slug is required.');
      return;
    }

    setSaving(true);
    try {
      const frontmatter = {
        title: activePost.title,
        date: activePost.date,
        description: activePost.description,
        draft: activePost.draft ? true : undefined,
        canonicalUrl: activePost.canonicalUrl || undefined,
      };

      const res = await savePost(
        activePost.originalSlug || activePost.slug,
        frontmatter,
        activePost.content,
        activePost.isNew,
        activePost.slug !== activePost.originalSlug
          ? activePost.slug
          : undefined,
      );

      if (res.ok) {
        addToast(
          'success',
          `Saved post: content/writing/${activePost.slug}.md`,
        );

        // Update local state
        const updatedPosts = [...posts];
        const existingIdx = updatedPosts.findIndex(
          (p) => p.slug === (activePost.originalSlug || activePost.slug),
        );

        const newPostItem: PostItem = {
          slug: activePost.slug,
          filename: `${activePost.slug}.md`,
          frontmatter,
          content: activePost.content,
        };

        if (existingIdx !== -1) {
          updatedPosts[existingIdx] = newPostItem;
        } else {
          updatedPosts.unshift(newPostItem);
        }

        setData((prev) => (prev ? { ...prev, posts: updatedPosts } : prev));
        setActivePost(null);
      } else {
        addToast('error', res.error || 'Failed to save post.');
      }
    } catch (err) {
      addToast('error', `Save error: ${String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePost = async (slug: string) => {
    if (
      !confirm(`Are you sure you want to delete content/writing/${slug}.md?`)
    ) {
      return;
    }

    setSaving(true);
    try {
      const res = await deletePost(slug);
      if (res.ok) {
        addToast('success', `Deleted ${slug}.md`);
        setData((prev) =>
          prev
            ? { ...prev, posts: prev.posts.filter((p) => p.slug !== slug) }
            : prev,
        );
      } else {
        addToast('error', res.error || 'Failed to delete post.');
      }
    } catch (err) {
      addToast('error', `Delete error: ${String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveExternal = async (newItems: WritingEntry[]) => {
    setSaving(true);
    try {
      const res = await saveExternalWriting(newItems);
      if (res.ok) {
        setData((prev) =>
          prev ? { ...prev, externalWriting: newItems } : prev,
        );
        addToast('success', 'External writing saved to src/data/writing.ts');
        setEditingExternal(null);
      } else {
        addToast('error', res.error || 'Failed to save external publications.');
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
            <h3 className="admin-card-title">Writing & Blog Engine</h3>
            <p className="admin-card-subtitle">
              Manage markdown essays (<code>content/writing/*.md</code>) and
              external publications / patents (<code>src/data/writing.ts</code>)
            </p>
          </div>
          {!activePost && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {subTab === 'posts' ? (
                <button
                  type="button"
                  className="admin-btn admin-btn-primary"
                  onClick={handleCreateNewPost}
                >
                  + Create New Blog Post
                </button>
              ) : (
                <button
                  type="button"
                  className="admin-btn admin-btn-primary"
                  onClick={() =>
                    setEditingExternal({
                      index: -1,
                      item: {
                        title: '',
                        url: 'https://',
                        date: new Date().toISOString().slice(0, 10),
                        description: '',
                      },
                    })
                  }
                >
                  + Add External Publication
                </button>
              )}
            </div>
          )}
        </div>

        {/* Sub-tabs when not editing a post */}
        {!activePost && (
          <div className="admin-tabs">
            <button
              type="button"
              className={`admin-tab ${subTab === 'posts' ? 'active' : ''}`}
              onClick={() => setSubTab('posts')}
            >
              Published & Draft Articles ({posts.length})
            </button>
            <button
              type="button"
              className={`admin-tab ${subTab === 'external' ? 'active' : ''}`}
              onClick={() => setSubTab('external')}
            >
              External Papers & Patents ({externalWriting.length})
            </button>
          </div>
        )}

        {/* =============================================================== */}
        {/* POST EDITOR (FULL SCREEN SPLIT PREVIEW)                         */}
        {/* =============================================================== */}
        {activePost ? (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-fg-light)',
                  }}
                >
                  Editing: content/writing/{activePost.slug}.md
                </span>
                <h4 style={{ margin: '0.2rem 0 0 0', fontSize: '1.1rem' }}>
                  {activePost.title || 'Untitled Post'}
                </h4>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setActivePost(null)}
                >
                  Back to List
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-primary"
                  disabled={saving}
                  onClick={handleSaveActivePost}
                >
                  {saving ? 'Saving...' : 'Save Post (.md)'}
                </button>
              </div>
            </div>

            {/* Frontmatter Controls */}
            <div
              style={{
                background: 'var(--color-bg-alt)',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                padding: '1rem',
                marginBottom: '1.25rem',
              }}
            >
              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label className="admin-label">Post Title</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={activePost.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      const autoSlug = activePost.isNew
                        ? newTitle
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/^-|-$/g, '')
                        : activePost.slug;
                      setActivePost({
                        ...activePost,
                        title: newTitle,
                        slug: autoSlug,
                      });
                    }}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">Slug / Filename (.md)</label>
                  <input
                    type="text"
                    className="admin-input mono"
                    value={activePost.slug}
                    onChange={(e) =>
                      setActivePost({ ...activePost, slug: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">
                    Publish Date (YYYY-MM-DD)
                  </label>
                  <input
                    type="date"
                    className="admin-input mono"
                    value={activePost.date}
                    onChange={(e) =>
                      setActivePost({ ...activePost, date: e.target.value })
                    }
                    required
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
                      checked={activePost.draft}
                      onChange={(e) =>
                        setActivePost({
                          ...activePost,
                          draft: e.target.checked,
                        })
                      }
                    />
                    <span>
                      Draft Status (if checked, post will NOT be exported
                      publicly)
                    </span>
                  </label>
                </div>

                <div className="admin-form-group full-width">
                  <label className="admin-label">Description / Excerpt</label>
                  <textarea
                    className="admin-textarea"
                    rows={2}
                    value={activePost.description}
                    onChange={(e) =>
                      setActivePost({
                        ...activePost,
                        description: e.target.value,
                      })
                    }
                    placeholder="Short summary used for SEO and OpenGraph cards..."
                    required
                  />
                </div>
              </div>
            </div>

            {/* Split Editor & Live Preview */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.25rem',
              }}
            >
              <div className="admin-form-group">
                <label className="admin-label">Markdown Source</label>
                <textarea
                  className="admin-textarea mono"
                  style={{ height: '520px', lineHeight: '1.6' }}
                  value={activePost.content}
                  onChange={(e) =>
                    setActivePost({ ...activePost, content: e.target.value })
                  }
                  placeholder="## Heading\n\nWrite your content in markdown..."
                />
              </div>

              <div>
                <span className="admin-label">Live Formatted Preview</span>
                <div
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: '6px',
                    padding: '1.5rem',
                    background: 'var(--color-bg-alt)',
                    height: '520px',
                    overflowY: 'auto',
                    lineHeight: '1.7',
                  }}
                >
                  <h1
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '1.6rem',
                    }}
                  >
                    {activePost.title}
                  </h1>
                  <p
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--color-fg-light)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {activePost.date}
                    {activePost.draft ? ' · [DRAFT]' : ''}
                  </p>
                  <hr
                    style={{
                      borderColor: 'var(--color-border)',
                      margin: '1rem 0',
                    }}
                  />
                  <Markdown>
                    {activePost.content || '*Empty post content*'}
                  </Markdown>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* =============================================================== */
          /* ARTICLES LIST VIEW                                              */
          /* =============================================================== */
          <div>
            {subTab === 'posts' && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {posts.map((post) => (
                  <div key={post.slug} className="admin-item-row">
                    <div className="admin-item-main">
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <span className="admin-item-title">
                          {post.frontmatter.title}
                        </span>
                        {post.frontmatter.draft ? (
                          <span className="admin-badge draft">Draft</span>
                        ) : (
                          <span className="admin-badge active">Published</span>
                        )}
                      </div>
                      <div className="admin-item-meta">
                        <span>{post.frontmatter.date}</span>
                        <span>·</span>
                        <span>slug: {post.slug}</span>
                      </div>
                      <p
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--color-fg)',
                          margin: '0.25rem 0 0 0',
                        }}
                      >
                        {post.frontmatter.description}
                      </p>
                    </div>
                    <div className="admin-item-actions">
                      <button
                        type="button"
                        className="admin-btn admin-btn-sm admin-btn-secondary"
                        onClick={() => handleEditPost(post)}
                      >
                        Edit Post
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn-sm admin-btn-danger"
                        onClick={() => handleDeletePost(post.slug)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* =============================================================== */}
            {/* EXTERNAL WRITING & PATENTS                                      */}
            {/* =============================================================== */}
            {subTab === 'external' && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {externalWriting.map((item, idx) => (
                  <div key={`${item.title}-${idx}`} className="admin-item-row">
                    <div className="admin-item-main">
                      <span className="admin-item-title">{item.title}</span>
                      <div className="admin-item-meta">
                        <span>{item.date}</span>
                        <span>·</span>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: 'var(--color-fg-light)' }}
                        >
                          {item.url}
                        </a>
                      </div>
                      <p
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--color-fg)',
                          margin: '0.25rem 0 0 0',
                        }}
                      >
                        {item.description}
                      </p>
                    </div>
                    <div className="admin-item-actions">
                      <button
                        type="button"
                        className="admin-btn admin-btn-sm admin-btn-secondary"
                        onClick={() =>
                          setEditingExternal({ index: idx, item: { ...item } })
                        }
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn-sm admin-btn-danger"
                        onClick={() => {
                          if (
                            confirm(`Delete external item "${item.title}"?`)
                          ) {
                            handleSaveExternal(
                              externalWriting.filter((_, i) => i !== idx),
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
            )}
          </div>
        )}
      </div>

      {/* External Item Modal */}
      {editingExternal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {editingExternal.index === -1
                  ? 'Add External Writing'
                  : 'Edit External Writing'}
              </h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setEditingExternal(null)}
              >
                ✕
              </button>
            </div>
            <div className="admin-modal-body">
              <div
                className="admin-form-group"
                style={{ marginBottom: '1rem' }}
              >
                <label className="admin-label">Title</label>
                <input
                  type="text"
                  className="admin-input"
                  value={editingExternal.item.title}
                  onChange={(e) =>
                    setEditingExternal({
                      ...editingExternal,
                      item: { ...editingExternal.item, title: e.target.value },
                    })
                  }
                  required
                />
              </div>
              <div
                className="admin-form-group"
                style={{ marginBottom: '1rem' }}
              >
                <label className="admin-label">Destination URL</label>
                <input
                  type="url"
                  className="admin-input mono"
                  value={editingExternal.item.url}
                  onChange={(e) =>
                    setEditingExternal({
                      ...editingExternal,
                      item: { ...editingExternal.item, url: e.target.value },
                    })
                  }
                  required
                />
              </div>
              <div
                className="admin-form-group"
                style={{ marginBottom: '1rem' }}
              >
                <label className="admin-label">Publication Date</label>
                <input
                  type="date"
                  className="admin-input mono"
                  value={editingExternal.item.date}
                  onChange={(e) =>
                    setEditingExternal({
                      ...editingExternal,
                      item: { ...editingExternal.item, date: e.target.value },
                    })
                  }
                  required
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Description / Status</label>
                <textarea
                  className="admin-textarea"
                  rows={3}
                  value={editingExternal.item.description}
                  onChange={(e) =>
                    setEditingExternal({
                      ...editingExternal,
                      item: {
                        ...editingExternal.item,
                        description: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g. Patent Application Under Examination (Co-inventor with Prof. ...)"
                  required
                />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setEditingExternal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                disabled={saving}
                onClick={() => {
                  const newItems = [...externalWriting];
                  if (editingExternal.index === -1) {
                    newItems.unshift(editingExternal.item);
                  } else {
                    newItems[editingExternal.index] = editingExternal.item;
                  }
                  handleSaveExternal(newItems);
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
