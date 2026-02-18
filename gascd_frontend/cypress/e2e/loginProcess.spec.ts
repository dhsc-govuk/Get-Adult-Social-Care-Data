describe('User can log in and log out', () => {
  it('CP user should navigate to the homepage and go through the current log in process', () => {
    // Currently assumes local dev auth setup
    cy.visit('');
    cy.url().should('include', '/login');
    cy.visit('/home');
    cy.url().should('include', '/login');

    cy.login_onelogin(Cypress.env('cpl_user'));

    // Load the homepage
    cy.url().should('include', '/home');
    cy.get('h1').should('contains.text', 'Get adult social care data');

    // Check homepage links
    cy.get('h2').should('contains.text', 'Care provision');
    cy.get('h2').should('contains.text', 'Population needs');

    // Sign out
    cy.logout();
    cy.url().should('include', '/signed-out');
    cy.get('h1').should('contains.text', 'You have signed out');

    // Going home forces redirect
    cy.visit('/home');
    cy.url().should('include', '/login');
  });

  it('LA user should navigate to the homepage and go through the current log in process', () => {
    // Currently assumes local dev auth setup
    cy.visit('');
    cy.url().should('include', '/login');
    cy.visit('/home');
    cy.url().should('include', '/login');

    cy.login_onelogin(Cypress.env('la_user'));

    // Load the homepage
    cy.url().should('include', '/home');
    cy.get('h1').should('contains.text', 'Get adult social care data');

    // Check homepage links
    cy.get('h2').should('contains.text', 'Care provision');
    cy.get('h2').should('contains.text', 'Population needs');

    // Sign out
    cy.logout();
    cy.url().should('include', '/signed-out');
    cy.get('h1').should('contains.text', 'You have signed out');

    // Going home forces redirect
    cy.visit('/home');
    cy.url().should('include', '/login');
  });
});
