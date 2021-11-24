describe("Home", () => {
  beforeEach(() => {
    cy.loginByGoogleApi();
  });

  it("the plio list is loaded", () => {
    cy.get('[data-test="table"]').should("be.visible");
  });
});
