describe('Site should have a robots in the meta tags on different pages', () => {
  it('Should find the robots meta tags', () => {
    cy.visit('');
    cy.metatag('robots').should('have.attr', 'content', 'noindex, nofollow');

    cy.visit('/present-demand');
    cy.metatag('robots').should('have.attr', 'content', 'noindex, nofollow');

    cy.visit('/cookies');
    cy.metatag('robots').should('have.attr', 'content', 'noindex, nofollow');
  });
});
