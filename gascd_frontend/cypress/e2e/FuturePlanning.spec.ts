it('CP User navigate to the Future planning section and be redirected', () => {
  cy.login_onelogin(Cypress.env('cpl_user'));
  cy.visit('/topics/future-planning/subtopics');

  // Should be redirected to homepage
  cy.url().should('include', '/home');
  cy.get('h2').should('not.contains.text', 'Future planning');

  cy.visit('/topics/future-planning/la-funding-planning/data');
  // Should be redirected to homepage
  cy.url().should('include', '/home');
});

it('LA user Should navigate to the Future planning section and check the contents', () => {
  cy.login_onelogin(Cypress.env('la_user'));
  cy.get('h2').should('contains.text', 'Future planning');

  cy.visit('/topics/future-planning/subtopics');

  cy.url().should('include', '/topics/future-planning/subtopics');
  cy.get('h1').should('contains.text', 'Future planning');

  cy.visit('/topics/future-planning/la-funding-planning/data');
  // XXX test for the content here when it arrives
  cy.url().should(
    'include',
    '/topics/future-planning/la-funding-planning/data'
  );
});
