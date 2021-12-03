describe("Login", () => {
  context("Desktop", () => {
    beforeEach(() => {
      cy.viewport("macbook-13"); // tailwind viewport `xl and above`
      cy.visit("/").setLocale("en");
    });

    it("sees the login page heading", () => {
      cy.get('[data-test="loginHeading"]').should(
        "have.text",
        "Convert videos into interactive lessons"
      );
    });

    it("sees the google sign in option", () => {
      cy.get('[data-test="googleLogin"] p').should(
        "have.text",
        "Sign in with Google"
      );
    });

    it("sees the mobile sign in option", () => {
      cy.get('[data-test="phone"] input')
        .invoke("attr", "placeholder")
        .should("contain", "Enter Mobile Number");
    });

    it("sees the language switcher dropdown", () => {
      cy.get("#locale > select").should("be.visible");
    });

    it("logs into the system using google auth", () => {
      cy.loginByGoogleApi();
      cy.get('[data-test="logout"]')
        .should("be.visible")
        .should("have.text", "Logout");
    });
  });
});
