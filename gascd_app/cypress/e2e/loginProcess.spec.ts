describe('Azure AD B2C Login Test', () => {
  it('should login and go to the present-demand page', () => {
    cy.log(Cypress.env('AZURE_AD_TENANT_ID'));
    cy.loginWithB2C().then(() => {
      cy.visit('/');
      cy.contains('Present demand').should('be.visible');
    });
  });
});

describe('Variables', () => {
  it('should print env variables', () => {
    cy.log('AZURE_AD_TENANT_NAME:', Cypress.env('AZURE_AD_TENANT_NAME'));
    cy.log('AZURE_AD_CLIENT_ID:', Cypress.env('AZURE_AD_CLIENT_ID'));
    cy.log('AZURE_AD_CLIENT_SECRET:', Cypress.env('AZURE_AD_CLIENT_SECRET'));
  });
});
