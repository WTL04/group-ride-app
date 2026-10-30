module.exports = {
  preset: '@react-native/jest-preset',
  testPathIgnorePatterns: ['/node_modules/', '__tests__/fixtures\\.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation/.*|react-native-screens|react-native-safe-area-context)/)',
  ],
  setupFiles: ['./jest.setup.js'],
};
