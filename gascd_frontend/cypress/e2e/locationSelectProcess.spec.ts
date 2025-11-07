describe('User can set location', () => {
    it('Should navigate to the location select page and change the location', () => {

        cy.visit('/location-select');

        // Verify that we are on the location select page
        cy.get('h1').should('contains.text', 'Select a location');
        cy.get('select#location_list').select('Shoggins Care Services (Ipswich)');
        cy.get('button').contains('Apply changes').click();

        // Verify that the selected location is displayed
        cy.get('select#location_list').should('have.value', 'Shoggins Care Services (Ipswich)');
        
    });
});