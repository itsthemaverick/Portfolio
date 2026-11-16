export interface Course {
  title: string;
  number: string;
  link: string;
  /**
   * Must match a `Degree.school` in `src/data/resume/degrees.ts` exactly.
   * `src/lib/resumeJson.ts` files coursework under the education entry with
   * this name, and it compares the two strings whole — a shortened form here
   * would silently drop the courses from `/resume.json`.
   */
  university: string;
}

const courses: Course[] = [
  {
    title: 'Linear Algebra',
    number: 'AIDS 201',
    link: 'https://dypvp.edu.in',
    university: 'Dr. D. Y. Patil Institute of Technology, Pimpri, Pune',
  },
  {
    title: 'Calculus',
    number: 'AIDS 202',
    link: 'https://dypvp.edu.in',
    university: 'Dr. D. Y. Patil Institute of Technology, Pimpri, Pune',
  },
  {
    title: 'Data Structures & Algorithms',
    number: 'AIDS 203',
    link: 'https://dypvp.edu.in',
    university: 'Dr. D. Y. Patil Institute of Technology, Pimpri, Pune',
  },
  {
    title: 'Digital Electronics & Computer Organization',
    number: 'AIDS 204',
    link: 'https://dypvp.edu.in',
    university: 'Dr. D. Y. Patil Institute of Technology, Pimpri, Pune',
  },
  {
    title: 'Operating Systems',
    number: 'AIDS 205',
    link: 'https://dypvp.edu.in',
    university: 'Dr. D. Y. Patil Institute of Technology, Pimpri, Pune',
  },
  {
    title: 'Fundamentals of AI & ML',
    number: 'AIDS 206',
    link: 'https://dypvp.edu.in',
    university: 'Dr. D. Y. Patil Institute of Technology, Pimpri, Pune',
  },
];

export default courses;
