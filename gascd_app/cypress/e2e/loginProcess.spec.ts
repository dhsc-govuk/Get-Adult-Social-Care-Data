describe('User can navigate the key parts of the site', () => {
  it('Should navigate to the homepage and go through the current log in process', () => {
    // Currently assumes local dev auth setup
    cy.visit('');
    cy.url().should('include', '/login');

    // Login with dummy auth
    cy.get('.govuk-button').contains('Agree and sign in').click();
    cy.get('input[type="email"]').type('example@example.com');
    cy.get('button').contains('Sign in with dummy-creds').click();

    // Load the homepage
    cy.url().should('include', '/home');
    cy.get('h1').should('contains.text', 'Get adult social care data');

    // Check homepage links
    cy.get('h2').should(
      'contains.text',
      'Current population needs and capacity'
    );
    cy.get('h2').should('contains.text', 'Map of population age percentages');

    // Load the current needs page
    cy.get('a').contains('Current population needs and capacity').click();
    cy.url().should('include', '/present-demand');

    // Head back to the homepage
    cy.get('.govuk-back-link').click();

    // Load the map page
    cy.get('a').contains('Map of population age percentages').click();
    cy.url().should('include', '/population-age');

    // Head back to the homepage
    cy.get('.govuk-back-link').click();
    cy.url().should('include', '/home');
  });
});
