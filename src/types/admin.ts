export interface ProfileData {
  name: string;
  role: string;
  employer: string;
  focus: string;
  birthDate: string;
  computingSince: number;
  countriesVisited: number;
  currentCity: string;
  email: string;
}

export interface AboutSection {
  title: string;
  body: string;
}

export interface Position {
  name: string;
  position: string;
  url: string;
  startDate: string;
  endDate?: string;
  commitment?: 'part-time';
  summary?: string;
  highlights?: string[];
}

export interface Degree {
  school: string;
  degree: string;
  link: string;
  year: number;
}

export interface Skill {
  title: string;
  competency: number;
  category: string[];
}

export interface Course {
  title: string;
  number: string;
  link: string;
  university: string;
}

export type ProjectStatus = 'shipped' | 'archive';

export interface Project {
  title: string;
  subtitle?: string;
  link?: string;
  sourceWork?: string;
  sourceRepository?: string;
  image?: string;
  date: string;
  endDate?: string;
  ongoing?: boolean;
  desc: string;
  tech?: string[];
  status: ProjectStatus;
}

export interface PostFrontmatter {
  title: string;
  date: string;
  description: string;
  draft?: boolean;
  canonicalUrl?: string;
  image?: string;
}

export interface PostItem {
  slug: string;
  filename: string;
  frontmatter: PostFrontmatter;
  content: string;
}

export interface WritingEntry {
  title: string;
  url: string;
  date: string;
  description: string;
}

export type AppearanceFormat =
  | 'Panel'
  | 'Arsenal Lab'
  | 'Tech session'
  | 'Pitch';

export interface Appearance {
  title: string;
  format: AppearanceFormat;
  date: string;
  place: string;
  desc: string;
  link: string;
}

export type ContactId = 'linkedin' | 'github' | 'email';

export interface ContactItem {
  id: ContactId;
  link: string;
  label: string;
  icon: { viewBox: string; path: string };
}

export interface PortfolioData {
  profile: ProfileData;
  about: { markdown: string };
  work: Position[];
  degrees: Degree[];
  skills: Skill[];
  courses: Course[];
  projects: Project[];
  posts: PostItem[];
  externalWriting: WritingEntry[];
  speaking: Appearance[];
  contact: ContactItem[];
}

export type ConnectionMode = 'local' | 'github';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}
