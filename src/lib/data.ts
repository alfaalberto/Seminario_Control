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

export const semesters = [
  'First',
  'Second',
  'Third',
  'Fourth',
  'Fifth',
] as const;

export type Semester = (typeof semesters)[number];

export const evaluationCriteria: Record<Semester, string[]> = {
  First: ['Clarity of the problem', 'Objectives', 'Justification', 'Preliminary methodology'],
  Second: ['Methodological advances', 'First results', 'Coherence objectives-results'],
  Third: ['Intermediate results', 'Critical analysis', 'Validation of results'],
  Fourth: ['Final results', 'Exhaustive discussion', 'Preliminary conclusions'],
  Fifth: ['Justification of extension', 'Additional conclusive results', 'Clear completion strategy'],
};

export const criteriaStrings: Record<Semester, string> = {
    First: 'Clarity of the problem, objectives, justification and preliminary methodology.',
    Second: 'Methodological advances, first results, coherence objectives-results.',
    Third: 'Intermediate results, critical analysis and validation of results.',
    Fourth: 'Final results, exhaustive discussion, preliminary conclusions.',
    Fifth: 'Justification of extension, additional conclusive results, clear strategy of finalization.',
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
    { id: 'eval1', studentName: 'Ana García', semester: 'Third', date: '2024-05-15', evaluator: 'Dr. Smith', overallScore: 88 },
    { id: 'eval2', studentName: 'Carlos Rodríguez', semester: 'Third', date: '2024-05-15', evaluator: 'Dr. Jones', overallScore: 92 },
    { id: 'eval3', studentName: 'Beatriz López', semester: 'First', date: '2023-12-10', evaluator: 'Dr. Smith', overallScore: 85 },
    { id: 'eval4', studentName: 'David Martínez', semester: 'Fourth', date: '2024-05-16', evaluator: 'Dr. Williams', overallScore: 95 },
    { id: 'eval5', studentName: 'Ana García', semester: 'Second', date: '2023-05-20', evaluator: 'Dr. Jones', overallScore: 90 },
    { id: 'eval6', studentName: 'Carlos Rodríguez', semester: 'Second', date: '2023-05-20', evaluator: 'Dr. Smith', overallScore: 89 },
];
