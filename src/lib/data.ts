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
    scores: Record<string, number>;
    professorPrompt: string;
    aiComments: string;
};

export const mockEvaluations: Evaluation[] = [
    { id: 'eval1', studentName: 'Ana García', semester: 'Tercero', date: '2024-05-15', evaluator: 'Dr. Alan Smith', overallScore: 8, scores: {'Implementación Técnica/Prototipo': 8, 'Análisis Intermedio de Resultados': 8, 'Comparación con Estado del Arte': 8, 'Identificación de Problemas Técnicos': 8, 'Comunicación Técnica y Visual': 8}, professorPrompt: "La estudiante presenta avances sólidos pero necesita mejorar la comparativa con otros trabajos.", aiComments: "Se recomienda a la estudiante Ana García enfocarse en la sección de comparación con el estado del arte. Puede ser beneficioso incluir una tabla comparativa que resalte las innovaciones de su propuesta frente a 2 o 3 trabajos relevantes. Además, se sugiere profundizar en el análisis de los problemas técnicos encontrados, detallando las soluciones implementadas y su impacto en el resultado." },
    { id: 'eval2', studentName: 'Carlos Rodríguez', semester: 'Tercero', date: '2024-05-15', evaluator: 'Dra. Maria Jones', overallScore: 9, scores: {'Implementación Técnica/Prototipo': 9, 'Análisis Intermedio de Resultados': 9, 'Comparación con Estado del Arte': 9, 'Identificación de Problemas Técnicos': 9, 'Comunicación Técnica y Visual': 9}, professorPrompt: "Excelente presentación, muy clara y con resultados prometedores.", aiComments: "El estudiante Carlos Rodríguez ha demostrado un dominio excepcional en la comunicación técnica y visual de sus resultados. La implementación del prototipo es robusta y los resultados intermedios son significativos. Como área de mejora, podría explorar la identificación de problemas técnicos no resueltos aún, para mostrar una visión a futuro de su trabajo." },
    { id: 'eval3', studentName: 'Beatriz López', semester: 'Primero', date: '2023-12-10', evaluator: 'Dr. Alan Smith', overallScore: 8, scores: {'Definición del Problema': 8, 'Revisión del Estado del Arte': 8, 'Justificación y Relevancia': 8, 'Hipótesis u Objetivo General': 8, 'Viabilidad Técnica y Académica': 8}, professorPrompt: "Buena definición del problema, pero el estado del arte puede ser más actual.", aiComments: "La estudiante Beatriz López ha definido el problema con claridad. Para fortalecer su trabajo, se sugiere incorporar en la revisión del estado del arte artículos publicados en los últimos 2-3 años. Esto enriquecerá la justificación y relevancia de su proyecto, asegurando que su hipótesis esté alineada con las últimas tendencias de la investigación." },
    { id: 'eval4', studentName: 'David Martínez', semester: 'Cuarto', date: '2024-05-16', evaluator: 'Dr. David Williams', overallScore: 9.5, scores: {'Resultados Completos y Validados': 10, 'Discusión y Contribución Científica': 9, 'Redacción de Artículos o Tesis': 9, 'Publicaciones/Divulgación': 10, 'Preparación para Defensa': 9}, professorPrompt: "Resultados sobresalientes y ya tiene un envío a congreso. Felicitaciones.", aiComments: "Felicidades al estudiante David Martínez por sus resultados validados y su proactividad en la divulgación científica. La contribución es clara y significativa. Para la preparación de la defensa, se recomienda ensayar la presentación ante un público variado para refinar la capacidad de respuesta a preguntas fuera del guion técnico." },
    { id: 'eval5', studentName: 'Ana García', semester: 'Segundo', date: '2023-05-20', evaluator: 'Dra. Maria Jones', overallScore: 9, scores: {'Marco Teórico Profundizado': 9, 'Metodología': 9, 'Modelo Analítico o Computacional': 9, 'Avances Prácticos o Simulados': 9, 'Plan de Trabajo Ajustado': 9}, professorPrompt: "Metodología bien definida y buenos avances en la simulación.", aiComments: "La estudiante Ana García presenta un marco teórico sólido y una metodología bien estructurada. Los avances en la simulación son notables. Sería beneficioso que en el plan de trabajo ajustado se incluyera un análisis de riesgos más detallado, contemplando posibles desviaciones y planes de contingencia para cada uno." },
    { id: 'eval6', studentName: 'Carlos Rodríguez', semester: 'Segundo', date: '2023-05-20', evaluator: 'Dr. Alan Smith', overallScore: 8.9, scores: {'Marco Teórico Profundizado': 9, 'Metodología': 9, 'Modelo Analítico o Computacional': 9, 'Avances Prácticos o Simulados': 8.5, 'Plan de Trabajo Ajustado': 9}, professorPrompt: "Buen trabajo en general, los avances prácticos podrían ser más extensos.", aiComments: "El estudiante Carlos Rodríguez ha realizado un excelente trabajo en el modelado y la metodología. Para fortalecer los avances prácticos, se sugiere ampliar el número de pruebas o escenarios de simulación para dar mayor robustez a los resultados iniciales. El plan de trabajo está bien ajustado y es coherente." },
];
