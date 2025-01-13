let accessToken;

describe('Azure Authentication', () => {
  before(() => {
    cy.request({
      method: 'POST',
      url: `https://login.microsoftonline.com/${Cypress.env('AZURE_AD_TENANT_ID')}/oauth2/v2.0/token`,
      form: true,
      body: {
        grant_type: 'client_credentials',
        client_id: Cypress.env('AZURE_AD_CLIENT_ID'),
        client_secret: Cypress.env('AZURE_AD_CLIENT_SECRET'),
        scope: 'https://graph.microsoft.com/.default',
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      accessToken = response.body.access_token;

      cy.visit('', {
        onBeforeLoad(win) {
          win.localStorage.setItem('authToken', accessToken);
          // cy.setCookie('authCookieName', accessToken);
        },
      });
    });
  });
});
