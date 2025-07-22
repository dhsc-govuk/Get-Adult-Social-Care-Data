import { Config } from 'jest';

const config: Config = {
  testEnvironment: 'jest-fixed-jsdom',
  testMatch: ['<rootDir>/__tests__/**/*.(test|spec).(ts|tsx)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.jest.json' }],
  },
  moduleNameMapper: {
    '^@/test-utils/(.*)$': '<rootDir>/__tests__/utils/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^.+\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    d3: '<rootDir>/node_modules/d3/dist/d3.min.js',
    '^d3-(.*)$': '<rootDir>/node_modules/d3-$1/dist/d3-$1.min.js',
    // Mock out govuk JS for jest tests
    'govuk-frontend/js/govuk-frontend\.min\.js$':
      '<rootDir>/__tests__/__mocks__/govuk-frontend-mock.js',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  reporters: ['default'],
  // specified on the command line
  //collectCoverage: true,
  collectCoverageFrom: ['app/**/*.{js,ts,tsx}', 'src/**/*.{js,ts,tsx}'],
  coveragePathIgnorePatterns: [
    '/app/\\(protected\\)/help/',
    '/src/data/types/govuk-frontend.d.ts',
  ],
  // todo enable
  // coverageThreshold: {
  //   "global": {
  //     "branches": 80,
  //     "functions": 80,
  //     "lines": 80,
  //     "statements": 80
  //   }
  // }
};

export default config;
