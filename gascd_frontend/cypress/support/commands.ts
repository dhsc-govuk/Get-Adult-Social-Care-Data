/// <reference types="cypress" />

Cypress.Commands.add('login', () => {
  // Login with dummy auth
  cy.visit('/api/auth/local');
  cy.wait(500);
});
