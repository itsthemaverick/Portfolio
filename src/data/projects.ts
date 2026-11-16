/**
 * The register of things I have built.
 *
 * Two groups, both kept deliberately:
 *
 * - `shipped` — selected production work Yashraj built, led, or contributed
 *   to, and can be pointed at.
 * - `archive` — student-era experiments and hackathons.
 *
 * Shipped entries cite either a role in `src/data/resume/work.ts` or the
 * source repository for a personal project. Résumé-backed dates and numeric
 * claims are cross-checked; repository evidence is reviewed when adding or
 * updating an entry. Archive entries are maintained here directly. Public
 * destinations still need live-link review.
 */
type ProjectStatus = 'shipped' | 'archive';

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
   * historical role named by `subtitle`: a project can continue after an
   * acquisition or employment transition. Drives the amber `Present` reading
   * and is mutually exclusive with `endDate`.
   */
  ongoing?: boolean;
  desc: string;
  /** Technologies named by the résumé or source repository. */
  tech?: string[];
  status: ProjectStatus;
}

/**
 * Hand-ordered, most recent activity first within each group. Live work leads,
 * then sorts by its own start date; finished work sorts by its end (or one-off)
 * date. `projects.test.ts` pins the complete comparator, including ties.
 */
const data: Project[] = [
  {
    title: 'Neural Network from Scratch in C',
    subtitle: 'Machine learning in C',
    link: 'https://github.com/itsthemaverick/neural-network-in-c',
    sourceRepository: 'https://github.com/itsthemaverick/neural-network-in-c',
    date: '2026-10-01',
    ongoing: true,
    desc: 'Implemented a neural network to explore the mechanics of neural computation: architecture, forward propagation, and learning without high-level ML frameworks.',
    tech: ['C'],
    status: 'shipped',
  },
  {
    title: 'Project JHEP',
    subtitle: 'SprougHub Foundation',
    link: 'https://github.com/itsthemaverick',
    sourceWork: 'SprougHub Foundation',
    date: '2026-09-01',
    ongoing: true,
    desc: 'AI-powered Learning Management System. Served as Project Lead, coordinating a 10-member team across frontend, backend, and AI/ML development.',
    tech: ['React', 'Node.js', 'FastAPI', 'AI/ML'],
    status: 'shipped',
  },
  {
    title: 'Deepreach',
    subtitle: 'DevKraft',
    link: 'https://devkraft.in',
    sourceWork: 'DevKraft',
    date: '2026-09-01',
    endDate: '2026-11-01',
    desc: 'Web-based company discovery and research workflow for identifying potential event sponsors using agentic AI workflows, prompt design, and guardrails.',
    tech: ['Python', 'Agentic AI', 'Prompt Design'],
    status: 'shipped',
  },
  {
    title: 'Credit Card Fraud Detection',
    subtitle: 'Random Forest vs. Isolation Forest',
    link: 'https://github.com/itsthemaverick/fraud-detection',
    sourceRepository: 'https://github.com/itsthemaverick/fraud-detection',
    date: '2026-08-01',
    desc: 'Explored supervised and unsupervised anomaly and fraud detection; compared model behaviour and evaluation metrics across Random Forest and Isolation Forest strategies.',
    tech: ['Python', 'Scikit-learn', 'Random Forest', 'Isolation Forest'],
    status: 'shipped',
  },
  {
    title: 'Malware Detection',
    subtitle: 'Logistic Regression · TF-IDF',
    link: 'https://github.com/itsthemaverick/malware-detection',
    sourceRepository: 'https://github.com/itsthemaverick/malware-detection',
    date: '2026-07-01',
    desc: 'Developed a text-based classification approach for malware-related detection; applied TF-IDF and Logistic Regression to investigate performance.',
    tech: ['Python', 'Scikit-learn', 'TF-IDF', 'Logistic Regression'],
    status: 'shipped',
  },
  {
    title: 'Text Classification',
    subtitle: 'Naive Bayes · Bag-of-Words vs. TF-IDF',
    link: 'https://github.com/itsthemaverick/text-classification',
    sourceRepository: 'https://github.com/itsthemaverick/text-classification',
    date: '2026-06-01',
    desc: 'Compared text representation methods and investigated how feature extraction influences text classification.',
    tech: ['Python', 'Naive Bayes', 'NLP'],
    status: 'shipped',
  },
  {
    title: 'Signal-to-Strategy',
    subtitle: 'User Behaviour Prediction',
    link: 'https://github.com/itsthemaverick/signal-to-strategy',
    sourceRepository: 'https://github.com/itsthemaverick/signal-to-strategy',
    date: '2026-05-01',
    desc: 'Developed an ML project identifying patterns in user behaviour and using predictions to inform strategy.',
    tech: ['Python', 'Machine Learning', 'Data Analysis'],
    status: 'shipped',
  },
  {
    title: 'ZION Event Website',
    subtitle: 'DYPIT College Tech Fest',
    link: 'https://ziondit.online',
    date: '2026-01-01',
    endDate: '2026-05-31',
    desc: 'Contributed to the ZION event website and organized a technology-based treasure hunt.',
    tech: ['Web Development', 'JavaScript'],
    status: 'archive',
  },
  {
    title: '8Minutes',
    subtitle: 'EDSI Idea Validation Pitch — 1st Place',
    link: 'https://github.com/itsthemaverick',
    date: '2026-03-15',
    desc: 'AI-powered mental wellness platform with an AI companion and mood-tracking concepts. Team Lead & Head Developer.',
    tech: ['AI Companion', 'Mental Wellness', 'Mobile'],
    status: 'archive',
  },
  {
    title: 'Sarthasangati Foundation Website',
    subtitle: 'Foundation Website',
    link: 'https://dypvp.edu.in',
    date: '2025-06-01',
    endDate: '2025-08-31',
    desc: 'Developed a website for the foundation and assisted with technical requirements.',
    tech: ['HTML/CSS', 'JavaScript'],
    status: 'archive',
  },
];

export default data;

/** The register: production work, most recent first. */
export const shipped = data.filter((project) => project.status === 'shipped');

/** Student-era history, most recent first. */
export const archive = data.filter((project) => project.status === 'archive');
