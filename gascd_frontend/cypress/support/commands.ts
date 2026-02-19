/// <reference types="cypress" />

Cypress.Commands.add('logout', () => {
  cy.get('header ul a').contains('Sign out').click();
  cy.wait(500);
});

Cypress.Commands.add('metatag', (name: string) => {
  return cy.get(`head > meta[name="${name}"]`);
});

Cypress.Commands.add('login_onelogin', (email: string) => {
  cy.visit('/login');
  cy.get('button').contains('Agree and sign in').click();
  cy.get('input#sub').clear().type(email);
  cy.get('input#email').clear().type(email);
  cy.get('button').contains('Continue').click();
  cy.wait(500);
});
