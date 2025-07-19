export type Student = {
  id: string;
  name: string;
  studentId: string;
};

export const students: Student[] = [
  { id: '1', name: 'Ana García', studentId: 'A01234567' },
  { id: '2', name: 'Carlos Rodríguez', studentId: 'A01234568' },
  { id: '3', name: 'Beatriz López', studentId: 'A01234569' },
  { id: '4', name: 'David Martínez', studentId: 'A01234570' },
  { id: '5', name: 'Elena Gómez', studentId: 'A01234571' },
];

export type Professor = {
  id: string;
  name: string;
  department: string;
  email: string;
  password?: string;
  role?: 'admin' | 'professor';
};

export const adminUser: Professor = {
  id: 'admin',
  name: 'Administrador SEPI',
  department: 'Administración del Sistema',
  email: 'admin@sepi.esime',
  password: '1234',
  role: 'admin',
};

export const professors: Professor[] = [
  { id: 'prof1', name: 'Dr. Alan Smith', department: 'Ciencias de la Computación', email: 'alan.smith@sepi.esime', password: 'tesis123', role: 'professor' },
  { id: 'prof2', name: 'Dra. Maria Jones', department: 'Ingeniería de Software', email: 'maria.jones@sepi.esime', password: 'tesis123', role: 'professor' },
  { id: 'prof3', name: 'Dr. David Williams', department: 'Sistemas Inteligentes', email: 'david.williams@sepi.esime', password: 'tesis123', role: 'professor' },
];


export const semesters = [
  'Primero',
  'Segundo',
  'Tercero',
  'Cuarto',
  'Quinto',
] as const;

export type Semester = (typeof semesters)[number];

type Criterion = {
    name: string;
    weight: number; // Weight is a value between 0 and 1
};

export const evaluationCriteria: Record<Semester, Criterion[]> = {
  Primero: [
      { name: 'Propuesta de Tesis (60%)', weight: 0.6 },
      { name: 'Presentación (30%)', weight: 0.3 },
      { name: 'Asistencia (10%)', weight: 0.1 },
  ],
  Segundo: [
      { name: 'Avance de Tesis (60%)', weight: 0.6 },
      { name: 'Presentación (30%)', weight: 0.3 },
      { name: 'Asistencia (10%)', weight: 0.1 },
  ],
  Tercero: [
      { name: 'Artículo de Congreso (60%)', weight: 0.6 },
      { name: 'Presentación (30%)', weight: 0.3 },
      { name: 'Asistencia (10%)', weight: 0.1 },
  ],
  Cuarto: [
      { name: 'Borrador de Tesis (60%)', weight: 0.6 },
      { name: 'Presentación (30%)', weight: 0.3 },
      { name: 'Asistencia (10%)', weight: 0.1 },
  ],
  Quinto: [
      { name: 'Artículo para Revista (60%)', weight: 0.6 },
      { name: 'Presentación (30%)', weight: 0.3 },
      { name: 'Asistencia (10%)', weight: 0.1 },
  ],
};

export const criteriaStrings: Record<Semester, string> = Object.entries(
  evaluationCriteria
).reduce((acc, [semester, criteria]) => {
  const criteriaNames = criteria.map(c => c.name).join(', ');
  acc[semester as Semester] = `${criteriaNames}. La presentación debe durar máximo 20 minutos y la sesión de preguntas y respuestas otros 20 minutos.`;
  return acc;
}, {} as Record<Semester, string>);


export type Evaluation = {
    id: string;
    studentName: string;
    semester: Semester;
    date: string;
    evaluator: string;
    overallScore: number;
};

export const mockEvaluations: Evaluation[] = [
    { id: 'eval1', studentName: 'Ana García', semester: 'Tercero', date: '2024-05-15', evaluator: 'Dr. Alan Smith', overallScore: 8 },
    { id: 'eval2', studentName: 'Carlos Rodríguez', semester: 'Tercero', date: '2024-05-15', evaluator: 'Dra. Maria Jones', overallScore: 9 },
    { id: 'eval3', studentName: 'Beatriz López', semester: 'Primero', date: '2023-12-10', evaluator: 'Dr. Alan Smith', overallScore: 8 },
    { id: 'eval4', studentName: 'David Martínez', semester: 'Cuarto', date: '2024-05-16', evaluator: 'Dr. David Williams', overallScore: 9.5 },
    { id: 'eval5', studentName: 'Ana García', semester: 'Segundo', date: '2023-05-20', evaluator: 'Dra. Maria Jones', overallScore: 9 },
    { id: 'eval6', studentName: 'Carlos Rodríguez', semester: 'Segundo', date: '2023-05-20', evaluator: 'Dr. Alan Smith', overallScore: 8.9 },
];
