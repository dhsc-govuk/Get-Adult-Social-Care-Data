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
