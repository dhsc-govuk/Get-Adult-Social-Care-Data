import { Config } from 'jest';

const config: Config = {
  testEnvironment: 'jest-fixed-jsdom',
  testMatch: ['<rootDir>/__tests__/**/*.(test|spec).(ts|tsx)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.jest.json' }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/test-utils/(.*)$': '<rootDir>/tests/utils/$1',
    '^.+\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  reporters: ['default'],
  collectCoverage: true,
  collectCoverageFrom: [
    "app/**/*.{js,ts,tsx}",
    "src/**/*.{js,ts,tsx}"
  ],
  coveragePathIgnorePatterns: [
    "/app/\\(authentication\\)/registration/",
    "/app/\\(protected\\)/help/",
    "/src/data/types/govuk-frontend.d.ts"
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
