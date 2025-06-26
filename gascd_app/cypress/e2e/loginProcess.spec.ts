describe('User can follow the current login process', () => {
  it('Should navigate to the homepage and go through the current log in process', () => {
    // Currently assumes local dev auth setup
    cy.visit('');
    cy.url().should('include', '/login');

    cy.get('.govuk-button').contains('Agree and sign in').click();
    cy.get('input[type="email"]').type('example@example.com')
    cy.get('button').contains('Sign in with dummy-creds').click();

    cy.url().should('include', '/present-demand');
  });
});