describe('User can log in and log out with One Login', () => {
  it('Should navigate to the onelogin screen and go through the current log in process', () => {
    // Currently assumes local dev auth setup
    cy.visit('');
    cy.url().should('include', '/login');

    cy.login_onelogin('testuser1', Cypress.env('AUTH_EMAIL'));

    // Logged in
    cy.url().should('include', '/home');

    // GOV.UK one login account link in header
    cy.get('header nav').should('contains.text', 'GOV.UK One Login');

    // Check homepage links
    cy.get('h2').should('contains.text', 'Care homes');
    cy.get('h2').should('contains.text', 'Population needs');

    // Sign out
    cy.logout();
    cy.url().should('include', '/signed-out');
    cy.get('h1').should('contains.text', 'You have signed out');

    // Going home forces redirect
    cy.visit('/home');
    cy.url().should('include', '/login');
  });

  it('Should redirect unknown users to access denied page', () => {
    // Currently assumes local dev auth setup
    cy.visit('');
    cy.url().should('include', '/login');

    cy.login_onelogin('unknownuser', 'unknown@unknown.com');

    cy.url().should('include', '/access-denied');
    cy.get('h1').should(
      'contains.text',
      'You do not have access to this service'
    );

    // Going home forces redirect
    cy.visit('/home');
    cy.url().should('include', '/login');
  });
});
