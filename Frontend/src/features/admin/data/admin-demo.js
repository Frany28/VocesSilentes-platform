const names = [
  ['Ana', 'Pérez'],
  ['Luis', 'Gómez'],
  ['Sofía', 'Díaz'],
  ['María', 'López'],
  ['Carlos', 'Ruiz'],
  ['Elena', 'Torres'],
  ['Pedro', 'Vega'],
  ['Laura', 'Rojas'],
  ['Diego', 'Silva'],
  ['Lucía', 'Mora'],
  ['Mateo', 'León'],
  ['Paula', 'Gil'],
];

/** Cuentas sintéticas del diseño; nunca se envían a la base como fixtures. */
export const demoUsers = names.map(([firstName, lastName], index) => ({
  id: `demo-user-${index + 1}`,
  firstName,
  lastName,
  username: `${firstName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')}_${index + 1}`,
  email: `${firstName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')}@ejemplo.com`,
  role: index === 1 ? 'ADMIN' : 'USER',
  isActive: index < 10,
  emailVerified: false,
  isDeleted: false,
  deletedAt: null,
  lockedUntil: null,
  failedLoginAttempts: 0,
  createdAt: '2026-10-08T14:30:00Z',
  updatedAt: '2026-10-09T18:50:00Z',
  source: 'demo',
}));
const subjects = [
  'Video de saludo no carga',
  'Ejercicio muestra una opción repetida',
  'Referencia visual poco clara',
  'La página tarda en cargar',
  'No se ve la referencia',
];
/** Reportes sintéticos; todas sus acciones permanecen en memoria y están identificadas. */
export const demoReports = names.map((_, index) => ({
  id: `demo-report-${index + 1}`,
  reference: `REP-${String(index + 1).padStart(3, '0')}`,
  title: subjects[index % subjects.length],
  category: 'CONTENT',
  status: index < 5 ? 'PENDING' : 'RESOLVED',
  author: 'Ana Pérez',
  username: 'ana_1',
  module: 'Saludos y presentaciones',
  lesson: 'Saludos básicos',
  exercise: null,
  description:
    'Al abrir la lección, el video permanece en negro y no puedo ver la referencia. ' +
    'Volví a intentarlo, pero sigue igual.',
  internalComment: '',
  createdAt: '2026-10-08T15:20:00Z',
  updatedAt: '2026-10-08T15:20:00Z',
  resolvedBy: index < 5 ? null : 'Luis Gómez',
  resolvedAt: index < 5 ? null : '2026-10-09T18:30:00Z',
  source: 'demo',
}));
