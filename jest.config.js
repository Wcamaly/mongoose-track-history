// jest.config.js
module.exports = {
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest' // Transform TypeScript files
  },
  moduleNameMapper: {
    // Add if you need to mock static file imports like CSS or images
    '\\.(css|less|png|jpg)$': 'mock-file'
  },
  testEnvironment: 'node' // or 'jsdom' if your tests depend on DOM APIs
}
