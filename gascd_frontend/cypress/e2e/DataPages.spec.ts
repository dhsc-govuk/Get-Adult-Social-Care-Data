describe('Data pages exist and contain data', () => {
  it('Should navigate to the Care Providers: Locations and services page and check the contents', () => {
    cy.login_onelogin('testcplocation@testing.com');
    cy.visit('/topics/residential-care/residential-care-providers/data');

    cy.get('h1').should(
      'contains.text',
      'Care providers: locations and services'
    );

    cy.contains('Care providers: locations and services');

    cy.get('a[href*="table-2"]').click();
    cy.url().should('include', '#table-2');
    cy.get('#table-2')
      .should('be.visible')
      .contains('Table 1: number of adult social care providers');
    cy.get('#download-2').should('not.be.visible');

    cy.get('a[href*="download-2"]').click();
    cy.url().should('include', '#download-2');
    cy.get('#download-2').should('be.visible');
    cy.get('#table-2').should('not.be.visible');
  });

  it('Should navigate to the Unpaid care page and check the contents', () => {
    cy.login_onelogin('testcplocation@testing.com');
    cy.visit('/topics/residential-care/unpaid-care/data');

    cy.get('h1').should('contains.text', 'Unpaid care');

    cy.contains('Unpaid care');

    cy.get('a[href*="table-1"]').click();
    cy.url().should('include', '#table-1');
    cy.get('#table-1')
      .should('be.visible')
      .contains(
        'Table 1: percentage of people aged 5 and over who provide unpaid care'
      );
    cy.get('#download-1').should('not.be.visible');

    cy.get('a[href*="download-1"]').click();
    cy.url().should('include', '#download-1');
    cy.get('#download-1').should('be.visible');
    cy.get('#table-1').should('not.be.visible');
  });

  it('Should navigate to the Number of adults receiving community social care page and check the contents', () => {
    cy.login_onelogin('testcplocation@testing.com');
    cy.visit('/topics/residential-care/number-of-people-receiving-care/data');

    cy.get('h1').should(
      'contains.text',
      'Number of adults receiving community social care'
    );

    cy.contains('Number of adults receiving community social care');

    cy.get('a[href*="table-1"]').click();
    cy.url().should('include', '#table-1');
    cy.get('#table-1')
      .should('be.visible')
      .contains(
        'Table 1: number of people receiving community social care in the last month'
      );
    cy.get('#download-1').should('not.be.visible');

    cy.get('a[href*="download-1"]').click();
    cy.url().should('include', '#download-1');
    cy.get('#download-1').should('be.visible');
    cy.get('#table-1').should('not.be.visible');
  });

  it('Should navigate to the Population size and age group percentages page and check the contents', () => {
    cy.login_onelogin(Cypress.env('cpl_user'));
    cy.visit('/topics/population-needs/population-age-and-size/data');

    cy.get('h1').should(
      'contains.text',
      'Population size and age group percentages'
    );

    cy.contains('Adult population size with age group percentages');

    cy.get('a[href*="table-1"]').click();
    cy.url().should('include', '#table-1');
    cy.get('#table-1')
      .should('be.visible')
      .contains('Table 1: population size and age group percentages');
    cy.get('#textSummary-1').should('not.be.visible');
    cy.get('#download-1').should('not.be.visible');

    cy.get('a[href*="textSummary-1"]').click();
    cy.wait(500);
    cy.url().should('include', '#textSummary-1');
    cy.get('#textSummary-1')
      .should('be.visible')
      .contains('This suggests the need for care services');
    cy.get('#table-1').should('not.be.visible');
    cy.get('#download-1').should('not.be.visible');

    cy.get('a[href*="download-1"]').click();
    cy.url().should('include', '#download-1');
    cy.get('#download-1').should('be.visible');
    cy.get('#textSummary-1').should('not.be.visible');
    cy.get('#table-1').should('not.be.visible');
  });

  it('Should navigate to the Economic factors and household composition page and check the contents', () => {
    cy.login_onelogin(Cypress.env('cpl_user'));
    cy.visit(
      '/topics/population-needs/household-composition-and-economic-factors/data'
    );

    cy.get('h1').should(
      'contains.text',
      'Economic factors and household composition'
    );

    cy.contains('Household deprivation');

    cy.get('a[href*="table-1"]').click();
    cy.url().should('include', '#table-1');
    cy.get('#table-1')
      .should('be.visible')
      .contains('Table 1: percentage of households classified as');
    cy.get('#download-1').should('not.be.visible');

    cy.get('a[href*="download-1"]').click();
    cy.url().should('include', '#download-1');
    cy.get('#download-1').should('be.visible');
    cy.get('#table-1').should('not.be.visible');

    cy.contains('Households where the property is owned outright');

    cy.get('a[href*="table-2"]').click();
    cy.url().should('include', '#table-2');
    cy.get('#table-2')
      .should('be.visible')
      .contains(
        'Table 2: percentage of households where the property is owned outright'
      );
    cy.get('#download-2').should('not.be.visible');

    cy.get('a[href*="download-2"]').click();
    cy.url().should('include', '#download-2');
    cy.get('#download-2').should('be.visible');
    cy.get('#table-2').should('not.be.visible');

    cy.contains('One-person households where the person is aged 65 or over');

    cy.get('a[href*="table-3"]').click();
    cy.url().should('include', '#table-3');
    cy.get('#table-3')
      .should('be.visible')
      .contains(
        'Table 3: percentage of one-person households where the person is aged 65 or over'
      );
    cy.get('#download-3').should('not.be.visible');

    cy.get('a[href*="download-3"]').click();
    cy.url().should('include', '#download-3');
    cy.get('#download-3').should('be.visible');
    cy.get('#table-3').should('not.be.visible');
  });

  it('Should navigate to the General health, disability and learning disability page and check the contents', () => {
    cy.login_onelogin(Cypress.env('cpl_user'));
    cy.visit('/topics/population-needs/disability-prevalence/data');

    cy.get('h1').should(
      'contains.text',
      'General health, disability and learning disability'
    );

    cy.contains('Disability prevalence');

    cy.get('a[href*="table-1"]').click();
    cy.url().should('include', '#table-1');
    cy.get('#table-1')
      .should('be.visible')
      .contains('Table 1: self-reporting on general health and disability');
    cy.get('#download-1').should('not.be.visible');

    cy.get('a[href*="download-1"]').click();
    cy.url().should('include', '#download-1');
    cy.get('#download-1').should('be.visible');
    cy.get('#table-1').should('not.be.visible');

    cy.contains('Learning disability prevalence');

    cy.get('a[href*="table-2"]').click();
    cy.url().should('include', '#table-2');
    cy.get('#table-2')
      .should('be.visible')
      .contains('Table 2: learning disability prevalence');
    cy.get('#download-2').should('not.be.visible');

    cy.get('a[href*="download-2"]').click();
    cy.url().should('include', '#download-2');
    cy.get('#download-2').should('be.visible');
    cy.get('#table-2').should('not.be.visible');

    cy.contains(
      'Primary reason for people to access long-term adult social care'
    );

    cy.get('a[href*="table-3"]').click();
    cy.url().should('include', '#table-3');
    cy.get('#table-3')
      .should('be.visible')
      .contains('Table 3: primary reason for');
    cy.get('#download-3').should('not.be.visible');

    cy.get('a[href*="download-3"]').click();
    cy.url().should('include', '#download-3');
    cy.get('#download-3').should('be.visible');
    cy.get('#table-3').should('not.be.visible');
  });

  it('Should navigate to the Dementia prevalence and estimated diagnosis rate page and check the contents', () => {
    cy.login_onelogin(Cypress.env('cpl_user'));
    cy.visit('/topics/population-needs/dementia-prevalence/data');

    cy.get('h1').should(
      'contains.text',
      'Dementia prevalence and estimated diagnosis rate'
    );

    cy.contains('Dementia prevalence and estimated diagnosis rate');

    cy.get('a[href*="table-1"]').click();
    cy.url().should('include', '#table-1');
    cy.get('#table-1')
      .should('be.visible')
      .contains('Table 1: dementia prevalence and the dementia diagnosis rate');
    cy.get('#download-1').should('not.be.visible');

    cy.get('a[href*="download-1"]').click();
    cy.url().should('include', '#download-1');
    cy.get('#download-1').should('be.visible');
    cy.get('#table-1').should('not.be.visible');
  });

  it('Should navigate to the LA funding planning page and check the contents', () => {
    cy.login_onelogin(Cypress.env('la_user'));
    cy.visit('/topics/future-planning/la-funding-planning/data');

    cy.get('h1').should(
      'contains.text',
      'Local Authority funding projected demand'
    );

    cy.contains('Local Authority funding projected demand');

    cy.get('a[href*="table-1"]').click();
    cy.url().should('include', '#table-1');
    cy.get('#table-1')
      .should('be.visible')
      .contains(
        'Table 1: comparison of estimated population with selected health conditions over time within Local Authority area'
      );
    cy.get('#download-1').should('not.be.visible');

    cy.get('a[href*="download-1"]').click();
    cy.url().should('include', '#download-1');
    cy.get('#download-1').should('be.visible');
    cy.get('#table-1').should('not.be.visible');
  });
});
