describe('User can set consent', () => {
  it('Should navigate to the consent page and set consent to true', () => {
    cy.login_onelogin(Cypress.env('cpl_user'));
    cy.visit('/consent');

    cy.get('h1').should('contains.text', 'Can we send you email');
    cy.get('label').contains('Yes').click();
    cy.get('button').contains('Continue').click();
    cy.url().should('include', '/home');
  });

  it('Should navigate to the consent page and set consent to false', () => {
    cy.login_onelogin(Cypress.env('cpl_user'));
    cy.visit('/consent');

    cy.get('h1').should('contains.text', 'Can we send you email');
    cy.get('label').contains('No').click();
    cy.get('button').contains('Continue').click();
    cy.url().should('include', '/home');
  });
});
