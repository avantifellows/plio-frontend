describe("Home", () => {
  context("Desktop", () => {
    beforeEach(() => {
      cy.viewport("macbook-13"); // tailwind viewport `xl and above`
      cy.visit("/").setLocale("hi");
      cy.loginByGoogleApi();
      cy.wait(5000); // wait for some time for page to render
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
      cy.get("@paginatorNavButtons").eq(0).should("have.text", "पहला");
      cy.get("@paginatorNavButtons").eq(1).should("have.text", "पिछला");
      cy.get("@paginatorNavButtons").eq(-2).should("have.text", "अगला");
      cy.get("@paginatorNavButtons").eq(-1).should("have.text", "आखरी");
    });

    it("sees the plio details in the table row", () => {
      cy.get('[data-test="table"] [data-test="row"]').eq(0).as("plioRow");
      cy.get("@plioRow").should("be.visible");
      cy.get("@plioRow")
        .find('[data-test="lastUpdatedAt"]')
        .should("be.visible");
      cy.get("@plioRow").find('[data-test="simpleBadge"]').should("be.visible");
      cy.get("@plioRow").find('[data-test="plioViews"]').should("be.visible");

      // There are two analyze buttons in the plioRow. The first one is visible only
      // in mobile while the other one is visible in larger devices (sm & above).
      cy.get("@plioRow")
        .find('[data-test="analyzeButton"]')
        .eq(1)
        .as("analyzeButton");
      cy.get("@analyzeButton").should("not.be.visible");
      cy.get("@plioRow").trigger("mouseover");
      cy.get("@analyzeButton")
        .should("be.visible")
        .and("have.text", "प्लायो का विश्लेषण करें");

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
        edit: "संपादन",
        play: "चलाओ",
        share: "बाटें",
        embed: "एम्बेड",
        duplicate: "नक़ल",
        delete: "हटाएं",
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
      cy.get("@createPlio")
        .should("be.visible")
        .and("have.text", "प्लायो बनाओ");
    });

    // TODO: interaction with dropdown options
    // TODO: interaction with search bar
    // TODO: sorting functionality
  });
});
