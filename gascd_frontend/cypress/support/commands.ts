/// <reference types="cypress" />

Cypress.Commands.add('login', () => {
  // Login with dummy auth
  cy.visit('/api/auth/local');
  cy.wait(500);
});

Cypress.Commands.add('logout', () => {
  cy.get('header ul a').contains('Sign out').click();
  cy.wait(500);
});

Cypress.Commands.add('metatag', (name: string) => {
  return cy.get(`head > meta[name="${name}"]`);
});

Cypress.Commands.add('login_onelogin', (username: string, email: string) => {
  cy.visit('/onelogin');
  cy.get('button').contains('Sign in with GOV.UK One Login').click();
  cy.get('input#sub').clear().type(username);
  cy.get('input#email').clear().type(email);
  cy.get('button').contains('Continue').click();
  cy.wait(500);
});
