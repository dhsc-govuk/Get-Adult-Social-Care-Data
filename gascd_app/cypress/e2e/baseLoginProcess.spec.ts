describe('User can follow the current login process', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage;
  });
  it('Should navigate to the homepage and go through the current log in process', () => {
    // cy.session('b2c login', () => {
    cy.visit('');
    cy.get('.govuk-button').click();

    // cy.contains('Sign in',{ timeout: 30000})
    cy.origin('https://dhscgascauthdev.b2clogin.com/', () => {
      cy.get('#email').type(Cypress.env('CYPRESS_TEST_LOGIN'));
      cy.get('#password').type(Cypress.env('CYPRESS_TEST_PASSWORD'));
      cy.get('#next').click();
    });

    // cy.intercept('POST', '**/oauth2/v2.0/token', (req) => {
    //     console.log('Intercepted token request', req);
    // }).as('getToken');
    // cy.wait('@getToken').then((interception) => {
    //     const {access_token, id_token} = interception.response.body

    //     cy.window().then((win) => {
    //         win.localStorage.setItem('accessToken', access_token);
    //         win.localStorage.setItem('idToken', id_token);
    //     });
    // })
    // cy.wait(5000);

    // cy.visit('http://localhost:300/present-demand');

    // cy.url().should('include', 'home');

    // })
  });
});
