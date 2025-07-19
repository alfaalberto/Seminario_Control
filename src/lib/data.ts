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
    description: string;
    weight: number; // Weight is a value between 0 and 1
};

export const evaluationCriteria: Record<Semester, Criterion[]> = {
  Primero: [
      { name: 'Definición del Problema', description: 'Claridad y delimitación del problema a resolver.', weight: 0.20 },
      { name: 'Revisión del Estado del Arte', description: 'Pertinencia, actualidad y profundidad del análisis bibliográfico.', weight: 0.25 },
      { name: 'Justificación y Relevancia', description: 'Importancia del estudio en el contexto de la línea de investigación.', weight: 0.20 },
      { name: 'Hipótesis u Objetivo General', description: 'Claridad y coherencia con la problemática.', weight: 0.15 },
      { name: 'Viabilidad Técnica y Académica', description: 'Recursos disponibles, cronograma inicial y factibilidad.', weight: 0.20 },
  ],
  Segundo: [
      { name: 'Marco Teórico Profundizado', description: 'Aplicación de fundamentos de la línea elegida.', weight: 0.20 },
      { name: 'Metodología', description: 'Diseño experimental o de simulación, técnicas y herramientas.', weight: 0.25 },
      { name: 'Modelo Analítico o Computacional', description: 'Pertinencia del modelo propuesto y validación inicial.', weight: 0.20 },
      { name: 'Avances Prácticos o Simulados', description: 'Primeros resultados, gráficas, pruebas piloto.', weight: 0.20 },
      { name: 'Plan de Trabajo Ajustado', description: 'Actualización del cronograma y detección de riesgos.', weight: 0.15 },
  ],
  Tercero: [
      { name: 'Implementación Técnica/Prototipo', description: 'Montaje, codificación o fabricación de sistemas.', weight: 0.25 },
      { name: 'Análisis Intermedio de Resultados', description: 'Presentación de resultados significativos (simulados o experimentales).', weight: 0.25 },
      { name: 'Comparación con Estado del Arte', description: 'Evaluación frente a estándares o publicaciones previas.', weight: 0.15 },
      { name: 'Identificación de Problemas Técnicos', description: 'Análisis crítico y propuesta de soluciones.', weight: 0.15 },
      { name: 'Comunicación Técnica y Visual', description: 'Claridad en gráficas, tablas, ecuaciones y diagramas.', weight: 0.20 },
  ],
  Cuarto: [
      { name: 'Resultados Completos y Validados', description: 'Datos concluyentes con métodos rigurosos.', weight: 0.30 },
      { name: 'Discusión y Contribución Científica', description: 'Originalidad, impacto en la línea de investigación.', weight: 0.25 },
      { name: 'Redacción de Artículos o Tesis', description: 'Avances en manuscrito, estructura y estilo académico.', weight: 0.20 },
      { name: 'Publicaciones/Divulgación', description: 'Envío a congresos, revistas o patentes (si aplica).', weight: 0.15 },
      { name: 'Preparación para Defensa', description: 'Capacidad de explicar y defender el proyecto ante expertos.', weight: 0.10 },
  ],
  Quinto: [
      { name: 'Diagnóstico de Retrasos', description: 'Análisis realista de los factores que impidieron la conclusión.', weight: 0.20 },
      { name: 'Plan de Recuperación', description: 'Acciones específicas, metas semanales, responsables.', weight: 0.25 },
      { name: 'Nuevos Avances Técnicos', description: 'Resultados adicionales logrados tras el 4to semestre.', weight: 0.20 },
      { name: 'Impacto de la Ampliación', description: 'Valor agregado por el tiempo adicional.', weight: 0.15 },
      { name: 'Compromiso Académico', description: 'Puntualidad, cumplimiento de entregables y responsabilidad.', weight: 0.20 },
  ],
};

export const criteriaStrings: Record<Semester, string> = Object.entries(
  evaluationCriteria
).reduce((acc, [semester, criteria]) => {
  const criteriaDetails = criteria.map(c => `- ${c.name} (${c.weight * 100}%): ${c.description}`).join('\n');
  acc[semester as Semester] = `Criterios para el ${semester} Semestre:\n${criteriaDetails}`;
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
