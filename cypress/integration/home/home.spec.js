describe('sees home', () => {
  beforeEach(() => {
    cy.loginByGoogleApi()
  });

  it('sees the plio list', () => {
    cy.get('[data-test="table"]').should('be.visible');
  });
});
