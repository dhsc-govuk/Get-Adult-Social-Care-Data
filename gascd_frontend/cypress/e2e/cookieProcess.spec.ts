import { COOKIE_CONSENT_NAME } from '../../src/constants';

describe('User can set cookies', () => {
  it('Should navigate to the homepage and reject cookies', () => {
    // Currently assumes local dev auth setup
    cy.visit('');
    cy.url().should('include', '/login');

    cy.login();

    // Load the homepage
    cy.url().should('include', '/home');
    cy.get('h1').should('contains.text', 'Get adult social care data');
    cy.get('h2').should('contains.text', 'Cookies');

    // Reject cookies
    cy.get('button').contains('Reject analytics cookies').click();
    cy.get('#cookie-reject-message').should(
      'contains.text',
      "You've rejected analytics cookies."
    );
    cy.getCookie(COOKIE_CONSENT_NAME).should('have.property', 'value', 'false');

    // Hide cookie message
    cy.get('button').contains('Hide cookie message').click();
    cy.get('#cookie-reject-message').should('not.exist');
  });

  it('Should navigate to the homepage and accept cookies', () => {
    // Currently assumes local dev auth setup
    cy.visit('');
    cy.url().should('include', '/login');

    // Login with dummy auth
    cy.login();

    // Load the homepage
    cy.url().should('include', '/home');
    cy.get('h1').should('contains.text', 'Get adult social care data');
    cy.get('h2').should('contains.text', 'Cookies');

    // Accept cookies
    cy.get('button').contains('Accept analytics cookies').click();
    cy.get('#cookie-accept-message').should(
      'contains.text',
      "You've accepted analytics cookies."
    );
    cy.getCookie(COOKIE_CONSENT_NAME).should('have.property', 'value', 'true');

    // Hide cookie message
    cy.get('button').contains('Hide cookie message').click();
    cy.get('#cookie-accept-message').should('not.exist');
  });

  it('Should navigate to the homepage and go to the cookie page', () => {
    // Currently assumes local dev auth setup
    cy.visit('');
    cy.url().should('include', '/login');

    cy.login();

    // Load the homepage
    cy.url().should('include', '/home');
    cy.get('h1').should('contains.text', 'Get adult social care data');
    cy.get('h2').should('contains.text', 'Cookies');

    // Click cookies link
    cy.get('a').contains('View cookies').click();
    cy.url().should('include', '/cookies');
  });

  it('Should set cookies from cookie page', () => {
    // Currently assumes local dev auth setup
    cy.visit('');
    cy.url().should('include', '/login');

    // Login with dummy auth
    cy.login();

    // Load the homepage
    cy.url().should('include', '/home');
    cy.get('h1').should('contains.text', 'Get adult social care data');
    cy.get('h2').should('contains.text', 'Cookies');

    // Click cookies link
    cy.get('a').contains('View cookies').click();
    cy.url().should('include', '/cookies');

    // Set cookies to accept
    cy.get('input#radio-yes').check();
    cy.get('button').contains('Save cookie settings').click();
    cy.getCookie(COOKIE_CONSENT_NAME).should('have.property', 'value', 'true');

    // Check success message
    cy.get('.govuk-notification-banner__heading').should(
      'contains.text',
      'set your cookie preferences.'
    );

    // Set cookies to reject
    cy.get('input#radio-no').check();
    cy.get('button').contains('Save cookie settings').click();
    cy.getCookie(COOKIE_CONSENT_NAME).should('have.property', 'value', 'false');

    // Check success message
    cy.get('.govuk-notification-banner__heading').should(
      'contains.text',
      'set your cookie preferences.'
    );
  });
});
