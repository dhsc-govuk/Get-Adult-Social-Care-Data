describe('User can set location', () => {
  it('CPL user should navigate to the location select page and change the location', () => {
    cy.login_onelogin(Cypress.env('cpl_user'));

    // test cpl user already has location set up
    cy.get('#navigation .govuk-service-navigation__link-change')
      .should('contains.text', 'Change')
      .click();
    cy.url().should('include', '/location-select');

    // Verify that we are on the location select page
    cy.get('h1').should('contains.text', 'Select a location');
    cy.get('label').contains('Test Care Provider Location 1').click();
    cy.get('button').contains('Apply changes').click();

    cy.url().should('include', '/home');

    // Location has been updated
    cy.get('#navigation').should(
      'contains.text',
      'Test Care Provider Location'
    );
  });

  it('CP user should navigate to the location select page and change the location', () => {
    cy.login_onelogin(Cypress.env('cp_user'));

    // test cp user does not have location yet
    cy.visit('/location-select');

    // Verify that we are on the location select page
    cy.get('h1').should('contains.text', 'Select a location');
    cy.get('label').contains('Test Care Provider Location 1').click();
    cy.get('button').contains('Apply changes').click();

    cy.url().should('include', '/home');

    // Location has been updated
    cy.get('#navigation').should(
      'contains.text',
      'Test Care Provider Location'
    );
    cy.get('#navigation .govuk-service-navigation__link-change')
      .should('contains.text', 'Change')
      .click();
    cy.url().should('include', '/location-select');
  });

  it('LA user should have location set already', () => {
    cy.login_onelogin(Cypress.env('la_user'));
    cy.url().should('include', '/home');

    cy.get('#navigation .govuk-service-navigation__link-change').should(
      'not.exist'
    );
    cy.get('[data-testid="selected-location"]').should('exist');
  });
});
