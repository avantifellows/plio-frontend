describe("Home", () => {
  beforeEach(() => {
    cy.loginByGoogleApi();
  });

  it("the plio list is loaded", () => {
    cy.intercept({
      method: "GET",
      url: "http://0.0.0.0:8001/api/v1/plios/list_uuid/?page=1",
    }).as("getAllPliosList");

    cy.wait("@getAllPliosList").then((interception) => {
      if (interception.response.body.count == 0)
        cy.get('[data-test="noPlio"]').should("be.visible");
      else cy.get('[data-test="table"]').should("be.visible");
    });
  });
});
