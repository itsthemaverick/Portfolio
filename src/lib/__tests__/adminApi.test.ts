import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  checkServerHealth,
  commitGitChanges,
  fetchAllPortfolioData,
  fetchGitStatus,
  getStoredToken,
  login,
  logout,
  removeStoredToken,
  saveAbout,
  saveProfile,
  setStoredToken,
  triggerRebuild,
  verifyAuth,
} from '../adminApi';

describe('adminApi token management', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('stores and retrieves session token', () => {
    expect(getStoredToken()).toBeNull();
    setStoredToken('test-secret-token');
    expect(getStoredToken()).toBe('test-secret-token');
    removeStoredToken();
    expect(getStoredToken()).toBeNull();
  });
});

describe('adminApi network operations', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('checks server health when online', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, status: 'ok' }),
    } as Response);

    const isOnline = await checkServerHealth();
    expect(isOnline).toBe(true);
  });

  it('handles server health check failure gracefully', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    const isOnline = await checkServerHealth();
    expect(isOnline).toBe(false);
  });

  it('performs login successfully and stores token', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, token: 'session-jwt-123' }),
    } as Response);

    const res = await login('admin123');
    expect(res.ok).toBe(true);
    expect(res.token).toBe('session-jwt-123');
    expect(getStoredToken()).toBe('session-jwt-123');
  });

  it('returns error when login fails', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ ok: false, error: 'Invalid password' }),
    } as Response);

    const res = await login('wrong');
    expect(res.ok).toBe(false);
    expect(res.error).toBe('Invalid password');
    expect(getStoredToken()).toBeNull();
  });

  it('verifies valid token', async () => {
    setStoredToken('valid-token');
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, authenticated: true }),
    } as Response);

    const isValid = await verifyAuth();
    expect(isValid).toBe(true);
  });

  it('clears token on logout', async () => {
    setStoredToken('active-token');
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true }),
    } as Response);

    await logout();
    expect(getStoredToken()).toBeNull();
  });

  it('fetches all portfolio data when authenticated', async () => {
    setStoredToken('valid-token');
    const mockData = {
      profile: { name: 'Yashraj Bhogade' },
      about: { bio: 'Intro' },
      resume: { work: [], degrees: [], skills: [], courses: [] },
      projects: [],
      writing: { articles: [], external: [] },
      speaking: [],
      contact: [],
    };

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, data: mockData }),
    } as Response);

    const res = await fetchAllPortfolioData();
    expect(res.ok).toBe(true);
    expect(res.data?.profile?.name).toBe('Yashraj Bhogade');
  });

  it('saves profile and about section data', async () => {
    setStoredToken('valid-token');
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true }),
    } as Response);

    const profileRes = await saveProfile({
      name: 'Yashraj Bhogade',
    } as unknown as Parameters<typeof saveProfile>[0]);
    expect(profileRes.ok).toBe(true);

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true }),
    } as Response);

    const aboutRes = await saveAbout('# About Yashraj');
    expect(aboutRes.ok).toBe(true);
  });

  it('triggers asset rebuild task', async () => {
    setStoredToken('valid-token');
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
        action: 'og',
        exitCode: 0,
        stdout: 'Generated cards',
      }),
    } as Response);

    const res = await triggerRebuild('og');
    expect(res.ok).toBe(true);
    expect(res.stdout).toBe('Generated cards');
  });

  it('inspects git status and makes commit', async () => {
    setStoredToken('valid-token');
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
        branch: 'main',
        changedFiles: ['src/data/profile.json'],
      }),
    } as Response);

    const statusRes = await fetchGitStatus();
    expect(statusRes.ok).toBe(true);
    expect(statusRes.changedFiles).toContain('src/data/profile.json');

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, message: 'Committed successfully' }),
    } as Response);

    const commitRes = await commitGitChanges('feat: update profile data');
    expect(commitRes.ok).toBe(true);
  });
});
