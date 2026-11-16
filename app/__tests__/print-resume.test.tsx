import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import courses from '@/data/resume/courses';
import degrees from '@/data/resume/degrees';
import work from '@/data/resume/work';
import ResumePage from '../resume/page';

// Job and degree links are printed as text, and course links remain PDF
// annotations, so all three need destinations that still mean something on paper.
describe('resume link data', () => {
  it('gives every company, school and course a lasting absolute URL', () => {
    for (const link of [
      ...work.map((job) => job.url),
      ...degrees.map((degree) => degree.link),
      ...courses.map((course) => course.link),
    ]) {
      const url = new URL(link);

      expect(['http:', 'https:']).toContain(url.protocol);
      expect(url.hostname).not.toBe('');
      // A `jsessionid` is bound to a server session that has expired.
      expect(link.toLowerCase()).not.toContain('jsessionid');
    }
  });

  it('renders a link for every course', () => {
    const { container } = render(<ResumePage />);

    expect(
      container.querySelectorAll('.course-container a[href]'),
    ).toHaveLength(courses.length);
  });

  // Company destinations are valid and stable.
  it.each([
    ['DevKraft', 'https://devkraft.in'],
    ['ZION, DYPIT', 'https://ziondit.online'],
  ])('uses a stable destination for company %s', (name, expected) => {
    expect(work.find((position) => position.name === name)?.url).toBe(expected);
  });

  // Course numbers, titles, and links are aligned.
  it.each([
    ['AIDS 201', 'Linear Algebra', 'https://dypvp.edu.in'],
    ['AIDS 203', 'Data Structures & Algorithms', 'https://dypvp.edu.in'],
    ['AIDS 206', 'Fundamentals of AI & ML', 'https://dypvp.edu.in'],
  ])('keeps %s aligned with its course record', (number, title, link) => {
    expect(courses.find((course) => course.number === number)).toMatchObject({
      title,
      link,
    });
  });
});

describe('resume print control', () => {
  it('opens the print dialog', () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => {});
    render(<ResumePage />);

    fireEvent.click(screen.getByRole('button', { name: 'Print / PDF' }));

    expect(print).toHaveBeenCalledOnce();
    print.mockRestore();
  });
});
