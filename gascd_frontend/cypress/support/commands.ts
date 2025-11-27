/// <reference types="cypress" />

function loginViaAAD(username: string, password: string) {
  cy.visit('http://dapalpha-dev-app.azurewebsites.net/');
  // cy.visit('http://localhost:3000/')
  cy.get('button#signIn').click();

  // Login to your AAD tenant.
  cy.origin(
    'login.microsoftonline.com',
    {
      args: {
        username,
      },
    },
    ({ username }) => {
      cy.get('input[type="email"]').type(username, {
        log: false,
      });
      cy.get('input[type="submit"]').click();
    }
  );

  // depending on the user and how they are registered with Microsoft, the origin may go to live.com
  cy.origin(
    'login.live.com',
    {
      args: {
        password,
      },
    },
    ({ password }) => {
      cy.get('input[type="password"]').type(password, {
        log: false,
      });
      cy.get('input[type="submit"]').click();
      cy.get('#idBtn_Back').click();
    }
  );

  // Ensure Microsoft has redirected us back to the sample app with our logged in user.
  cy.url().should('equal', 'http://localhost:3000/');
  cy.get('#welcome-div').should(
    'contain',
    `Welcome ${Cypress.env('aad_username')}!`
  );
}

Cypress.Commands.add('loginToAAD', (username: string, password: string) => {
  const log = Cypress.log({
    displayName: 'Azure Active Directory Login',
    message: [`Authenticating | ${username}`],
    autoEnd: false,
  });
  log.snapshot('before');

  loginViaAAD(username, password);

  log.snapshot('after');
  log.end();
});

Cypress.Commands.add('login', () => {
  const options = {
    method: 'POST',
    url: `https://login.microsoftonline.com/${Cypress.env('AZURE_AD_TENANT_ID')}/oauth2/v2.0/token`,
    form: true,
    body: {
      client_id: Cypress.env('AZURE_AD_CLIENT_ID'),
      scope: 'https://graph.microsoft.com/.default',
      username: Cypress.env('aad_username'),
      password: Cypress.env('aad_password'),
      grant_type: 'password',
    },
  };

  cy.request(options).then((response) => {
    response.body.type = 'azure';
    const authValue = JSON.stringify(response.body);
    window.localStorage.setItem('auth', authValue);
  });
});

Cypress.Commands.add('metatag', (name: string) => {
  return cy.get(`head > meta[name="${name}"]`);
});
