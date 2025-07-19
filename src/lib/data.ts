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

export const evaluationCriteria: Record<Semester, string[]> = {
  Primero: ['Reporte Final (40%)', 'Presentación en Seminario (40%)', 'Asistencia (20%)'],
  Segundo: ['Reporte Final (40%)', 'Presentación en Seminario (40%)', 'Asistencia (20%)'],
  Tercero: ['Reporte Final (40%)', 'Presentación en Seminario (40%)', 'Asistencia (20%)'],
  Cuarto: ['Reporte Final (40%)', 'Presentación en Seminario (40%)', 'Asistencia (20%)'],
  Quinto: ['Reporte Final (40%)', 'Presentación en Seminario (40%)', 'Asistencia (20%)'],
};

export const criteriaStrings: Record<Semester, string> = {
    Primero: 'Reporte Final, Presentación en Seminario, y Asistencia. La presentación debe durar máximo 20 minutos y la sesión de preguntas y respuestas otros 20 minutos.',
    Segundo: 'Reporte Final, Presentación en Seminario, y Asistencia. La presentación debe durar máximo 20 minutos y la sesión de preguntas y respuestas otros 20 minutos.',
    Tercero: 'Reporte Final, Presentación en Seminario, y Asistencia. La presentación debe durar máximo 20 minutos y la sesión de preguntas y respuestas otros 20 minutos.',
    Cuarto: 'Reporte Final, Presentación en Seminario, y Asistencia. La presentación debe durar máximo 20 minutos y la sesión de preguntas y respuestas otros 20 minutos.',
    Quinto: 'Reporte Final, Presentación en Seminario, y Asistencia. La presentación debe durar máximo 20 minutos y la sesión de preguntas y respuestas otros 20 minutos.',
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
    { id: 'eval1', studentName: 'Ana García', semester: 'Tercero', date: '2024-05-15', evaluator: 'Dr. Alan Smith', overallScore: 8 },
    { id: 'eval2', studentName: 'Carlos Rodríguez', semester: 'Tercero', date: '2024-05-15', evaluator: 'Dra. Maria Jones', overallScore: 9 },
    { id: 'eval3', studentName: 'Beatriz López', semester: 'Primero', date: '2023-12-10', evaluator: 'Dr. Alan Smith', overallScore: 8 },
    { id: 'eval4', studentName: 'David Martínez', semester: 'Cuarto', date: '2024-05-16', evaluator: 'Dr. David Williams', overallScore: 9.5 },
    { id: 'eval5', studentName: 'Ana García', semester: 'Segundo', date: '2023-05-20', evaluator: 'Dra. Maria Jones', overallScore: 9 },
    { id: 'eval6', studentName: 'Carlos Rodríguez', semester: 'Segundo', date: '2023-05-20', evaluator: 'Dr. Alan Smith', overallScore: 8.9 },
];