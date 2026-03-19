describe('Care Home pages exist and contain data', () => {
  it('CPL user should navigate to the Care home beds and occupancy levels page and check the contents', () => {
    cy.login_onelogin(Cypress.env('cpl_user'));

    cy.visit('/location-select');
    cy.get('h1').should(
      'contains.text',
      'Select your CQC registered office address for your care provider organisation'
    );
    cy.get('label').contains('Test Care Provider Location 1').click();
    cy.get('button').contains('Apply changes').click();

    cy.visit('/topics/residential-care/provision-and-occupancy/data');

    cy.get('h1').should('contains.text', 'Care home beds and occupancy levels');

    cy.contains('Care home bed numbers');

    cy.get('a[href*="chart-1"]').click();
    cy.url().should('include', '#chart-1');
    cy.get('#chart-1')
      .should('be.visible')
      .contains('Figure 1: care home bed numbers per 100,000 adult population');
    cy.get('#table-1').should('not.be.visible');
    cy.get('#download-1').should('not.be.visible');

    cy.get('a[href*="table-1"]').click();
    cy.url().should('include', '#table-1');
    cy.get('#table-1')
      .should('be.visible')
      .contains(
        'Table 1: care home beds per 100,000 adult population (all bed types) for regional LAs'
      );
    cy.get('#chart-1').should('not.be.visible');
    cy.get('#download-1').should('not.be.visible');

    cy.get('a[href*="download-1"]').click();
    cy.url().should('include', '#download-1');
    cy.get('#download-1').should('be.visible');
    cy.get('#table-1').should('not.be.visible');
    cy.get('#chart-1').should('not.be.visible');

    cy.get('#numbers-table-metrics-button').click();
    cy.get('#dhsc-filter--content1').should('be.visible');
    cy.wait(300);
    cy.get(
      'input[type="radio"][value="bedcount_per_hundred_thousand_adults_total"]'
    )
      .check()
      .should('be.checked');
    cy.get('#numbers-table-metrics-submit-button').click();
    cy.contains('Bed type: All bed types').should('be.visible');
    cy.contains('Bed type: All bed types').click();
    cy.contains('Bed type: All bed types').should('not.exist');

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

    cy.get('#type-table-metrics-button').click();
    cy.get('#dhsc-filter--content1').should('be.visible');
    cy.wait(300);
    cy.get(
      'input[type="checkbox"][value="bedcount_per_hundred_thousand_adults_total"]'
    )
      .check()
      .should('be.checked');
    cy.get('#type-table-metrics-submit-button').click();
    cy.contains('Bed type: All bed types').should('be.visible');
    cy.contains('Bed type: All bed types').click();
    cy.contains('Bed type: All bed types').should('not.exist');

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
    cy.wait(500);
    cy.get('#textSummary-3').should('not.be.visible');
    cy.get('#table-3').should('not.be.visible');

    cy.contains('Care home bed numbers - trends over time');

    cy.get('a[href*="graph-4"]').click();
    cy.url().should('include', '#graph-4');
    cy.get('#graph-4')
      .should('be.visible')
      .contains(
        'Figure 2: care home bed numbers per 100,000 adult population (all bed types)'
      );
    cy.get('#table-3').should('not.be.visible');
    cy.get('#textSummary-3').should('not.be.visible');

    cy.get('#single-type-chart-metric-button').click();
    cy.get('#dhsc-filter--content1').should('be.visible');
    cy.wait(300);
    cy.get(
      'input[type="radio"][value="bedcount_per_hundred_thousand_adults_total"]'
    )
      .check()
      .should('be.checked');
    cy.get('#single-type-chart-metric-submit-button').click();
    cy.contains('Bed type: All bed types').should('be.visible');
    cy.contains('Bed type: All bed types').click();
    cy.contains('Bed type: All bed types').should('not.exist');
  });

  it('LA user should navigate to the Care home beds and occupancy levels page and check the contents', () => {
    cy.login_onelogin(Cypress.env('la_user'));

    cy.visit('/topics/residential-care/provision-and-occupancy/data');

    cy.get('h1').should('contains.text', 'Care home beds and occupancy levels');

    cy.contains('Care home bed numbers');

    cy.get('a[href*="chart-1"]').click();
    cy.url().should('include', '#chart-1');
    cy.get('#chart-1')
      .should('be.visible')
      .contains('Figure 1: care home bed numbers per 100,000 adult population');
    cy.get('#table-1').should('not.be.visible');
    cy.get('#download-1').should('not.be.visible');

    // CP metrics not visible to LAs
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
      .should('not.contains.text', 'compared to the median')
      .should('contains.text', 'the regional average');
    cy.get('#download-3').should('not.be.visible');
    cy.get('#table-3').should('not.be.visible');
  });
});
