describe("Home - en", () => {
  context("Desktop", () => {
    before(() => {
      cy.viewport("macbook-13"); // tailwind viewport `xl and above`
      cy.visit("/").setLocale("en");
      cy.loginByGoogleApi();
      cy.wait(5000); // wait for some time for page to render
    });

    beforeEach(() => {
      cy.viewport("macbook-13"); // tailwind viewport `xl and above`
    });

    it("sees the plio list and pagination options", () => {
      // plio list table
      cy.get('[data-test="table"]').should("be.visible");

      // pagination details
      cy.get('[data-test="paginator"]').as("paginator");
      cy.get("@paginator").should("be.visible");
      cy.get("@paginator")
        .find('[data-test="totalItems"]')
        .should("be.visible");

      cy.get("@paginator")
        .find('[data-test="paginationNav"] button')
        .as("paginatorNavButtons");
      cy.get("@paginatorNavButtons").eq(0).should("have.text", "First");
      cy.get("@paginatorNavButtons").eq(1).should("have.text", "Previous");
      cy.get("@paginatorNavButtons").eq(-2).should("have.text", "Next");
      cy.get("@paginatorNavButtons").eq(-1).should("have.text", "Last");
    });

    it("sees the plio details in the table row", () => {
      cy.get('[data-test="table"] [data-test="row"]').eq(0).as("plioRow");
      cy.get("@plioRow").should("be.visible");
      cy.get("@plioRow")
        .find('[data-test="lastUpdatedAt"]')
        .should("be.visible");
      cy.get("@plioRow").find('[data-test="simpleBadge"]').should("be.visible");
      cy.get("@plioRow").find('[data-test="plioViews"]').should("be.visible");

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

      let dropdownOptions = {
        edit: "Edit",
        play: "Play",
        share: "Share",
        embed: "Embed",
        analyse: "Analyse",
        duplicate: "Duplicate",
        delete: "Delete",
      };
      Object.entries(dropdownOptions).forEach(([key, value]) => {
        cy.get("@plioOptions")
          .find(`[data-test="option-${key}"]`)
          .should("be.visible")
          .and("have.text", value);
      });
    });

    it("interacts with the search option", () => {
      cy.get('[data-test="table"]').as("plioTable");
      cy.get("@plioTable").find('[data-test="searchBar"]').as("searchBar");
      cy.get("@searchBar").should("be.visible");

      cy.get("@plioTable")
        .find('[data-test="resetSearch"]')
        .should("not.exist");
      cy.get("@searchBar").type("My Plio", { force: true });
      cy.get("@plioTable")
        .find('[data-test="resetSearch"]')
        .should("exist")
        .and("be.visible");
      cy.get("@plioTable").find('[data-test="resetSearch"]').click();
      cy.get("@plioTable")
        .find('[data-test="resetSearch"]')
        .should("not.exist");
    });

    it("sees the create plio option", () => {
      cy.get('[data-title="createPlio"]').as("createPlio");
      cy.get("@createPlio").should("be.visible").and("have.text", "Create");
    });

    // TODO: interaction with dropdown options
    // TODO: interaction with search bar
    // TODO: sorting functionality
  });
});
