#!/usr/bin/env node

/**
 * Admin Companion Server for Next.js Portfolio Site
 *
 * Provides local API endpoints for the Admin Dashboard to manage:
 * - Profile data (`src/data/profile.json`)
 * - About page markdown & sections (`src/data/about.ts`)
 * - Resume work experience, education, skills, and courses (`src/data/resume/*.ts`)
 * - Projects register (`src/data/projects.ts`)
 * - Blog posts (`content/writing/*.md`) and external writing (`src/data/writing.ts`)
 * - Speaking appearances (`src/data/speaking.ts`)
 * - Contact & social profiles (`src/data/contact.ts`)
 * - Portrait & project image uploads with auto-sync to `SITE_IMAGE_DIMENSIONS`
 * - Automated asset rebuilding (`npm run icons`, `npm run og`, `npm run build`)
 * - Git status and committing
 */

import { exec } from 'node:child_process';
import { createHmac, randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, unlink, writeFile } from 'node:fs/promises';
import http from 'node:http';
import { basename, join, resolve } from 'node:path';
import vm from 'node:vm';
import { parseFrontmatter } from '../src/lib/frontmatter.mjs';

const ROOT = process.cwd();

// Load .env.local if present
const envLocalPath = resolve(ROOT, '.env.local');
if (existsSync(envLocalPath)) {
  try {
    const envContent = await readFile(envLocalPath, 'utf8');
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed
          .slice(eqIdx + 1)
          .trim()
          .replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  } catch (err) {
    console.warn('Could not read .env.local:', err.message);
  }
}

const PORT = parseInt(process.env.ADMIN_PORT || process.env.PORT || '3001', 10);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_SECRET =
  process.env.ADMIN_SECRET_KEY || 'portfolio-admin-secret-2026';

// Active session tokens in memory: Map<token, { user: string, expiresAt: number }>
const activeSessions = new Map();

function generateToken(user = 'admin') {
  const payload = `${user}:${Date.now()}:${randomBytes(16).toString('hex')}`;
  const signature = createHmac('sha256', ADMIN_SECRET)
    .update(payload)
    .digest('hex');
  const token = `${Buffer.from(payload).toString('base64url')}.${signature}`;
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  activeSessions.set(token, { user, expiresAt });
  return { token, expiresAt };
}

function verifyToken(token) {
  if (!token) return false;
  const session = activeSessions.get(token);
  if (session && session.expiresAt > Date.now()) {
    return true;
  }
  // Fallback signature check if server restarted
  try {
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) return false;
    const payload = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const expectedSig = createHmac('sha256', ADMIN_SECRET)
      .update(payload)
      .digest('hex');
    if (signature === expectedSig) {
      const parts = payload.split(':');
      const timestamp = parseInt(parts[1], 10);
      if (Date.now() - timestamp < 7 * 24 * 60 * 60 * 1000) {
        activeSessions.set(token, {
          user: parts[0],
          expiresAt: timestamp + 7 * 24 * 60 * 60 * 1000,
        });
        return true;
      }
    }
  } catch {
    return false;
  }
  return false;
}

function sendJson(res, statusCode, data) {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, X-Requested-With, X-Admin-Token',
  });
  res.end(body);
}

function sendError(res, statusCode, message, details = null) {
  sendJson(res, statusCode, { ok: false, error: message, details });
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 50 * 1024 * 1024) {
        // 50MB limit
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(new Error(`Invalid JSON: ${err.message}`));
      }
    });
    req.on('error', reject);
  });
}

