declare namespace Cypress {
  interface Chainable<Subject = any> {
    loginToAAD(username: string, password: string): Chainable<any>;
    login(): Chainable<any>;
    loginWithB2C(): Chainable<any>;
  }
}
