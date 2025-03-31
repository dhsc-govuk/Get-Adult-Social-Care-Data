/// <reference types="cypress" />

// function loginViaAAD(username: string, password: string) {
//   cy.visit('http://dapalpha-dev-app.azurewebsites.net/');
//   // cy.visit('http://localhost:3000/')
//   cy.get('button#signIn').click();

//   // Login to your AAD tenant.
//   cy.origin(
//     'login.microsoftonline.com',
//     {
//       args: {
//         username,
//       },
//     },
//     ({ username }) => {
//       cy.get('input[type="email"]').type(username, {
//         log: false,
//       });
//       cy.get('input[type="submit"]').click();
//     }
//   );

//   // depending on the user and how they are registered with Microsoft, the origin may go to live.com
//   cy.origin(
//     'login.live.com',
//     {
//       args: {
//         password,
//       },
//     },
//     ({ password }) => {
//       cy.get('input[type="password"]').type(password, {
//         log: false,
//       });
//       cy.get('input[type="submit"]').click();
//       cy.get('#idBtn_Back').click();
//     }
//   );

//   // Ensure Microsoft has redirected us back to the sample app with our logged in user.
//   cy.url().should('equal', 'http://localhost:3000/');
//   cy.get('#welcome-div').should(
//     'contain',
//     `Welcome ${Cypress.env('aad_username')}!`
//   );
// }

// Cypress.Commands.add('loginToAAD', (username: string, password: string) => {
//   const log = Cypress.log({
//     displayName: 'Azure Active Directory Login',
//     message: [`Authenticating | ${username}`],
//     autoEnd: false,
//   });
//   log.snapshot('before');

//   loginViaAAD(username, password);

//   log.snapshot('after');
//   log.end();
// });

// Cypress.Commands.add('login', () => {
//   const options = {
//     method: 'POST',
//     url: `https://login.microsoftonline.com/${Cypress.env('AZURE_AD_TENANT_ID')}/oauth2/v2.0/token`,
//     form: true,
//     body: {
//       client_id: Cypress.env('AZURE_AD_CLIENT_ID'),
//       scope: 'https://graph.microsoft.com/.default',
//       username: Cypress.env('aad_username'),
//       password: Cypress.env('aad_password'),
//       grant_type: 'password',
//     },
//   };

//   cy.request(options).then((response) => {
//     response.body.type = 'azure';
//     const authValue = JSON.stringify(response.body);
//     window.localStorage.setItem('auth', authValue);
//   });
// });

Cypress.Commands.add('loginWithB2C', () => {
  return cy
    .request({
      method: 'POST',
      url: `https://${Cypress.env('AZURE_AD_TENANT_NAME')}.b2clogin.com/${Cypress.env('AZURE_AD_TENANT_NAME')}.onmicrosoft.com/B2C_1_GASCD_TEST_USER_SIGN_IN/oauth2/v2.0/token`,
      form: true,
      body: {
        grant_type: 'password',
        client_id: Cypress.env('AZURE_AD_CLIENT_ID'),
        client_secret: Cypress.env('AZURE_AD_CLIENT_SECRET'),
        scope: `openid offline_access https://${Cypress.env('AZURE_AD_TENANT_NAME')}.onmicrosoft.com/api/read`,
        username: Cypress.env('CYPRESS_TEST_LOGIN'),
        password: Cypress.env('CYPRESS_TEST_PASSWORD'),
      },
    })
    .then((response) => {
      expect(response.status).to.eq(200);

      const { access_token, id_token } = response.body;
      if (!access_token || !id_token) {
        throw new Error(
          'Missing access_token or id_token from Azure AD B2C response'
        );
      }

      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('accessToken', access_token);
          win.localStorage.setItem('idToken', id_token);
        },
      });
    });
});

// Cypress.Commands.add('loginWithB2C', () => {
//   const tenantName = Cypress.env('AZURE_AD_TENANT_NAME');
//   const clientId = Cypress.env('AZURE_AD_CLIENT_ID');
//   const clientSecret = Cypress.env('AZURE_AD_CLIENT_SECRET');

//   const scope = `https://${tenantName}.onmicrosoft.com/api/read`;

//   const tokenUrl = `https://${tenantName}.b2clogin.com/${tenantName}.onmicrosoft.com/B2C_1_GASCD_TEST_USER_SIGN_IN/oauth2/v2.0/token`;

//   cy.request({
//     method: 'POST',
//     url: tokenUrl,
//     form: true,
//     body: {
//       grant_type: 'client_credentials',
//       client_id: clientId,
//       client_secret: clientSecret,
//       scope: scope
//     }
//   }).then((response) => {
//     cy.log('Token response:', response);
//     expect(response.status).to.eq(200);

//     const { access_token, id_token } = response.body;

//     cy.visit('/', {
//       onBeforeLoad(win) {
//         win.localStorage.setItem('accessToken', access_token);
//         win.localStorage.setItem('idToken', id_token);
//       }
//     });
//   });
// });
