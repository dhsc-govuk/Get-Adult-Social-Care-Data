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

  it('should have application insights domains in CSP configuration', () => {
    cy.intercept('GET', '/').as('home');
    cy.visit('/');

    cy.wait('@home').then((interception) => {
      const csp = interception.response.headers['content-security-policy'];

      // Check that the header exists
      expect(csp).to.exist;

      // Check for application insights domains in config
      expect(csp).to.include(
        "connect-src 'self' *.applicationinsights.azure.com *.applicationinsights.microsoft.com *.services.visualstudio.com *.monitor.azure.com"
      );
      expect(csp).to.include(
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' js.monitor.azure.com az416426.vo.msecnd.net"
      );
    });
  });

  it('should not return nextjs service header', () => {
    // 1. Intercept the main document request
    cy.intercept('GET', '/').as('home');

    // 2. Visit the site
    cy.visit('/');

    // 3. Wait for the request and check the headers
    cy.wait('@home').then((interception) => {
      const csp = interception.response.headers['x-powered-by'];
      // Check that the header is turned off
      expect(csp).not.to.exist;
    });
  });
});
