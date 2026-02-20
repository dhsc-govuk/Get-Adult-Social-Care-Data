describe('User can accept terms', () => {
  it('Should navigate to the terms page and accept the terms', () => {
    cy.login_onelogin(Cypress.env('cpl_user'));
    cy.visit('/accept-terms');

    cy.get('h1').should('contains.text', 'Terms of use');
    cy.get('button').contains('Agree').click();
    cy.url().should('include', '/home');
  });
});
