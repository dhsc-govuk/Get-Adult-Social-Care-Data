declare namespace Cypress {
  interface Chainable<Subject = any> {
    login_onelogin(email: string): Chainable<any>;
    logout(): Chainable<any>;
    metatag(name: string): Chainable<JQuery<HTMLMetaElement>>;
    metatag(name: string): Chainable<Subject>;
  }
}
