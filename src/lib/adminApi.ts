import type {
  ConnectionMode,
  ContactItem,
  Course,
  Degree,
  PortfolioData,
  Position,
  PostFrontmatter,
  Project,
  Skill,
  WritingEntry,
} from '@/types/admin';

const TOKEN_KEY = 'portfolio_admin_token';
const GITHUB_TOKEN_KEY = 'portfolio_github_token';
const GITHUB_REPO_KEY = 'portfolio_github_repo';

function getCompanionUrl(): string {
  if (typeof window !== 'undefined') {
    // If running in browser and on port 3000, point to companion server on port 3001
    const hostname = window.location.hostname || 'localhost';
    return `http://${hostname}:3001/api/admin`;
  }
  return 'http://localhost:3001/api/admin';
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

export function getStoredGitHubToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(GITHUB_TOKEN_KEY);
}

export function setStoredGitHubToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GITHUB_TOKEN_KEY, token);
}

export function getStoredGitHubRepo(): string {
  if (typeof window === 'undefined') return 'itsthemaverick/personal-site';
  return (
    localStorage.getItem(GITHUB_REPO_KEY) || 'itsthemaverick/personal-site'
  );
}

export function setStoredGitHubRepo(repo: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GITHUB_REPO_KEY, repo);
}

async function request(
  endpoint: string,
  options: RequestInit = {},
): Promise<{
  ok: boolean;
  data?: unknown;
  error?: string;
  [key: string]: unknown;
}> {
  const token = getStoredToken();
  const url = `${getCompanionUrl()}${endpoint}`;

  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });
    const json = await res.json();
    return json;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      error: `Network request failed: ${message}. Make sure Companion Server is running (npm run admin).`,
    };
  }
}

export async function checkServerHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${getCompanionUrl()}/health`);
    const json = await res.json();
    return json.ok === true;
  } catch {
    return false;
  }
}

export async function login(
  password: string,
): Promise<{ ok: boolean; token?: string; error?: string }> {
  const res = await request('/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
  if (res.ok && res.token && typeof res.token === 'string') {
    setStoredToken(res.token);
  }
  return res as { ok: boolean; token?: string; error?: string };
}

export async function verifyAuth(): Promise<boolean> {
  const token = getStoredToken();
  if (!token) return false;
  const res = await request('/verify');
  return res.ok === true;
}

export async function logout(): Promise<void> {
  try {
    await request('/logout', { method: 'POST' });
  } finally {
    removeStoredToken();
  }
}

export async function fetchAllPortfolioData(): Promise<{
  ok: boolean;
  data?: PortfolioData;
  error?: string;
}> {
  const res = await request('/data');
  return res as { ok: boolean; data?: PortfolioData; error?: string };
}

export async function saveProfile(
  profile: PortfolioData['profile'],
): Promise<{ ok: boolean; error?: string }> {
  return request('/profile', {
    method: 'PUT',
    body: JSON.stringify(profile),
  });
}

export async function saveAbout(
  markdown: string,
): Promise<{ ok: boolean; error?: string }> {
  return request('/about', {
    method: 'PUT',
    body: JSON.stringify({ markdown }),
  });
}

export async function saveWork(
  work: Position[],
): Promise<{ ok: boolean; error?: string }> {
  return request('/resume/work', {
    method: 'PUT',
    body: JSON.stringify(work),
  });
}

export async function saveDegrees(
  degrees: Degree[],
): Promise<{ ok: boolean; error?: string }> {
  return request('/resume/degrees', {
    method: 'PUT',
    body: JSON.stringify(degrees),
  });
}

export async function saveSkills(
  skills: Skill[],
): Promise<{ ok: boolean; error?: string }> {
  return request('/resume/skills', {
    method: 'PUT',
    body: JSON.stringify(skills),
  });
}

export async function saveCourses(
  courses: Course[],
): Promise<{ ok: boolean; error?: string }> {
  return request('/resume/courses', {
    method: 'PUT',
    body: JSON.stringify(courses),
  });
}

export async function saveProjects(
  projects: Project[],
): Promise<{ ok: boolean; error?: string }> {
  return request('/projects', {
    method: 'PUT',
    body: JSON.stringify(projects),
  });
}

export async function savePost(
  slug: string,
  frontmatter: PostFrontmatter,
  content: string,
  isNew = false,
  newSlug?: string,
): Promise<{ ok: boolean; error?: string }> {
  if (isNew) {
    return request('/writing/posts', {
      method: 'POST',
      body: JSON.stringify({ slug, frontmatter, content }),
    });
  }
  return request(`/writing/posts/${encodeURIComponent(slug)}`, {
    method: 'PUT',
    body: JSON.stringify({ frontmatter, content, newSlug }),
  });
}

export async function deletePost(
  slug: string,
): Promise<{ ok: boolean; error?: string }> {
  return request(`/writing/posts/${encodeURIComponent(slug)}`, {
    method: 'DELETE',
  });
}

export async function saveExternalWriting(
  items: WritingEntry[],
): Promise<{ ok: boolean; error?: string }> {
  return request('/writing/external', {
    method: 'PUT',
    body: JSON.stringify(items),
  });
}

export async function saveSpeaking(
  appearances: PortfolioData['speaking'],
): Promise<{ ok: boolean; error?: string }> {
  return request('/speaking', {
    method: 'PUT',
    body: JSON.stringify(appearances),
  });
}

export async function saveContact(
  contact: ContactItem[],
): Promise<{ ok: boolean; error?: string }> {
  return request('/contact', {
    method: 'PUT',
    body: JSON.stringify(contact),
  });
}

export async function uploadPortrait(base64: string): Promise<{
  ok: boolean;
  path?: string;
  width?: number;
  height?: number;
  error?: string;
}> {
  return request('/upload/portrait', {
    method: 'POST',
    body: JSON.stringify({ base64 }),
  }) as Promise<{
    ok: boolean;
    path?: string;
    width?: number;
    height?: number;
    error?: string;
  }>;
}

export async function uploadProjectScreenshot(
  filename: string,
  base64: string,
): Promise<{ ok: boolean; path?: string; error?: string }> {
  return request('/upload/project', {
    method: 'POST',
    body: JSON.stringify({ filename, base64 }),
  }) as Promise<{ ok: boolean; path?: string; error?: string }>;
}

export async function triggerRebuild(
  action: 'icons' | 'og' | 'build',
): Promise<{
  ok: boolean;
  action: string;
  exitCode?: number;
  stdout?: string;
  stderr?: string;
  error?: string;
}> {
  return request('/rebuild', {
    method: 'POST',
    body: JSON.stringify({ action }),
  }) as Promise<{
    ok: boolean;
    action: string;
    exitCode?: number;
    stdout?: string;
    stderr?: string;
    error?: string;
  }>;
}

export async function fetchGitStatus(): Promise<{
  ok: boolean;
  branch?: string;
  changedFiles?: string[];
  raw?: string;
  error?: string;
}> {
  return request('/git/status') as Promise<{
    ok: boolean;
    branch?: string;
    changedFiles?: string[];
    raw?: string;
    error?: string;
  }>;
}

export async function commitGitChanges(
  message: string,
  push = false,
): Promise<{
  ok: boolean;
  message?: string;
  commit?: string;
  push?: unknown;
  error?: string;
}> {
  return request('/git/commit', {
    method: 'POST',
    body: JSON.stringify({ message, push }),
  }) as Promise<{
    ok: boolean;
    message?: string;
    commit?: string;
    push?: unknown;
    error?: string;
  }>;
}
