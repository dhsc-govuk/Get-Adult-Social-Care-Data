describe('Site should have healthchecks configured', () => {
  it('Should have a live check', () => {
    cy.request('/api/checks/live').its('body').should('include', 'OK');
  });

  it('Should have a health check', () => {
    cy.request('/api/checks/health').as('health');
    cy.get('@health').should((response: any) => {
      expect(response).to.have.property('status', 200);
      expect(response.body).to.have.property('status', 'healthy');
      expect(response.body).to.have.property('database', 'connected');
    });
  });
});
