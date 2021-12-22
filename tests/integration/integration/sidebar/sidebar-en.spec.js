describe("Sidebar - en", () => {
  context("Desktop", () => {
    before(() => {
      cy.viewport("macbook-13"); // tailwind viewport `xl and above`
      cy.visit("/").setLocale("en");
      cy.loginByGoogleApi();
    });

    beforeEach(() => {
      cy.viewport("macbook-13"); // tailwind viewport `xl and above`
    });

    it("sees the sidebar", () => {
      cy.get('[data-test="sidebar"]').should("be.visible");
    });

    it("sees the navigation items", () => {
      cy.get('[data-test="sidebar"] button')
        .eq(0)
        .find('[data-test="title"]')
        .should("have.text", "Home");
      cy.get('[data-test="sidebar"] button')
        .eq(1)
        .find('[data-test="title"]')
        .should("have.text", "Product Guides");
      cy.get('[data-test="sidebar"] button')
        .eq(2)
        .find('[data-test="title"]')
        .should("have.text", "Documentation");
      cy.get('[data-test="sidebar"] button')
        .eq(3)
        .find('[data-test="title"]')
        .should("have.text", "What's New");
      cy.get('[data-test="sidebar"] button')
        .eq(4)
        .find('[data-test="title"]')
        .should("have.text", "Logout");
    });
  });
});
