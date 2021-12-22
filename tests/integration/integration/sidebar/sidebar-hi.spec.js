describe("Sidebar", () => {
  context("Desktop", () => {
    before(() => {
      cy.viewport("macbook-13"); // tailwind viewport `xl and above`
      cy.visit("/").setLocale("hi");
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
        .should("have.text", "होम");
      cy.get('[data-test="sidebar"] button')
        .eq(1)
        .find('[data-test="title"]')
        .should("have.text", "उत्पाद गाइड");
      cy.get('[data-test="sidebar"] button')
        .eq(2)
        .find('[data-test="title"]')
        .should("have.text", "दस्तावेज़ीकरण");
      cy.get('[data-test="sidebar"] button')
        .eq(3)
        .find('[data-test="title"]')
        .should("have.text", "नया क्या है");
      cy.get('[data-test="sidebar"] button')
        .eq(4)
        .find('[data-test="title"]')
        .should("have.text", "लॉगआउट");
    });
  });
});
