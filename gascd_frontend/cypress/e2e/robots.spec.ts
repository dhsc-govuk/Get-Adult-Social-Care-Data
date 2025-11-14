describe('Site should have a robots.txt file in the root', () => {
  it('Should find the robots.txt file', () => {

    cy.readFile('app/robots.txt').should('eq', 'User-Agent: *\nUser-agent: AdsBot-Google\nDisallow: /');
  });
});