import { describe, expect, it, vi } from 'vitest';

import contact from '@/data/contact';
import profile from '@/data/profile.json';
import courses from '@/data/resume/courses';
import degrees from '@/data/resume/degrees';
import work from '@/data/resume/work';
import { sortPositions } from '@/lib/career';
import {
  buildJsonResume,
  serializeJsonResume,
  toPlainText,
} from '@/lib/resumeJson';

/** The schema's `iso8601` definition: YYYY, YYYY-MM, or YYYY-MM-DD. */
const ISO8601 =
  /^([1-2][0-9]{3}-[0-1][0-9]-[0-3][0-9]|[1-2][0-9]{3}-[0-1][0-9]|[1-2][0-9]{3})$/;

const resume = buildJsonResume();

describe('toPlainText', () => {
  it.each([
    ["see <a href='https://example.com'>the docs</a>", 'see the docs'],
    ['one\n    two\n\n  three ', 'one two three'],
  ])('flattens %s', (input, expected) => {
    expect(toPlainText(input)).toBe(expected);
  });

  it('leaves comparisons and generics alone', () => {
    // The same literal is the positive case in
    // `scripts/__tests__/verify-export.test.ts`: what this conversion keeps, the
    // export gate has to accept.
    const text = 'latency < 50ms and throughput > 1k with Map<string, number>';

    expect(toPlainText(text)).toBe(text);
  });
});

describe('json resume document', () => {
  it('declares the schema it conforms to', () => {
    expect(resume.$schema).toBe(
      'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json',
    );
  });

  it('builds basics from the shared profile facts', () => {
    expect(resume.basics).toMatchObject({
      label: profile.role,
      email: profile.email,
      // The display city, without asserting a country.
      location: { city: 'Pune' },
    });
  });

  it('lists every non-email contact as a profile with its handle', () => {
    expect(resume.basics.profiles).toHaveLength(
      contact.filter((item) => !item.link.startsWith('mailto:')).length,
    );
    expect(resume.basics.profiles).toContainEqual({
      network: 'GitHub',
      username: 'itsthemaverick',
      url: 'https://github.com/itsthemaverick',
    });
  });

  it('carries every position in résumé order, with no invented end date', () => {
    expect(resume.work.map((position) => position.name)).toEqual(
      sortPositions(work).map((position) => position.name),
    );
    expect(resume.work[0]).not.toHaveProperty('endDate');
  });

  // Summaries are Markdown with inline anchors, so this reads the real prose.
  it('keeps the anchor text of the real prose', () => {
    const prose = resume.work.flatMap((position) => [
      position.summary ?? '',
      ...(position.highlights ?? []),
    ]);

    expect(prose.join(' ')).toContain('Learning Management System');
  });

  it('uses schema-valid dates throughout', () => {
    for (const position of resume.work) {
      expect(position.startDate).toMatch(ISO8601);
      if (position.endDate) expect(position.endDate).toMatch(ISO8601);
    }
    for (const entry of resume.education) {
      expect(entry.endDate).toMatch(ISO8601);
    }
  });

  it('splits the degree string into studyType and area', () => {
    expect(resume.education).toHaveLength(degrees.length);
    expect(resume.education[0]).toMatchObject({
      institution: 'Dr. D. Y. Patil Institute of Technology, Pimpri, Pune',
      area: 'B.Tech in Artificial Intelligence & Data Science',
      endDate: '2029',
    });
  });

  // Cardinality across the whole document: per-entry assertions never look at a
  // duplicate. A school whose name contains another's is the case the real data
  // cannot express, and joining by containment would double every course.
  it('files each course under exactly one degree', async () => {
    expect(resume.education[0].courses).toContain('AIDS 201 - Linear Algebra');
    expect(
      resume.education.flatMap((entry) => entry.courses ?? []),
    ).toHaveLength(courses.length);

    vi.resetModules();
    vi.doMock('@/data/resume/degrees', () => ({
      default: [
        ...degrees,
        {
          school: 'Savitribai Phule Pune University',
          degree: 'M.S. Computer Science',
          link: 'https://unipune.ac.in',
          year: 2031,
        },
      ],
    }));

    try {
      const { buildJsonResume: buildWithSecondSchool } = await import(
        '@/lib/resumeJson'
      );
      const { education } = buildWithSecondSchool();

      expect(education).toHaveLength(degrees.length + 1);
      expect(education.flatMap((entry) => entry.courses ?? [])).toHaveLength(
        courses.length,
      );
      expect(education.at(-1)).not.toHaveProperty('courses');
    } finally {
      vi.doUnmock('@/data/resume/degrees');
      vi.resetModules();
    }
  });

  it('serializes to pretty-printed bytes that parse back', () => {
    const serialized = serializeJsonResume();

    expect(serialized).toMatch(/\n {2}"basics": \{[\s\S]*\n$/);
    expect(JSON.parse(serialized)).toEqual(resume);
  });
});
