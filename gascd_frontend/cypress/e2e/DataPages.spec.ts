describe('Data pages exist and contain data', () => {
  it('Should navigate to the Care home beds and occupancy levels page and check the contents', () => {
    cy.login();
    cy.visit('/topics/residential-care/provision-and-occupancy/data');

    cy.get('h1').should('contains.text', 'Care home beds and occupancy levels');

    cy.contains('Care home bed numbers');

    cy.get('a[href*="chart-1"]').click();
    cy.url().should('include', '#chart-1');
    cy.get('#chart-1')
      .should('be.visible')
      .contains(
        'Figure 1: chart of care home beds per 100,000 adult population'
      );
    cy.get('#table-1').should('not.be.visible');
    cy.get('#download-1').should('not.be.visible');

    cy.get('a[href*="table-1"]').click();
    cy.url().should('include', '#table-1');
    cy.get('#table-1')
      .should('be.visible')
      .contains(
        'Table 1: care home bed numbers per 100,000 adult population for regional local authorities'
      );
    cy.get('#chart-1').should('not.be.visible');
    cy.get('#download-1').should('not.be.visible');

    cy.get('a[href*="download-1"]').click();
    cy.url().should('include', '#download-1');
    cy.get('#download-1').should('be.visible');
    cy.get('#table-1').should('not.be.visible');
    cy.get('#chart-1').should('not.be.visible');

    cy.contains('Care home bed types');

    cy.get('a[href*="table-2"]').click();
    cy.url().should('include', '#table-2');
    cy.get('#table-2')
      .should('be.visible')
      .contains('Table 2: care home bed numbers per 100,000 adult population');
    cy.get('#textSummary-2').should('not.be.visible');
    cy.get('#download-2').should('not.be.visible');

    cy.get('a[href*="textSummary-2"]').click();
    cy.url().should('include', '#textSummary-2');
    cy.get('#textSummary-2')
      .should('be.visible')
      .contains(
        'The number of adult social care beds per 100,000 adult population provides an indicator of current care capacity'
      );
    cy.get('#table-2').should('not.be.visible');
    cy.get('#download-2').should('not.be.visible');

    cy.get('a[href*="download-2"]').click();
    cy.url().should('include', '#download-2');
    cy.get('#download-2').should('be.visible');
    cy.get('#table-2').should('not.be.visible');
    cy.get('#textSummary-2').should('not.be.visible');

    cy.contains('Beds per care home and occupancy levels');

    cy.get('a[href*="table-3"]').click();
    cy.url().should('include', '#table-3');
    cy.get('#table-3')
      .should('be.visible')
      .contains('Table 3: care home bed numbers and occupancy levels');
    cy.get('#textSummary-3').should('not.be.visible');
    cy.get('#download-3').should('not.be.visible');

    cy.get('a[href*="textSummary-3"]').click();
    cy.url().should('include', '#textSummary-3');
    cy.get('#textSummary-3')
      .should('be.visible')
      .contains('compared to the median');
    cy.get('#download-3').should('not.be.visible');
    cy.get('#table-3').should('not.be.visible');

    cy.get('a[href*="download-3"]').click();
    cy.url().should('include', '#download-3');
    cy.get('#download-3').should('be.visible');
    cy.get('#textSummary-3').should('not.be.visible');
    cy.get('#table-3').should('not.be.visible');

    cy.contains('Care home bed numbers - trends over time');

    cy.get('a[href*="graph-4"]').click();
    cy.url().should('include', '#graph-4');
    cy.get('#graph-4')
      .should('be.visible')
      .contains(
        'Figure 2: graph of care home bed numbers per 100,000 adult population'
      );
    cy.get('#table-3').should('not.be.visible');
    cy.get('#textSummary-3').should('not.be.visible');
  });

  it('Should navigate to the Population size and age group percentages page and check the contents', () => {
    cy.login();
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

    cy.get('a[href*="textSummary-1"]').click();
    cy.url().should('include', '#textSummary-1');
    cy.get('#textSummary-1')
      .should('be.visible')
      .contains('This suggests the need for care services');

    cy.get('a[href*="download-1"]').click();
    cy.url().should('include', '#download-1');
    cy.get('#download-1').should('be.visible');
  });
});
