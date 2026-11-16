/**
 * Public appearances: presentations, hackathon pitches, and competition demos.
 */

type AppearanceFormat = 'Panel' | 'Arsenal Lab' | 'Tech session' | 'Pitch';

export interface Appearance {
  /**
   * The session's own title, or the event's name.
   */
  title: string;
  format: AppearanceFormat;
  /** First day of the appearance. */
  date: string;
  /** City, as a reader would place the event. */
  place: string;
  /** What the title and format leave out. */
  desc: string;
  /** Public link for the event or organization. */
  link: string;
}

const appearances: Appearance[] = [
  {
    title: 'Smart India Hackathon 2026',
    format: 'Tech session',
    date: '2026-08-10',
    place: 'Pune',
    desc: 'Institutional-Level Qualification with an AI-based agricultural marketplace connecting farmers and wholesalers directly.',
    link: 'https://dypvp.edu.in/#sih2026',
  },
  {
    title: 'EVΛH Decentra Hackathon',
    format: 'Tech session',
    date: '2026-05-20',
    place: 'Pune',
    desc: '4th Place. Team Lead & Head Developer; cleared all three rounds with a privacy-focused portable digital environment with local AI.',
    link: 'https://dypvp.edu.in/#evah',
  },
  {
    title: 'EDSI Idea Validation Pitch — 1st Place',
    format: 'Tech session',
    date: '2026-03-15',
    place: 'Pune',
    desc: '1st Place. Team Lead & Head Developer for 8Minutes: an AI-powered mental wellness platform with an AI companion and mood-tracking concepts.',
    link: 'https://dypvp.edu.in/#edsi',
  },
];

/**
 * Newest first.
 */
export function getAppearances(): Appearance[] {
  return [...appearances].sort((a, b) => b.date.localeCompare(a.date));
}
