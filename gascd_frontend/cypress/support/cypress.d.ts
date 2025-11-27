declare namespace Cypress {
  interface Chainable<Subject = any> {
    loginToAAD(username: string, password: string): Chainable<any>;
    login(): Chainable<any>;
    metatag(name: string): Chainable<JQuery<HTMLMetaElement>>;
    metatag(name: string): Chainable<Subject>;
  }
}
