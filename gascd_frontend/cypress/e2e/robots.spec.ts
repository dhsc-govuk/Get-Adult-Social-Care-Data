describe('Site should have a robots.txt file in the root', () => {
  it('Should find the robots.txt file', () => {

    cy.request('/robots.txt').its('body').should('include', 'User-Agent: *\nUser-agent: AdsBot-Google\nDisallow: /')
  });
});