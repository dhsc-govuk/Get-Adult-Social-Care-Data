// Mock the 'initAll' from govuk-frontend js as we don't need it
// for jest tests
module.exports = {
  initAll: jest.fn(),
};
