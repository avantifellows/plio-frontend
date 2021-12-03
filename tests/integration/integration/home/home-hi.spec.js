describe("Home", () => {
  context("Desktop", () => {
    beforeEach(() => {
      cy.viewport("macbook-13"); // tailwind viewport `xl and above`
      cy.loginByGoogleApi();
      cy.setLocale("hi");
    });

    it("sees the plio list and pagination options", () => {
      // plio list table
      cy.get('[data-test="table"]').should("be.visible");

      // pagination details
      cy.get('[data-test="paginator"]').should("be.visible");
      cy.get('[data-test="paginator"] [data-test="totalItems"]').should(
        "be.visible"
      );
      cy.get('[data-test="paginator"] [data-test="paginationNav"] button')
        .eq(0)
        .should("have.text", "पहला");
      cy.get('[data-test="paginator"] [data-test="paginationNav"] button')
        .eq(1)
        .should("have.text", "पिछला");
      cy.get('[data-test="paginator"] [data-test="paginationNav"] button')
        .eq(-2)
        .should("have.text", "अगला");
      cy.get('[data-test="paginator"] [data-test="paginationNav"] button')
        .eq(-1)
        .should("have.text", "आखरी");
    });

    // it("interacts with the search option", () => {
    //   // cy.get('[data-test="table"]').should("be.visible");
    //   // search bar is visible
    //   // typing on search bar bring results
    //   // sees the cross icon
    //   // shows search results
    // });

    // it("sees the plio details in the table row", () => {
    //   // date
    //   // status
    //   // title
    //   // dropdown - items
    //   // views
    //   // analyze plio option
    // });

    // it("sees create plio option", () => {
    //   // cy.get('[data-test="table"]').should("be.visible");
    //   // pagination bar - right
    //   // pagination count - left
    // });
  });
});
