describe('Help pages exist and contain data', () => {
  it('Should navigate to each help page and check the title', () => {
    const pages = [
      {
        url: '/help/beds-per-100000-adult-population-over-time',
        heading:
          'Adult social care beds per 100,000 adult population - over time',
      },
      {
        url: '/help/beds-per-100000-adult-population',
        heading: 'Adult social care beds per 100,000 adult population',
      },
      {
        url: '/help/dementia-prevalence',
        heading: 'Dementia prevalence',
      },
      {
        url: '/help/disability-prevalence',
        heading: 'Disability prevalence',
      },
      {
        url: '/help/estimated-dementia-diagnosis-rate-aged-65-and-over',
        heading:
          'Estimated dementia diagnosis rate for people aged 65 and over',
      },
      {
        url: '/help/household-deprivation',
        heading: 'Households deprived in 4 dimensions',
      },
      {
        url: '/help/households-where-property-is-owned-outright',
        heading: 'Households where the property is owned outright',
      },
      {
        url: '/help/learning-disability-prevalence',
        heading: 'Learning disability prevalence',
      },
      {
        url: '/help/percentage-beds-occupied',
        heading: 'Percentage of adult social care beds occupied',
      },
      {
        url: '/help/one-person-households-where-person-aged-65-or-over',
        heading: 'One-person households where the person is aged 65 or over',
      },
      {
        url: '/help/population-age',
        heading: 'Age group percentages',
      },
      {
        url: '/help/population-size',
        heading: 'Population size',
      },
      {
        url: '/help/people-who-reported-bad-or-very-bad-health',
        heading: 'People who reported bad or very bad health',
      },
      {
        url: '/help/primary-reason-for-accessing-long-term-adult-social-care',
        heading:
          'Primary reason for people to access long-term adult social care',
      },
    ];
    cy.visit('');
    cy.url().should('include', '/login');

    cy.login_onelogin(Cypress.env('cpl_user'));

    pages.forEach((page) => {
      cy.visit(page.url);
      cy.url().should('include', page.url);
      cy.get('h1').should('contains.text', page.heading);
      cy.get('title').should('contains.text', page.heading);
    });
  });
});
