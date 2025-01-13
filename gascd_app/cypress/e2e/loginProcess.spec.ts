describe('User can follow the current login process', () => {
  it('Should navigate to the homepage and go through the current log in process', () => {
    // login validation is not currently set

    cy.visit('');

    cy.get('.govuk-link').contains('Login').click();
    cy.url().should('include', '/login');

    cy.contains('label', 'Enter your email address')
      .siblings('input')
      .type('Example@example.com');

    cy.contains('label', 'Enter your password')
      .siblings('input')
      .type('Password');

    cy.get('.govuk-button').contains('Login').click();

    cy.url().should('include', 'home');
  });
});
