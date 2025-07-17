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
  password?: string;
};

export const professors: Professor[] = [
  { id: 'prof1', name: 'Dr. Alan Smith', department: 'Ciencias de la Computación', password: 'tesis123' },
  { id: 'prof2', name: 'Dra. Maria Jones', department: 'Ingeniería de Software', password: 'tesis123' },
  { id: 'prof3', name: 'Dr. David Williams', department: 'Sistemas Inteligentes', password: 'tesis123' },
];


export const semesters = [
  'Primero',
  'Segundo',
  'Tercero',
  'Cuarto',
  'Quinto',
] as const;

export type Semester = (typeof semesters)[number];

export const evaluationCriteria: Record<Semester, string[]> = {
  Primero: ['Claridad del problema', 'Objetivos', 'Justificación', 'Metodología preliminar'],
  Segundo: ['Avances metodológicos', 'Primeros resultados', 'Coherencia objetivos-resultados'],
  Tercero: ['Resultados intermedios', 'Análisis crítico', 'Validación de resultados'],
  Cuarto: ['Resultados finales', 'Discusión exhaustiva', 'Conclusiones preliminares'],
  Quinto: ['Justificación de la extensión', 'Resultados conclusivos adicionales', 'Estrategia clara de finalización'],
};

export const criteriaStrings: Record<Semester, string> = {
    Primero: 'Claridad del problema, objetivos, justificación y metodología preliminar.',
    Segundo: 'Avances metodológicos, primeros resultados, coherencia objetivos-resultados.',
    Tercero: 'Resultados intermedios, análisis crítico y validación de resultados.',
    Cuarto: 'Resultados finales, discusión exhaustiva, conclusiones preliminares.',
    Quinto: 'Justificación de la extensión, resultados conclusivos adicionales, estrategia clara de finalización.',
}

export type Evaluation = {
    id: string;
    studentName: string;
    semester: Semester;
    date: string;
    evaluator: string;
    overallScore: number;
};

export const mockEvaluations: Evaluation[] = [
    { id: 'eval1', studentName: 'Ana García', semester: 'Tercero', date: '2024-05-15', evaluator: 'Dr. Alan Smith', overallScore: 88 },
    { id: 'eval2', studentName: 'Carlos Rodríguez', semester: 'Tercero', date: '2024-05-15', evaluator: 'Dra. Maria Jones', overallScore: 92 },
    { id: 'eval3', studentName: 'Beatriz López', semester: 'Primero', date: '2023-12-10', evaluator: 'Dr. Alan Smith', overallScore: 85 },
    { id: 'eval4', studentName: 'David Martínez', semester: 'Cuarto', date: '2024-05-16', evaluator: 'Dr. David Williams', overallScore: 95 },
    { id: 'eval5', studentName: 'Ana García', semester: 'Segundo', date: '2023-05-20', evaluator: 'Dra. Maria Jones', overallScore: 90 },
    { id: 'eval6', studentName: 'Carlos Rodríguez', semester: 'Segundo', date: '2023-05-20', evaluator: 'Dr. Alan Smith', overallScore: 89 },
];