function checkAuth(req, res) {
  const authHeader = req.headers.authorization || '';
  const customHeader = req.headers['x-admin-token'] || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : customHeader || null;

  if (!verifyToken(token)) {
    sendError(res, 401, 'Unauthorized. Please login to the Admin Dashboard.');
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// File paths
// ---------------------------------------------------------------------------
const PROFILE_PATH = resolve(ROOT, 'src/data/profile.json');
const ABOUT_PATH = resolve(ROOT, 'src/data/about.ts');
const WORK_PATH = resolve(ROOT, 'src/data/resume/work.ts');
const DEGREES_PATH = resolve(ROOT, 'src/data/resume/degrees.ts');
const SKILLS_PATH = resolve(ROOT, 'src/data/resume/skills.ts');
const COURSES_PATH = resolve(ROOT, 'src/data/resume/courses.ts');
const PROJECTS_PATH = resolve(ROOT, 'src/data/projects.ts');
const WRITING_EXTERNAL_PATH = resolve(ROOT, 'src/data/writing.ts');
const SPEAKING_PATH = resolve(ROOT, 'src/data/speaking.ts');
const CONTACT_PATH = resolve(ROOT, 'src/data/contact.ts');
const POSTS_DIR = resolve(ROOT, 'content/writing');
const UTILS_PATH = resolve(ROOT, 'src/lib/utils.ts');

// ---------------------------------------------------------------------------
// Data Readers using Node VM sandbox
// ---------------------------------------------------------------------------
async function readProfileData() {
  const raw = await readFile(PROFILE_PATH, 'utf8');
  return JSON.parse(raw);
}

async function readAboutData() {
  const raw = await readFile(ABOUT_PATH, 'utf8');
  const match = raw.match(/export const aboutMarkdown = `([\s\S]*?)`;/);
  const markdown = match
    ? match[1].replace(/\\`/g, '`').replace(/\\\$/g, '$').replace(/\\\\/g, '\\')
    : '';
  return { markdown };
}

async function readArrayFromTsFile(filePath, regex, context = {}) {
  const raw = await readFile(filePath, 'utf8');
  const match = raw.match(regex);
  if (!match) {
    throw new Error(
      `Could not find data array matching pattern in ${filePath}`,
    );
  }
  return vm.runInNewContext(match[1], context);
}

async function readWorkData() {
  return readArrayFromTsFile(
    WORK_PATH,
    /const\s+work[\s\S]*?=\s*(\[[\s\S]*?\]);/,
  );
}

async function readDegreesData() {
  return readArrayFromTsFile(
    DEGREES_PATH,
    /const\s+degrees[\s\S]*?=\s*(\[[\s\S]*?\]);/,
  );
}

async function readSkillsData() {
  return readArrayFromTsFile(
    SKILLS_PATH,
    /const\s+skills[\s\S]*?=\s*(\[[\s\S]*?\]);/,
  );
}

async function readCoursesData() {
  return readArrayFromTsFile(
    COURSES_PATH,
    /const\s+courses[\s\S]*?=\s*(\[[\s\S]*?\]);/,
  );
}

async function readProjectsData() {
  return readArrayFromTsFile(
    PROJECTS_PATH,
    /const\s+data[\s\S]*?=\s*(\[[\s\S]*?\]);/,
  );
}

async function readWritingExternalData() {
  return readArrayFromTsFile(
    WRITING_EXTERNAL_PATH,
    /const\s+data[\s\S]*?=\s*(\[[\s\S]*?\]);/,
  );
}

async function readSpeakingData() {
  return readArrayFromTsFile(
    SPEAKING_PATH,
    /const\s+appearances[\s\S]*?=\s*(\[[\s\S]*?\]);/,
  );
}

async function readContactData() {
  const profile = await readProfileData();
  return readArrayFromTsFile(
    CONTACT_PATH,
    /const\s+data[\s\S]*?=\s*(\[[\s\S]*?\]);/,
    { profile },
  );
}

async function readPostsData() {
  const files = await readdir(POSTS_DIR);
  const mdFiles = files.filter((f) => f.endsWith('.md'));
  const posts = [];

  for (const filename of mdFiles) {
    const slug = filename.replace(/\.md$/, '');
    const filepath = join(POSTS_DIR, filename);
    const raw = await readFile(filepath, 'utf8');
    const { data: frontmatter, content } = parseFrontmatter(raw);
    posts.push({
      slug,
      filename,
      frontmatter,
      content,
    });
  }

  // Sort newest first by date
  posts.sort((a, b) => {
    const dateA = a.frontmatter.date || '';
    const dateB = b.frontmatter.date || '';
    return dateB.localeCompare(dateA);
  });

  return posts;
}

// ---------------------------------------------------------------------------
// Data Writers & Serializers
// ---------------------------------------------------------------------------
function formatTsValue(val, indent = 2) {
  const pad = ' '.repeat(indent);
  if (val === null || val === undefined) return 'undefined';
  if (typeof val === 'string') return JSON.stringify(val);
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (Array.isArray(val)) {
    if (val.length === 0) return '[]';
    // Single line if short primitives
    if (
      val.every((v) => typeof v === 'string' || typeof v === 'number') &&
      val.length <= 4
    ) {
      return `[${val.map((v) => JSON.stringify(v)).join(', ')}]`;
    }
    const lines = val.map(
      (item) => `${pad}  ${formatTsValue(item, indent + 2)},`,
    );
    return `[\n${lines.join('\n')}\n${pad}]`;
  }
  if (typeof val === 'object') {
    const entries = Object.entries(val).filter(([, v]) => v !== undefined);
    if (entries.length === 0) return '{}';
    const lines = entries.map(([k, v]) => {
      const keyStr = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k)
        ? k
        : JSON.stringify(k);
      return `${pad}  ${keyStr}: ${formatTsValue(v, indent + 2)},`;
    });
    return `{\n${lines.join('\n')}\n${pad}}`;
  }
  return String(val);
}

async function writeWorkData(items) {
  const tsContent = `/** Based on the JSON Resume work item, with a local \`commitment\` extension. */
export interface Position {
  name: string;
  position: string;
  url: string;
  startDate: string;
  endDate?: string;
  /**
   * Marks an open-ended role that ran alongside the primary career. Omitted
   * means full-time; \`sortPositions\` uses this to keep an enduring side role
   * from outranking every later full-time position.
   */
  commitment?: 'part-time';
  summary?: string;
  highlights?: string[];
}

const work: Position[] = ${formatTsValue(items, 0)};

export default work;
`;
  await writeFile(WORK_PATH, tsContent, 'utf8');
}

async function writeDegreesData(items) {
  const tsContent = `export interface Degree {
  school: string;
  degree: string;
  link: string;
  year: number;
}

const degrees: Degree[] = ${formatTsValue(items, 0)};

export default degrees;
`;
  await writeFile(DEGREES_PATH, tsContent, 'utf8');
}

async function writeSkillsData(items) {
  const tsContent = `export interface Skill {
  title: string;
  competency: number;
  category: string[];
}

const skills: Skill[] = ${formatTsValue(items, 0)};

export default skills;
`;
  await writeFile(SKILLS_PATH, tsContent, 'utf8');
}

async function writeCoursesData(items) {
  const tsContent = `export interface Course {
  title: string;
  number: string;
  link: string;
  /**
   * Must match a \`Degree.school\` in \`src/data/resume/degrees.ts\` exactly.
   * \`src/lib/resumeJson.ts\` files coursework under the education entry with
   * this name, and it compares the two strings whole — a shortened form here
   * would silently drop the courses from \`/resume.json\`.
   */
  university: string;
}

const courses: Course[] = ${formatTsValue(items, 0)};

export default courses;
`;
  await writeFile(COURSES_PATH, tsContent, 'utf8');
}

async function writeProjectsData(items) {
  const tsContent = `type ProjectStatus = 'shipped' | 'archive';

export interface Project {
  title: string;
  /** Role, venue, or one-line positioning. Rendered as a mono label. */
  subtitle?: string;
  /**
   * Public destination for the work. Entries without one are rendered as
   * visibly inert rather than as cards that look clickable and are not.
   */
  link?: string;
  /** Résumé role that backs a shipped entry's dates and numeric claims. */
  sourceWork?: string;
  /** Source repository backing a personal project's dates and description. */
  sourceRepository?: string;
  /**
   * Screenshot, where one exists. Optional: the card and the register row are
   * both designed to read on type and rules alone, so a new entry does not
   * need art invented for it.
   */
  image?: string;
  /**
   * ISO date Yashraj's work on the project started, or a one-off shipped.
   * This is project activity, not necessarily a public launch date.
   */
  date: string;
  /** ISO date project activity ended. Omitted on one-offs and live work. */
  endDate?: string;
  /**
   * The project is still active. This is deliberately independent of the
   * historical role named by \`subtitle\`: a project can continue after an
   * acquisition or employment transition. Drives the amber \`Present\` reading
   * and is mutually exclusive with \`endDate\`.
   */
  ongoing?: boolean;
  desc: string;
  /** Technologies named by the résumé or source repository. */
  tech?: string[];
  status: ProjectStatus;
}

const data: Project[] = ${formatTsValue(items, 0)};

export const shipped = data.filter((project) => project.status === 'shipped');
export const archive = data.filter((project) => project.status === 'archive');

export default data;
`;
  await writeFile(PROJECTS_PATH, tsContent, 'utf8');
}

async function writeSpeakingData(items) {
  const tsContent = `type AppearanceFormat = 'Panel' | 'Arsenal Lab' | 'Tech session' | 'Pitch';

export interface Appearance {
  title: string;
  format: AppearanceFormat;
  date: string;
  place: string;
  desc: string;
  link: string;
}

const appearances: Appearance[] = ${formatTsValue(items, 0)};

export function getAppearances(): Appearance[] {
  return [...appearances].sort((a, b) => b.date.localeCompare(a.date));
}

export default appearances;
`;
  await writeFile(SPEAKING_PATH, tsContent, 'utf8');
}

async function writeWritingExternalData(items) {
  const tsContent = `export interface WritingEntry {
  title: string;
  url: string;
  date: string;
  description: string;
}

const data: WritingEntry[] = ${formatTsValue(items, 0)};

export default data;
`;
  await writeFile(WRITING_EXTERNAL_PATH, tsContent, 'utf8');
}

async function writeContactData(items) {
  const tsContent = `import profile from './profile.json';

export type ContactId = 'linkedin' | 'github' | 'email';

interface ContactItem {
  id: ContactId;
  link: string;
  label: string;
  icon: { viewBox: string; path: string };
}

const data: ContactItem[] = ${formatTsValue(items, 0)};

export const profiles = data.filter((item) => item.id !== 'email');

export default data;
`;
  await writeFile(CONTACT_PATH, tsContent, 'utf8');
}

async function writeAboutData(markdown) {
  // Ensure escaped backticks in markdown
  const safeMarkdown = markdown
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\${/g, '\\${');
  const tsContent = `export const aboutMarkdown = \`${safeMarkdown}\`;\n`;
  await writeFile(ABOUT_PATH, tsContent, 'utf8');
}

async function writePostFile(slug, frontmatter, content) {
  const frontmatterLines = ['---'];
  for (const [k, v] of Object.entries(frontmatter)) {
    if (v === undefined || v === '') continue;
    if (typeof v === 'boolean') {
      frontmatterLines.push(`${k}: ${v}`);
    } else {
      frontmatterLines.push(`${k}: '${String(v).replace(/'/g, "''")}'`);
    }
  }
  frontmatterLines.push('---');
  const fullContent = `${frontmatterLines.join('\n')}\n\n${content.trim()}\n`;
  const filepath = join(POSTS_DIR, `${slug}.md`);
  await writeFile(filepath, fullContent, 'utf8');
}

async function updateUtilsImageDimensions(width, height) {
  try {
    const raw = await readFile(UTILS_PATH, 'utf8');
    const updated = raw.replace(
      /export const SITE_IMAGE_DIMENSIONS = \{[\s\S]*?\} as const;/,
      `export const SITE_IMAGE_DIMENSIONS = {\n  width: ${width},\n  height: ${height},\n} as const;`,
    );
    await writeFile(UTILS_PATH, updated, 'utf8');
    console.log(
      `Updated SITE_IMAGE_DIMENSIONS to ${width}x${height} in src/lib/utils.ts`,
    );
  } catch (err) {
    console.error('Failed to update SITE_IMAGE_DIMENSIONS:', err);
  }
}

// ---------------------------------------------------------------------------
// Command Execution (Assets Rebuilding & Git)
// ---------------------------------------------------------------------------
function runCommandAsync(cmd) {
  return new Promise((resolve) => {
    exec(cmd, { cwd: ROOT }, (error, stdout, stderr) => {
      resolve({
        ok: !error,
        exitCode: error ? error.code || 1 : 0,
        stdout: stdout || '',
        stderr: stderr || '',
      });
    });
  });
}

// ---------------------------------------------------------------------------
// HTTP Server
// ---------------------------------------------------------------------------
const server = http.createServer(async (req, res) => {
  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers':
        'Content-Type, Authorization, X-Requested-With, X-Admin-Token',
      'Access-Control-Max-Age': '86400',
    });
    return res.end();
  }

  const url = new URL(
    req.url,
    `http://${req.headers.host || 'localhost:3001'}`,
  );
  const pathname = url.pathname;

  try {
    // 1. Health check
    if (req.method === 'GET' && pathname === '/api/admin/health') {
      return sendJson(res, 200, {
        ok: true,
        name: 'Portfolio Admin Companion',
        version: '1.0.0',
      });
    }

    // 2. Authentication: Login
    if (req.method === 'POST' && pathname === '/api/admin/login') {
      const body = await parseJsonBody(req);
      if (body.password === ADMIN_PASSWORD) {
        const { token, expiresAt } = generateToken('admin');
        return sendJson(res, 200, {
          ok: true,
          token,
          user: 'admin',
          expiresAt,
        });
      }
      return sendError(res, 401, 'Invalid password');
    }

    // 3. Authentication: Verify
    if (req.method === 'GET' && pathname === '/api/admin/verify') {
      if (!checkAuth(req, res)) return;
      return sendJson(res, 200, { ok: true, authenticated: true });
    }

    // 4. Authentication: Logout
    if (req.method === 'POST' && pathname === '/api/admin/logout') {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : null;
      if (token) activeSessions.delete(token);
      return sendJson(res, 200, { ok: true });
    }

    // -----------------------------------------------------------------------
    // All routes below require valid authentication
    // -----------------------------------------------------------------------
    if (!checkAuth(req, res)) return;

    // 5. Aggregate Data Fetch (All data points at once)
    if (req.method === 'GET' && pathname === '/api/admin/data') {
      const [
        profile,
        about,
        work,
        degrees,
        skills,
        courses,
        projects,
        posts,
        externalWriting,
        speaking,
        contact,
      ] = await Promise.all([
        readProfileData(),
        readAboutData(),
        readWorkData(),
        readDegreesData(),
        readSkillsData(),
        readCoursesData(),
        readProjectsData(),
        readPostsData(),
        readWritingExternalData(),
        readSpeakingData(),
        readContactData(),
      ]);

      return sendJson(res, 200, {
        ok: true,
        data: {
          profile,
          about,
          work,
          degrees,
          skills,
          courses,
          projects,
          posts,
          externalWriting,
          speaking,
          contact,
        },
      });
    }

    // 6. Profile CRUD
    if (pathname === '/api/admin/profile') {
      if (req.method === 'GET') {
        const profile = await readProfileData();
        return sendJson(res, 200, { ok: true, data: profile });
      }
      if (req.method === 'PUT') {
        const body = await parseJsonBody(req);
        await writeFile(
          PROFILE_PATH,
          JSON.stringify(body, null, 2) + '\n',
          'utf8',
        );
        return sendJson(res, 200, { ok: true, data: body });
      }
    }

    // 7. About Page CRUD
    if (pathname === '/api/admin/about') {
      if (req.method === 'GET') {
        const about = await readAboutData();
        return sendJson(res, 200, { ok: true, data: about });
      }
      if (req.method === 'PUT') {
        const body = await parseJsonBody(req);
        if (typeof body.markdown !== 'string') {
          return sendError(res, 400, 'Missing "markdown" string in payload');
        }
        await writeAboutData(body.markdown);
        return sendJson(res, 200, {
          ok: true,
          data: { markdown: body.markdown },
        });
      }
    }

    // 8. Resume: Work
    if (pathname === '/api/admin/resume/work') {
      if (req.method === 'GET') {
        const work = await readWorkData();
        return sendJson(res, 200, { ok: true, data: work });
      }
      if (req.method === 'PUT') {
        const body = await parseJsonBody(req);
        if (!Array.isArray(body))
          return sendError(res, 400, 'Expected an array of Position');
        await writeWorkData(body);
        return sendJson(res, 200, { ok: true, data: body });
      }
    }

    // 9. Resume: Degrees
    if (pathname === '/api/admin/resume/degrees') {
      if (req.method === 'GET') {
        const degrees = await readDegreesData();
        return sendJson(res, 200, { ok: true, data: degrees });
      }
      if (req.method === 'PUT') {
        const body = await parseJsonBody(req);
        if (!Array.isArray(body))
          return sendError(res, 400, 'Expected an array of Degree');
        await writeDegreesData(body);
        return sendJson(res, 200, { ok: true, data: body });
      }
    }

    // 10. Resume: Skills
    if (pathname === '/api/admin/resume/skills') {
      if (req.method === 'GET') {
        const skills = await readSkillsData();
        return sendJson(res, 200, { ok: true, data: skills });
      }
      if (req.method === 'PUT') {
        const body = await parseJsonBody(req);
        if (!Array.isArray(body))
          return sendError(res, 400, 'Expected an array of Skill');
        await writeSkillsData(body);
        return sendJson(res, 200, { ok: true, data: body });
      }
    }

    // 11. Resume: Courses
    if (pathname === '/api/admin/resume/courses') {
      if (req.method === 'GET') {
        const courses = await readCoursesData();
        return sendJson(res, 200, { ok: true, data: courses });
      }
      if (req.method === 'PUT') {
        const body = await parseJsonBody(req);
        if (!Array.isArray(body))
          return sendError(res, 400, 'Expected an array of Course');
        await writeCoursesData(body);
        return sendJson(res, 200, { ok: true, data: body });
      }
    }

    // 12. Projects Register
    if (pathname === '/api/admin/projects') {
      if (req.method === 'GET') {
        const projects = await readProjectsData();
        return sendJson(res, 200, { ok: true, data: projects });
      }
      if (req.method === 'PUT') {
        const body = await parseJsonBody(req);
        if (!Array.isArray(body))
          return sendError(res, 400, 'Expected an array of Project');
        await writeProjectsData(body);
        return sendJson(res, 200, { ok: true, data: body });
      }
    }

    // 13. Blog Posts (content/writing/*.md)
    if (pathname === '/api/admin/writing/posts') {
      if (req.method === 'GET') {
        const posts = await readPostsData();
        return sendJson(res, 200, { ok: true, data: posts });
      }
      if (req.method === 'POST') {
        const body = await parseJsonBody(req);
        const { slug, frontmatter, content } = body;
        if (!slug || !frontmatter?.title) {
          return sendError(res, 400, 'Missing slug or title for post');
        }
        await writePostFile(slug, frontmatter, content || '');
        return sendJson(res, 201, {
          ok: true,
          data: { slug, frontmatter, content },
        });
      }
    }

    // Individual post CRUD: /api/admin/writing/posts/:slug
    if (pathname.startsWith('/api/admin/writing/posts/')) {
      const slug = decodeURIComponent(
        pathname.slice('/api/admin/writing/posts/'.length),
      );
      const filepath = join(POSTS_DIR, `${slug}.md`);

      if (req.method === 'GET') {
        if (!existsSync(filepath)) return sendError(res, 404, 'Post not found');
        const raw = await readFile(filepath, 'utf8');
        const { data: frontmatter, content } = parseFrontmatter(raw);
        return sendJson(res, 200, {
          ok: true,
          data: { slug, frontmatter, content },
        });
      }

      if (req.method === 'PUT') {
        const body = await parseJsonBody(req);
        const newSlug = body.newSlug || slug;
        await writePostFile(newSlug, body.frontmatter, body.content || '');
        if (newSlug !== slug && existsSync(filepath)) {
          await unlink(filepath);
        }
        return sendJson(res, 200, {
          ok: true,
          data: {
            slug: newSlug,
            frontmatter: body.frontmatter,
            content: body.content,
          },
        });
      }

      if (req.method === 'DELETE') {
        if (existsSync(filepath)) {
          await unlink(filepath);
          return sendJson(res, 200, {
            ok: true,
            message: `Deleted ${slug}.md`,
          });
        }
        return sendError(res, 404, 'Post not found');
      }
    }

    // 14. External Writing & Patents
    if (pathname === '/api/admin/writing/external') {
      if (req.method === 'GET') {
        const ext = await readWritingExternalData();
        return sendJson(res, 200, { ok: true, data: ext });
      }
      if (req.method === 'PUT') {
        const body = await parseJsonBody(req);
        if (!Array.isArray(body))
          return sendError(res, 400, 'Expected an array of WritingEntry');
        await writeWritingExternalData(body);
        return sendJson(res, 200, { ok: true, data: body });
      }
    }

    // 15. Speaking & Appearances
    if (pathname === '/api/admin/speaking') {
      if (req.method === 'GET') {
        const appearances = await readSpeakingData();
        return sendJson(res, 200, { ok: true, data: appearances });
      }
      if (req.method === 'PUT') {
        const body = await parseJsonBody(req);
        if (!Array.isArray(body))
          return sendError(res, 400, 'Expected an array of Appearance');
        await writeSpeakingData(body);
        return sendJson(res, 200, { ok: true, data: body });
      }
    }

    // 16. Contact & Social Profiles
    if (pathname === '/api/admin/contact') {
      if (req.method === 'GET') {
        const contact = await readContactData();
        return sendJson(res, 200, { ok: true, data: contact });
      }
      if (req.method === 'PUT') {
        const body = await parseJsonBody(req);
        if (!Array.isArray(body))
          return sendError(res, 400, 'Expected an array of ContactItem');
        await writeContactData(body);
        return sendJson(res, 200, { ok: true, data: body });
      }
    }

    // 17. Image Upload: Portrait (public/images/me.jpg)
    if (req.method === 'POST' && pathname === '/api/admin/upload/portrait') {
      const body = await parseJsonBody(req);
      if (!body.base64) {
        return sendError(res, 400, 'Missing "base64" image string in payload');
      }

      const base64Data = body.base64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const targetPath = resolve(ROOT, 'public/images/me.jpg');

      await writeFile(targetPath, buffer);

      // Measure dimensions using sharp
      let width = 863;
      let height = 864;
      try {
        const sharp = (await import('sharp')).default;
        const metadata = await sharp(buffer).metadata();
        width = metadata.width || width;
        height = metadata.height || height;
        await updateUtilsImageDimensions(width, height);
      } catch (err) {
        console.warn(
          'Could not measure portrait dimensions with sharp:',
          err.message,
        );
      }

      return sendJson(res, 200, {
        ok: true,
        path: '/images/me.jpg',
        width,
        height,
      });
    }

    // 18. Image Upload: Project Screenshot (public/images/projects/<filename>)
    if (req.method === 'POST' && pathname === '/api/admin/upload/project') {
      const body = await parseJsonBody(req);
      if (!body.base64 || !body.filename) {
        return sendError(res, 400, 'Missing "base64" or "filename" in payload');
      }

      const safeFilename = basename(body.filename).replace(
        /[^a-zA-Z0-9._-]/g,
        '-',
      );
      const base64Data = body.base64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const targetDir = resolve(ROOT, 'public/images/projects');
      await mkdir(targetDir, { recursive: true });
      const targetPath = join(targetDir, safeFilename);

      await writeFile(targetPath, buffer);

      return sendJson(res, 200, {
        ok: true,
        path: `/images/projects/${safeFilename}`,
        filename: safeFilename,
      });
    }

    // 19. Asset Rebuilding Triggers: npm run icons, npm run og, npm run build
    if (req.method === 'POST' && pathname === '/api/admin/rebuild') {
      const body = await parseJsonBody(req);
      const action = body.action; // 'icons' | 'og' | 'build'
      let cmd = '';

      if (action === 'icons') {
        cmd = 'npm run icons';
      } else if (action === 'og') {
        cmd = 'npm run og';
      } else if (action === 'build') {
        cmd = 'npm run build';
      } else {
        return sendError(
          res,
          400,
          `Unknown rebuild action: ${action}. Allowed: icons, og, build`,
        );
      }

      console.log(`[Admin] Executing command: ${cmd}`);
      const result = await runCommandAsync(cmd);
      return sendJson(res, 200, { ok: result.ok, action, ...result });
    }

    // 20. Git Status
    if (req.method === 'GET' && pathname === '/api/admin/git/status') {
      const statusRes = await runCommandAsync('git status --short');
      const branchRes = await runCommandAsync('git branch --show-current');
      return sendJson(res, 200, {
        ok: true,
        branch: branchRes.stdout.trim(),
        changedFiles: statusRes.stdout.trim().split('\n').filter(Boolean),
        raw: statusRes.stdout,
      });
    }

    // 21. Git Commit
    if (req.method === 'POST' && pathname === '/api/admin/git/commit') {
      const body = await parseJsonBody(req);
      const message =
        body.message ||
        'feat(content): update portfolio content via admin dashboard';

      const addRes = await runCommandAsync('git add -A');
      if (!addRes.ok) {
        return sendError(res, 500, 'Git add failed', addRes);
      }

      const commitRes = await runCommandAsync(
        `git commit -m "${message.replace(/"/g, '\\"')}"`,
      );
      if (!commitRes.ok) {
        return sendError(res, 500, 'Git commit failed', commitRes);
      }

      let pushRes = null;
      if (body.push) {
        pushRes = await runCommandAsync('git push');
      }

      return sendJson(res, 200, {
        ok: true,
        message,
        commit: commitRes.stdout,
        push: pushRes,
      });
    }

    // Not found
    return sendError(res, 404, `Endpoint ${pathname} not found`);
  } catch (err) {
    console.error(`[Admin Server Error]`, err);
    return sendError(res, 500, `Server internal error: ${err.message}`);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`  Portfolio Admin Companion Server running`);
  console.log(`  Local Endpoint: http://localhost:${PORT}/api/admin`);
  console.log(`  Health Check:   http://localhost:${PORT}/api/admin/health`);
  console.log(`======================================================\n`);
});
