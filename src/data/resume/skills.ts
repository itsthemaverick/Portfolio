export interface Skill {
  title: string;
  competency: number;
  category: string[];
}

const skills: Skill[] = [
  // Languages
  {
    title: 'C',
    competency: 5,
    category: ['Languages'],
  },
  {
    title: 'Python',
    competency: 4,
    category: ['Languages'],
  },
  {
    title: 'JavaScript',
    competency: 4,
    category: ['Languages'],
  },
  {
    title: 'C++',
    competency: 3,
    category: ['Languages'],
  },
  {
    title: 'Java',
    competency: 3,
    category: ['Languages'],
  },
  {
    title: 'Rust',
    competency: 3,
    category: ['Languages'],
  },
  // ML & Scientific Computing
  {
    title: 'PyTorch',
    competency: 4,
    category: ['ML Engineering'],
  },
  {
    title: 'TensorFlow',
    competency: 4,
    category: ['ML Engineering'],
  },
  {
    title: 'Scikit-learn',
    competency: 4,
    category: ['ML Engineering'],
  },
  {
    title: 'NumPy',
    competency: 5,
    category: ['ML Engineering'],
  },
  {
    title: 'Pandas',
    competency: 5,
    category: ['ML Engineering'],
  },
  {
    title: 'SciPy',
    competency: 4,
    category: ['ML Engineering'],
  },
  {
    title: 'OpenCV',
    competency: 4,
    category: ['ML Engineering'],
  },
  {
    title: 'Keras',
    competency: 4,
    category: ['ML Engineering'],
  },
  // Data Analysis & Visualization
  {
    title: 'Matplotlib',
    competency: 4,
    category: ['Data Analysis'],
  },
  {
    title: 'Seaborn',
    competency: 4,
    category: ['Data Analysis'],
  },
  {
    title: 'Jupyter Notebook',
    competency: 4,
    category: ['Data Analysis'],
  },
  // Web & Backend Development
  {
    title: 'FastAPI',
    competency: 4,
    category: ['Web Development'],
  },
  {
    title: 'React',
    competency: 4,
    category: ['Web Development'],
  },
  {
    title: 'Node.js',
    competency: 4,
    category: ['Web Development'],
  },
  {
    title: 'Express',
    competency: 4,
    category: ['Web Development'],
  },
  {
    title: 'Django',
    competency: 3,
    category: ['Web Development'],
  },
  // Databases
  {
    title: 'MongoDB',
    competency: 4,
    category: ['Databases'],
  },
  {
    title: 'MySQL',
    competency: 3,
    category: ['Databases'],
  },
  {
    title: 'SQL',
    competency: 3,
    category: ['Databases'],
  },
  // Infrastructure & Tools
  {
    title: 'Git',
    competency: 5,
    category: ['Tools'],
  },
  {
    title: 'Docker',
    competency: 4,
    category: ['Tools'],
  },
];

export { skills };
