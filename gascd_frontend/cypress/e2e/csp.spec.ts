describe('Security Headers', () => {
  it('should have the correct CSP configuration', () => {
    // 1. Intercept the main document request
    cy.intercept('GET', '/').as('home');

    // 2. Visit the site
    cy.visit('/');

    // 3. Wait for the request and check the headers
    cy.wait('@home').then((interception) => {
      const csp = interception.response.headers['content-security-policy'];

      // Check that the header exists
      expect(csp).to.exist;

      // Verify specific directives
      expect(csp).to.include("default-src 'self'");
      expect(csp).to.include("script-src 'self' 'unsafe-eval' 'unsafe-inline'");
      expect(csp).to.include("frame-ancestors 'none'");
    });
  });
});
