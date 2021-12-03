describe("Home", () => {
  context("Desktop", () => {
    beforeEach(() => {
      cy.viewport("macbook-13"); // tailwind viewport `xl and above`
      cy.visit("/").setLocale("en");
      cy.loginByGoogleApi();
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
        .should("have.text", "First");
      cy.get('[data-test="paginator"] [data-test="paginationNav"] button')
        .eq(1)
        .should("have.text", "Previous");
      cy.get('[data-test="paginator"] [data-test="paginationNav"] button')
        .eq(-2)
        .should("have.text", "Next");
      cy.get('[data-test="paginator"] [data-test="paginationNav"] button')
        .eq(-1)
        .should("have.text", "Last");
    });

    // it("interacts with the search option", () => {
    //   // cy.get('[data-test="table"]').should("be.visible");
    //   // search bar is visible
    //   // typing on search bar bring results
    //   // sees the cross icon
    //   // shows search results
    // });

    it("sees the plio details in the table row", () => {
      cy.wait(5000);
      cy.get('[data-test="table"] [data-test="row"]').eq(0).as("plioRow");
      cy.get("@plioRow").should("be.visible");
      cy.get("@plioRow")
        .find('[data-test="lastUpdatedAt"]')
        .should("be.visible");
      cy.get("@plioRow").find('[data-test="simpleBadge"]').should("be.visible");
      cy.get("@plioRow")
        .find('[data-test="optionDropdown"]')
        .should("be.visible");

      // dropdown - items
      cy.get("@plioRow")
        .find('[data-test="optionsContainer"]')
        .should("not.exist");
      cy.get("@plioRow")
        .find('[data-test="optionDropdown"] [data-test="toggleButton"]')
        .click();
      cy.get("@plioRow")
        .find('[data-test="optionsContainer"]')
        .should("exist")
        .and("be.visible");
      cy.get("@plioRow")
        .find('[data-test="optionsContainer"] [data-test="options"]')
        .as("plioOptions");

      let dropdownOptions = [
        "edit",
        "play",
        "share",
        "embed",
        "duplicate",
        "delete",
      ];
      dropdownOptions.forEach((option) => {
        cy.get("@plioOptions")
          .find(`[data-test="option-${option}"]`)
          .should("be.visible");
      });

      cy.get("@plioRow").find('[data-test="plioViews"]').should("be.visible");

      // cy.get("@plioRow").find('[data-test="analyzeButton"]').should("not.be.visible");
      // cy.get("@plioRow").trigger('mouseover');
      // cy.get("@plioRow").find('[data-test="analyzeButton"]').should("be.visible");
    });

    // it("sees create plio option", () => {
    //   // cy.get('[data-test="table"]').should("be.visible");
    //   // pagination bar - right
    //   // pagination count - left
    // });
  });
});
