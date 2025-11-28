describe('User can navigate the key parts of the site', () => {
  it('Should navigate to the homepage and go through the current log in process', () => {
    // Currently assumes local dev auth setup
    cy.visit('');
    cy.url().should('include', '/login');

    // Login with dummy auth
    cy.get('.govuk-button').contains('Agree and sign in').click();
    cy.get('input[type="email"]').type('example@example.com');
    cy.get('input[type="password"]').type(Cypress.env('APPLICATION_PASSWORD'));
    cy.get('button').contains('Sign in with dummy-creds').click();

    // Load the homepage
    cy.url().should('include', '/home');
    cy.get('h1').should('contains.text', 'Get adult social care data');

    // Check homepage links
    cy.get('h2').should('contains.text', 'Care homes');
    cy.get('h2').should('contains.text', 'Population needs');

    // Load the current needs page
    cy.get('a').contains('Care home beds and occupancy levels').click();
    cy.url().should(
      'include',
      '/topics/residential-care/provision-and-occupancy/data'
    );

    // Check the footer disclaimer
    cy.get('footer a').contains('Disclaimer').click();
    cy.url().should('include', '/disclaimer');
    cy.get('h1').should('contains.text', 'Disclaimer');

    // Home link in header
    cy.get('section.govuk-service-navigation a')
      .contains('Get adult social care data')
      .click();
    cy.url().should('include', '/home');

    // Check the footer privacy policy
    cy.get('footer a').contains('Privacy').click();
    cy.url().should('include', '/privacy-policy');
    cy.get('h1').should('contains.text', 'Privacy notice');

    // Home link in header
    cy.get('section.govuk-service-navigation a')
      .contains('Get adult social care data')
      .click();
    cy.url().should('include', '/home');

    // Sign out
    cy.get('button').contains('Sign out').click();
    cy.url().should('include', '/login');

    // Going home forces redirect
    cy.visit('/home');
    cy.url().should('include', '/login');
  });
});
