/**
 * Datos de los modelos de desarrollo usados por el comparador.
 * Los puntajes van de 1 (bajo) a 5 (alto).
 */
export const CRITERIA = [
  { key: 'flexibilidad', label: 'Flexibilidad ante cambios' },
  { key: 'entregas', label: 'Velocidad de entregas' },
  { key: 'documentacion', label: 'Documentación' },
  { key: 'cliente', label: 'Participación del cliente' },
  { key: 'riesgos', label: 'Gestión de riesgos' },
  { key: 'pruebas', label: 'Integración de pruebas (SQA)' },
];

export const MODELS = {
  cascada: {
    name: 'Cascada',
    scores: { flexibilidad: 1, entregas: 1, documentacion: 5, cliente: 1, riesgos: 2, pruebas: 2 },
    ideal: 'proyectos con requisitos estables y bien definidos desde el inicio.',
  },
  v: {
    name: 'Modelo en V',
    scores: { flexibilidad: 2, entregas: 1, documentacion: 5, cliente: 2, riesgos: 3, pruebas: 5 },
    ideal: 'sistemas críticos donde cada fase necesita su verificación y validación.',
  },
  scrum: {
    name: 'Scrum',
    scores: { flexibilidad: 5, entregas: 4, documentacion: 2, cliente: 5, riesgos: 4, pruebas: 4 },
    ideal: 'productos con requisitos cambiantes y entregas iterativas en sprints.',
  },
  kanban: {
    name: 'Kanban',
    scores: { flexibilidad: 5, entregas: 5, documentacion: 2, cliente: 3, riesgos: 3, pruebas: 3 },
    ideal: 'equipos de soporte o mantenimiento con un flujo continuo de tareas.',
  },
  xp: {
    name: 'XP (Extreme Programming)',
    scores: { flexibilidad: 5, entregas: 5, documentacion: 1, cliente: 5, riesgos: 4, pruebas: 5 },
    ideal: 'equipos pequeños que priorizan la calidad técnica (TDD, pair programming).',
  },
};
