describe("Home", () => {
  beforeEach(() => {
    cy.loginByGoogleApi();
    cy.setLocale("en");
  });

  it("sees the plio list", () => {
    cy.get('[data-test="table"]').should("be.visible");
  });

  it("sees the pagination details", () => {
    // cy.get('[data-test="table"]').should("be.visible");
    // pagination bar - right
    // pagination count - left
  });

  it("interacts with the search option", () => {
    // cy.get('[data-test="table"]').should("be.visible");
    // search bar is visible
    // typing on search bar bring results
    // sees the cross icon
    // shows search results
  });

  it("sees the plio details in the table row", () => {
    // date
    // status
    // title
    // dropdown - items
    // views
    // analyze plio option
  });

  it("sees create plio option", () => {
    // cy.get('[data-test="table"]').should("be.visible");
    // pagination bar - right
    // pagination count - left
  });
});
