module.exports = {
  preset: '@react-native/jest-preset',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  maxWorkers: 1,
  testTimeout: 15000,
};
