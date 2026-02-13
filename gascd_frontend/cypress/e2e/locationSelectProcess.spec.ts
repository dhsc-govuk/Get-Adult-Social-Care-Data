describe('User can set location', () => {
  it('Should navigate to the location select page and change the location', () => {
    cy.login_onelogin(Cypress.env('cpl_user'));
    cy.visit('/location-select');

    // Verify that we are on the location select page
    cy.get('h1').should('contains.text', 'Select a location');
    cy.get('label').contains('Test Care Provider Location 1').click();
    cy.get('button').contains('Apply changes').click();

    cy.url().should('include', '/home');
  });
});
