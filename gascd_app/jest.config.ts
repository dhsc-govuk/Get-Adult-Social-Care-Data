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
};

export default config;
