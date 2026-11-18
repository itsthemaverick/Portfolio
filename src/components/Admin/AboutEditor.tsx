'use client';

import Markdown from 'markdown-to-jsx';
import React, { useEffect, useState } from 'react';

import { saveAbout } from '@/lib/adminApi';
import { useAdmin } from './AdminContext';

interface ParsedAbout {
  intro: string;
  history: Array<{ year: string; text: string }>;
  interests: string[];
  geography: string[];
  funFacts: string[];
  vision: string[];
  websites: Array<{ name: string; url: string }>;
}

function parseAboutMarkdown(md: string): ParsedAbout {
  const result: ParsedAbout = {
    intro: '',
    history: [],
    interests: [],
    geography: [],
    funFacts: [],
    vision: [],
    websites: [],
  };

  const sections = md.split(/^#\s+/m);

  for (const sec of sections) {
    const trimmed = sec.trim();
    if (!trimmed) continue;
    const firstNewline = trimmed.indexOf('\n');
    const title = (
      firstNewline !== -1 ? trimmed.slice(0, firstNewline) : trimmed
    )
      .trim()
      .toLowerCase();
    const body =
      firstNewline !== -1 ? trimmed.slice(firstNewline + 1).trim() : '';

    if (title === 'intro') {
      result.intro = body;
    } else if (title === 'some history') {
      const lines = body.split('\n');
      for (const line of lines) {
        const itemMatch = line.match(/^[-*]\s+(?:In\s+)?(\d{4})[,:]?\s+(.*)$/i);
        if (itemMatch) {
          result.history.push({ year: itemMatch[1], text: itemMatch[2] });
        } else if (line.trim().startsWith('- ')) {
          result.history.push({ year: '', text: line.trim().slice(2) });
        }
      }
    } else if (title === 'i like') {
      result.interests = body
        .split('\n')
        .filter((l) => l.trim().startsWith('- '))
        .map((l) => l.trim().slice(2));
    } else if (title === 'travel / geography') {
      result.geography = body
        .split('\n')
        .filter((l) => l.trim().startsWith('- '))
        .map((l) => l.trim().slice(2));
    } else if (title === 'fun facts') {
      result.funFacts = body
        .split('\n')
        .filter((l) => l.trim().startsWith('- '))
        .map((l) => l.trim().slice(2));
    } else if (title === 'i dream of') {
      result.vision = body
        .split('\n')
        .filter((l) => l.trim().startsWith('- '))
        .map((l) => l.trim().slice(2));
    } else if (title.includes('admire')) {
      const lines = body.split('\n');
      for (const line of lines) {
        const linkMatch = line.match(/^[-*]\s+\[(.*?)\]\((.*?)\)/);
        if (linkMatch) {
          result.websites.push({ name: linkMatch[1], url: linkMatch[2] });
        }
      }
    }
  }

  return result;
}

function assembleAboutMarkdown(parsed: ParsedAbout): string {
  const parts: string[] = [];

  parts.push(`# Intro\n\n${parsed.intro.trim()}`);

  if (parsed.history.length > 0) {
    const historyLines = parsed.history
      .filter((h) => h.text.trim())
      .map((h) => (h.year ? `- In ${h.year}, ${h.text}` : `- ${h.text}`));
    parts.push(`# Some history\n\n${historyLines.join('\n')}`);
  }

  if (parsed.interests.length > 0) {
    const lines = parsed.interests.filter(Boolean).map((item) => `- ${item}`);
    parts.push(`# I like\n\n${lines.join('\n')}`);
  }

  if (parsed.geography.length > 0) {
    const lines = parsed.geography.filter(Boolean).map((item) => `- ${item}`);
    parts.push(`# Travel / geography\n\n${lines.join('\n')}`);
  }

  if (parsed.funFacts.length > 0) {
    const lines = parsed.funFacts.filter(Boolean).map((item) => `- ${item}`);
    parts.push(`# Fun facts\n\n${lines.join('\n')}`);
  }

  if (parsed.vision.length > 0) {
    const lines = parsed.vision.filter(Boolean).map((item) => `- ${item}`);
    parts.push(`# I dream of\n\n${lines.join('\n')}`);
  }

  if (parsed.websites.length > 0) {
    const lines = parsed.websites
      .filter((w) => w.name && w.url)
      .map((w) => `- [${w.name}](${w.url})`);
    parts.push(`# Websites from people I admire\n\n${lines.join('\n')}`);
  }

  return `${parts.join('\n\n')}\n`;
}

export default function AboutEditor() {
  const { data, setData, addToast } = useAdmin();
  const [activeTab, setActiveTab] = useState<
    | 'intro'
    | 'history'
    | 'interests'
    | 'geography'
    | 'funfacts'
    | 'vision'
    | 'websites'
    | 'raw'
  >('intro');

  const [saving, setSaving] = useState(false);
  const [parsed, setParsed] = useState<ParsedAbout>({
    intro: '',
    history: [],
    interests: [],
    geography: [],
    funFacts: [],
    vision: [],
    websites: [],
  });

  const rawMarkdown = data?.about?.markdown || '';

  useEffect(() => {
    if (rawMarkdown) {
      setParsed(parseAboutMarkdown(rawMarkdown));
    }
  }, [rawMarkdown]);

  const updateRawMarkdown = (newMd: string) => {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        about: { markdown: newMd },
      };
    });
  };

  const syncParsedToRaw = (updated: ParsedAbout) => {
    setParsed(updated);
    const assembled = assembleAboutMarkdown(updated);
    updateRawMarkdown(assembled);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await saveAbout(rawMarkdown);
      if (res.ok) {
        addToast('success', 'About page content saved to src/data/about.ts');
      } else {
        addToast('error', res.error || 'Failed to save about content.');
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
            <h3 className="admin-card-title">About Page Sections</h3>
            <p className="admin-card-subtitle">
              Interactive section editor managing <code>src/data/about.ts</code>
            </p>
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="admin-btn admin-btn-primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="admin-tabs">
          <button
            type="button"
            className={`admin-tab ${activeTab === 'intro' ? 'active' : ''}`}
            onClick={() => setActiveTab('intro')}
          >
            Bio & Intro
          </button>
          <button
            type="button"
            className={`admin-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Some History ({parsed.history.length})
          </button>
          <button
            type="button"
            className={`admin-tab ${activeTab === 'interests' ? 'active' : ''}`}
            onClick={() => setActiveTab('interests')}
          >
            Interests ({parsed.interests.length})
          </button>
          <button
            type="button"
            className={`admin-tab ${activeTab === 'geography' ? 'active' : ''}`}
            onClick={() => setActiveTab('geography')}
          >
            Geography & Studies
          </button>
          <button
            type="button"
            className={`admin-tab ${activeTab === 'funfacts' ? 'active' : ''}`}
            onClick={() => setActiveTab('funfacts')}
          >
            Fun Facts ({parsed.funFacts.length})
          </button>
          <button
            type="button"
            className={`admin-tab ${activeTab === 'vision' ? 'active' : ''}`}
            onClick={() => setActiveTab('vision')}
          >
            Vision ({parsed.vision.length})
          </button>
          <button
            type="button"
            className={`admin-tab ${activeTab === 'websites' ? 'active' : ''}`}
            onClick={() => setActiveTab('websites')}
          >
            Admired Websites ({parsed.websites.length})
          </button>
          <button
            type="button"
            className={`admin-tab ${activeTab === 'raw' ? 'active' : ''}`}
            onClick={() => setActiveTab('raw')}
            style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)' }}
          >
            Raw Markdown & Preview
          </button>
        </div>

        {/* Panel 1: Bio & Intro */}
        {activeTab === 'intro' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.5rem',
            }}
          >
            <div className="admin-form-group">
              <label htmlFor="intro-markdown" className="admin-label">
                Bio Paragraphs (Markdown supported)
              </label>
              <textarea
                id="intro-markdown"
                className="admin-textarea"
                style={{ height: '320px', fontFamily: 'var(--font-mono)' }}
                value={parsed.intro}
                onChange={(e) => {
                  const updated = { ...parsed, intro: e.target.value };
                  syncParsedToRaw(updated);
                }}
                placeholder="Write your bio introduction..."
              />
            </div>
            <div>
              <span className="admin-label">Live Preview</span>
              <div
                style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  padding: '1.25rem',
                  background: 'var(--color-bg-alt)',
                  height: '320px',
                  overflowY: 'auto',
                  lineHeight: '1.6',
                }}
              >
                <Markdown>{parsed.intro || '*No bio content*'}</Markdown>
              </div>
            </div>
          </div>
        )}

        {/* Panel 2: Some History */}
        {activeTab === 'history' && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
              }}
            >
              <span className="admin-help-text">
                Chronological timeline milestones (Year + Milestone description)
              </span>
              <button
                type="button"
                className="admin-btn admin-btn-sm admin-btn-secondary"
                onClick={() => {
                  const updated = {
                    ...parsed,
                    history: [
                      ...parsed.history,
                      { year: new Date().getFullYear().toString(), text: '' },
                    ],
                  };
                  syncParsedToRaw(updated);
                }}
              >
                + Add Milestone
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              {parsed.history.map((item, idx) => (
                <div
                  key={`history-${idx}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.6rem 0.8rem',
                    background: 'var(--color-bg-alt)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '6px',
                  }}
                >
                  <input
                    type="text"
                    className="admin-input mono"
                    style={{ width: '90px' }}
                    placeholder="Year"
                    value={item.year}
                    onChange={(e) => {
                      const newHist = [...parsed.history];
                      newHist[idx] = { ...newHist[idx], year: e.target.value };
                      syncParsedToRaw({ ...parsed, history: newHist });
                    }}
                  />
                  <input
                    type="text"
                    className="admin-input"
                    style={{ flex: 1 }}
                    placeholder="Milestone description"
                    value={item.text}
                    onChange={(e) => {
                      const newHist = [...parsed.history];
                      newHist[idx] = { ...newHist[idx], text: e.target.value };
                      syncParsedToRaw({ ...parsed, history: newHist });
                    }}
                  />
                  <button
                    type="button"
                    className="admin-btn admin-btn-sm admin-btn-danger"
                    onClick={() => {
                      const newHist = parsed.history.filter(
                        (_, i) => i !== idx,
                      );
                      syncParsedToRaw({ ...parsed, history: newHist });
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Panel 3: Interests ("I Like") */}
        {activeTab === 'interests' && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
              }}
            >
              <span className="admin-help-text">
                Technical and personal areas of passion
              </span>
              <button
                type="button"
                className="admin-btn admin-btn-sm admin-btn-secondary"
                onClick={() => {
                  const updated = {
                    ...parsed,
                    interests: [...parsed.interests, ''],
                  };
                  syncParsedToRaw(updated);
                }}
              >
                + Add Interest
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              {parsed.interests.map((item, idx) => (
                <div
                  key={`interest-${idx}`}
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    alignItems: 'center',
                  }}
                >
                  <input
                    type="text"
                    className="admin-input"
                    style={{ flex: 1 }}
                    value={item}
                    onChange={(e) => {
                      const newArr = [...parsed.interests];
                      newArr[idx] = e.target.value;
                      syncParsedToRaw({ ...parsed, interests: newArr });
                    }}
                    placeholder="e.g. Low-level systems programming in C"
                  />
                  <button
                    type="button"
                    className="admin-btn admin-btn-sm admin-btn-danger"
                    onClick={() => {
                      const newArr = parsed.interests.filter(
                        (_, i) => i !== idx,
                      );
                      syncParsedToRaw({ ...parsed, interests: newArr });
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Panel 4: Geography & Studies */}
        {activeTab === 'geography' && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
              }}
            >
              <span className="admin-help-text">
                Base location and institutional study details
              </span>
              <button
                type="button"
                className="admin-btn admin-btn-sm admin-btn-secondary"
                onClick={() => {
                  const updated = {
                    ...parsed,
                    geography: [...parsed.geography, ''],
                  };
                  syncParsedToRaw(updated);
                }}
              >
                + Add Item
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              {parsed.geography.map((item, idx) => (
                <div
                  key={`geo-${idx}`}
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    alignItems: 'center',
                  }}
                >
                  <input
                    type="text"
                    className="admin-input"
                    style={{ flex: 1 }}
                    value={item}
                    onChange={(e) => {
                      const newArr = [...parsed.geography];
                      newArr[idx] = e.target.value;
                      syncParsedToRaw({ ...parsed, geography: newArr });
                    }}
                    placeholder="e.g. I am based in Pune, Maharashtra, India."
                  />
                  <button
                    type="button"
                    className="admin-btn admin-btn-sm admin-btn-danger"
                    onClick={() => {
                      const newArr = parsed.geography.filter(
                        (_, i) => i !== idx,
                      );
                      syncParsedToRaw({ ...parsed, geography: newArr });
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Panel 5: Fun Facts */}
        {activeTab === 'funfacts' && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
              }}
            >
              <span className="admin-help-text">
                Certifications, hackathon achievements, and proficiencies
              </span>
              <button
                type="button"
                className="admin-btn admin-btn-sm admin-btn-secondary"
                onClick={() => {
                  const updated = {
                    ...parsed,
                    funFacts: [...parsed.funFacts, ''],
                  };
                  syncParsedToRaw(updated);
                }}
              >
                + Add Fun Fact
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              {parsed.funFacts.map((item, idx) => (
                <div
                  key={`fact-${idx}`}
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    alignItems: 'center',
                  }}
                >
                  <input
                    type="text"
                    className="admin-input"
                    style={{ flex: 1 }}
                    value={item}
                    onChange={(e) => {
                      const newArr = [...parsed.funFacts];
                      newArr[idx] = e.target.value;
                      syncParsedToRaw({ ...parsed, funFacts: newArr });
                    }}
                    placeholder="e.g. I speak Marathi, English, Hindi..."
                  />
                  <button
                    type="button"
                    className="admin-btn admin-btn-sm admin-btn-danger"
                    onClick={() => {
                      const newArr = parsed.funFacts.filter(
                        (_, i) => i !== idx,
                      );
                      syncParsedToRaw({ ...parsed, funFacts: newArr });
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Panel 6: Vision ("I Dream Of") */}
        {activeTab === 'vision' && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
              }}
            >
              <span className="admin-help-text">
                Long-term vision and technical aspirations
              </span>
              <button
                type="button"
                className="admin-btn admin-btn-sm admin-btn-secondary"
                onClick={() => {
                  const updated = {
                    ...parsed,
                    vision: [...parsed.vision, ''],
                  };
                  syncParsedToRaw(updated);
                }}
              >
                + Add Aspiration
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              {parsed.vision.map((item, idx) => (
                <div
                  key={`vision-${idx}`}
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    alignItems: 'center',
                  }}
                >
                  <input
                    type="text"
                    className="admin-input"
                    style={{ flex: 1 }}
                    value={item}
                    onChange={(e) => {
                      const newArr = [...parsed.vision];
                      newArr[idx] = e.target.value;
                      syncParsedToRaw({ ...parsed, vision: newArr });
                    }}
                    placeholder="e.g. Advancing computational neuroscience through AI."
                  />
                  <button
                    type="button"
                    className="admin-btn admin-btn-sm admin-btn-danger"
                    onClick={() => {
                      const newArr = parsed.vision.filter((_, i) => i !== idx);
                      syncParsedToRaw({ ...parsed, vision: newArr });
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Panel 7: Websites I Admire */}
        {activeTab === 'websites' && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
              }}
            >
              <span className="admin-help-text">
                Curated links to people you admire (Name + URL)
              </span>
              <button
                type="button"
                className="admin-btn admin-btn-sm admin-btn-secondary"
                onClick={() => {
                  const updated = {
                    ...parsed,
                    websites: [
                      ...parsed.websites,
                      { name: '', url: 'https://' },
                    ],
                  };
                  syncParsedToRaw(updated);
                }}
              >
                + Add Website Link
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              {parsed.websites.map((item, idx) => (
                <div
                  key={`web-${idx}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.6rem 0.8rem',
                    background: 'var(--color-bg-alt)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '6px',
                  }}
                >
                  <input
                    type="text"
                    className="admin-input"
                    style={{ flex: '1 1 200px' }}
                    placeholder="Person / Site Name"
                    value={item.name}
                    onChange={(e) => {
                      const newWeb = [...parsed.websites];
                      newWeb[idx] = { ...newWeb[idx], name: e.target.value };
                      syncParsedToRaw({ ...parsed, websites: newWeb });
                    }}
                  />
                  <input
                    type="url"
                    className="admin-input mono"
                    style={{ flex: '2 1 300px' }}
                    placeholder="https://..."
                    value={item.url}
                    onChange={(e) => {
                      const newWeb = [...parsed.websites];
                      newWeb[idx] = { ...newWeb[idx], url: e.target.value };
                      syncParsedToRaw({ ...parsed, websites: newWeb });
                    }}
                  />
                  <button
                    type="button"
                    className="admin-btn admin-btn-sm admin-btn-danger"
                    onClick={() => {
                      const newWeb = parsed.websites.filter(
                        (_, i) => i !== idx,
                      );
                      syncParsedToRaw({ ...parsed, websites: newWeb });
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Panel 8: Raw Markdown Mode */}
        {activeTab === 'raw' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.5rem',
            }}
          >
            <div className="admin-form-group">
              <label htmlFor="raw-markdown-editor" className="admin-label">
                Complete aboutMarkdown String
              </label>
              <textarea
                id="raw-markdown-editor"
                className="admin-textarea mono"
                style={{ height: '480px' }}
                value={rawMarkdown}
                onChange={(e) => {
                  updateRawMarkdown(e.target.value);
                  setParsed(parseAboutMarkdown(e.target.value));
                }}
              />
            </div>
            <div>
              <span className="admin-label">Rendered Page Preview</span>
              <div
                style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  padding: '1.5rem',
                  background: 'var(--color-bg-alt)',
                  height: '480px',
                  overflowY: 'auto',
                  lineHeight: '1.7',
                }}
              >
                <Markdown>{rawMarkdown || '*Empty markdown*'}</Markdown>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
