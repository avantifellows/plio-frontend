describe("Login", () => {
  beforeEach(() => {
    cy.visit("/login");
    cy.get("#locale > select").select("hi");
  });

  it("sees the login page heading", () => {
    cy.get('[data-test="loginHeading"]').should(
      "have.text",
      "वीडियों को इंटरैक्टिव पाठों में बदलें"
    );
  });

  it("sees the google sign in option", () => {
    cy.get('[data-test="googleLogin"] p').should(
      "have.text",
      "गूगल से साइन इन करें"
    );
  });

  it("sees the mobile sign in option", () => {
    cy.get('[data-test="phone"] input')
      .invoke("attr", "placeholder")
      .should("contain", "मोबाइल नंबर डालें");
  });

  it("logs into the system", () => {
    cy.loginByGoogleApi();
    cy.get('[data-test="logout"]')
      .should("be.visible")
      .should("have.text", "लॉगआउट");
  });
});
