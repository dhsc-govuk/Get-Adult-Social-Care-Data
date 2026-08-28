describe('Custom comparator groups on benchmarking charts', () => {
  // Groups persist against the user's account, so names must be unique per
  // run and each test cleans up the groups it creates
  const uniqueName = (prefix: string) => `${prefix} ${Date.now()}`;

  const deleteSelectedGroup = () => {
    cy.contains('button', 'Edit this group').click();
    cy.contains('button', 'Delete this group').click();
    cy.contains('button', 'Yes, delete group').click();
  };

  it('builds, saves and applies a custom comparator group across tabs', () => {
    const groupName = uniqueName('My comparator group');
    cy.login_onelogin(Cypress.env('cpl_user'));
    cy.visit(
      '/topics/population-needs/household-composition-and-economic-factors/data'
    );

    cy.get('h1').should(
      'contains.text',
      'Economic factors and household composition'
    );

    // The chart tab shows the comparison group control with the NHS default
    cy.get('a[href*="chart-1"]').click();
    cy.get('#chart-1').should('be.visible');
    cy.get('#comparator-chart-1-comparison-group')
      .should('be.visible')
      .find('option')
      .should('contain', 'Statistically similar peer group (NHS)')
      .and('contain', 'Custom');

    // Choosing "Custom" opens the builder panel inline
    cy.get('#comparator-chart-1-comparison-group').select('Custom');
    cy.contains('h3', 'Create a custom comparator group').should('be.visible');
    cy.contains('0 selected');

    // Name the group and pick local authorities via search
    cy.get('#comparator-chart-1-group-name').type(groupName);
    cy.get('#comparator-chart-1-la-search').type('l');
    cy.get('#chart-1 input[type="checkbox"]').first().check();
    cy.contains('1 selected');
    cy.get('#comparator-chart-1-la-search').clear();
    cy.get('#chart-1 input[type="checkbox"]').eq(1).check();
    cy.contains('2 selected');

    // Save selects the new group and repopulates the chart
    cy.contains('button', 'Save changes').click();
    cy.contains('h3', 'Create a custom comparator group').should('not.exist');
    cy.get('#comparator-chart-1-comparison-group')
      .find('option:selected')
      .should('have.text', groupName);
    cy.get('#chart-1').contains(`${groupName} average`);
    cy.get('#chart-1').contains(
      'This chart compares'
    );

    // The selection is shared with the Table tab (column + caption update),
    // and the Custom option is available there too
    cy.get('a[href*="table-1"]').click();
    cy.get('#table-1').should('be.visible');
    cy.get('#comparator-table-1-comparison-group')
      .find('option:selected')
      .should('have.text', groupName);
    cy.get('#comparator-table-1-comparison-group')
      .find('option')
      .should('contain', 'Custom');
    cy.get('#table-1').contains(`${groupName} average`);

    // And with the Download tab, where the builder can also be opened
    cy.get('a[href*="download-1"]').click();
    cy.get('#download-1').should('be.visible');
    cy.get('#comparator-download-1-comparison-group')
      .find('option:selected')
      .should('have.text', groupName);
    cy.get('#comparator-download-1-comparison-group').select('Custom');
    cy.get('#download-1')
      .contains('h3', 'Create a custom comparator group')
      .should('be.visible');
    cy.contains('button', 'Cancel').click();
    cy.get('#comparator-download-1-comparison-group')
      .find('option:selected')
      .should('have.text', groupName);

    // All three metric sections share the same selection
    cy.get('a[href*="chart-2"]').click();
    cy.get('#comparator-chart-2-comparison-group')
      .find('option:selected')
      .should('have.text', groupName);

    // Switching back to the NHS peer group restores the original labels
    cy.get('#comparator-chart-2-comparison-group').select(
      'Statistically similar peer group (NHS)'
    );
    cy.get('#chart-2').contains('NHS peer group average');
    cy.get('a[href*="table-2"]').click();
    cy.get('#table-2').contains('NHS peer group average');

    // Clean up: reselect and delete the group so reruns start clean
    cy.get('a[href*="chart-1"]').click();
    cy.get('#comparator-chart-1-comparison-group').select(groupName);
    deleteSelectedGroup();
    cy.get('#comparator-chart-1-comparison-group')
      .find('option')
      .should('not.contain', groupName);
  });

  it('edits and deletes a saved comparator group', () => {
    const editableName = uniqueName('Editable group');
    const renamedName = uniqueName('Renamed group');
    cy.login_onelogin(Cypress.env('cpl_user'));
    cy.visit(
      '/topics/population-needs/household-composition-and-economic-factors/data'
    );

    // Create a group to edit
    cy.get('a[href*="chart-1"]').click();
    cy.get('#comparator-chart-1-comparison-group').select('Custom');
    cy.get('#comparator-chart-1-group-name').type(editableName);
    cy.get('#chart-1 input[type="checkbox"]').first().check();
    cy.contains('button', 'Save changes').click();

    // Edit it: the button appears once a custom group is selected
    cy.contains('button', 'Edit this group').click();
    cy.contains('h3', 'Edit comparator group').should('be.visible');
    cy.get('#comparator-chart-1-group-name').should(
      'have.value',
      editableName
    );
    cy.contains('1 selected');
    cy.get('#comparator-chart-1-group-name').clear().type(renamedName);
    cy.get('#chart-1 input[type="checkbox"]').eq(1).check();
    cy.contains('button', 'Save changes').click();

    cy.get('#comparator-chart-1-comparison-group')
      .find('option:selected')
      .should('have.text', renamedName);
    cy.get('#chart-1').contains(`${renamedName} average`);

    // Delete it, backing out once first
    cy.contains('button', 'Edit this group').click();
    cy.contains('button', 'Delete this group').click();
    cy.contains('Are you sure you want to delete this comparator group?');
    cy.contains('button', 'Keep group').click();
    cy.contains('button', 'Delete this group').click();
    cy.contains('button', 'Yes, delete group').click();

    // The selection falls back to the NHS peer group
    cy.get('#comparator-chart-1-comparison-group')
      .find('option:selected')
      .should('have.text', 'Statistically similar peer group (NHS)');
    cy.get('#comparator-chart-1-comparison-group')
      .find('option')
      .should('not.contain', renamedName);
    cy.get('#chart-1').contains('NHS peer group average');
  });

  it('cancels the builder without changing the selection', () => {
    cy.login_onelogin(Cypress.env('cpl_user'));
    cy.visit(
      '/topics/population-needs/household-composition-and-economic-factors/data'
    );

    cy.get('a[href*="chart-1"]').click();
    cy.get('#comparator-chart-1-comparison-group').select('Custom');
    cy.contains('h3', 'Create a custom comparator group').should('be.visible');

    cy.contains('button', 'Cancel').click();
    cy.contains('h3', 'Create a custom comparator group').should('not.exist');
    cy.get('#comparator-chart-1-comparison-group')
      .find('option:selected')
      .should('have.text', 'Statistically similar peer group (NHS)');
  });

  it('validates the builder before saving', () => {
    cy.login_onelogin(Cypress.env('cpl_user'));
    cy.visit(
      '/topics/population-needs/household-composition-and-economic-factors/data'
    );

    cy.get('a[href*="chart-1"]').click();
    cy.get('#comparator-chart-1-comparison-group').select('Custom');
    cy.contains('button', 'Save changes').click();

    cy.contains('Enter a name for this comparator group');
    cy.contains('Select at least one local authority');
  });
});
