module.exports = {
  // Entorno de pruebas
  testEnvironment: 'jsdom',

  // Rutas de tests
  testMatch: ['**/tests/**/*.test.js', '**/?(*.)+(spec|test).js'],

  // Cobertura de código
  collectCoverageFrom: [
    'js/**/*.js',
    'netlify/functions/**/*.js',
    '!js/i18n_*.js', // Excluir archivos de traducción
    '!**/node_modules/**',
    '!**/tests/**',
  ],

  // Umbrales de cobertura mínima
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 75,
      statements: 75,
    },
  },

  // Directorios a ignorar
  testPathIgnorePatterns: ['/node_modules/', '/.cache/'],

  // Configuración de timeout para tests lentos
  testTimeout: 15000,

  // Configuración para CI (Netlify)
  ci: process.env.CI === 'true',
  maxWorkers: process.env.CI === 'true' ? 2 : undefined,

  // Configuración para tests E2E con Puppeteer
  preset: undefined,

  // Transformaciones (sin TypeScript por ahora)
  transform: {},

  // Setup files
  setupFilesAfterEnv: [],

  // Verbose output
  verbose: true,

  // Mostrar cobertura en consola
  coverageReporters: ['text', 'text-summary', 'html', 'lcov'],

  // Directorio de salida de cobertura
  coverageDirectory: 'coverage',

  // Variables globales disponibles en tests
  globals: {
    NODE_ENV: 'test',
  },

  // Limpiar mocks automáticamente
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
