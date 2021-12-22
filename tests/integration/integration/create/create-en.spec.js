describe("Plio Create - en", () => {
  context("Desktop", () => {
    before(() => {
      cy.viewport("macbook-13"); // tailwind viewport `xl and above`
      cy.visit("/").setLocale("en");
      cy.loginByGoogleApi();
      cy.wait(5000); // wait for some time for page to render
      cy.get('[data-title="createPlio"]').click(); // visit create plio page
    });

    beforeEach(() => {
      cy.viewport("macbook-13"); // tailwind viewport `xl and above`
    });

    it("sees the plio options", () => {
      // skeleton options should be visible
      let plioSkeletonOptions = ["videoPreviewSkeleton", "videoLinkInfo"];
      plioSkeletonOptions.forEach((option) => {
        cy.get(`[data-test="${option}"]`).should("be.visible");
      });

      // other plio options should not be visible
      let plioOptions = [
        "plioName",
        "plioPreviewButton",
        "videoPreview",
        "publishButton",
        "itemDiv",
      ];
      plioOptions.forEach((option) => {
        cy.get(`[data-test="${option}"]`).should("not.exist");
      });

      // plio youtube video field
      cy.get('[data-test="videoLinkInput"]')
        .find("input")
        .should("be.visible")
        .type("https://www.youtube.com/watch?v=vnISjBbrMUM");

      // skeleton options should not be visible anymore
      plioSkeletonOptions.forEach((option) => {
        cy.get(`[data-test="${option}"]`).should("not.exist");
      });

      // other plio options should be visible now
      plioOptions.forEach((option) => {
        cy.get(`[data-test="${option}"]`).should("be.visible");
      });
    });

    it("publishes a plio", () => {
      // status badge should be draft
      cy.get('[data-test="plioStatusBadge"]')
        .should("be.visible")
        .and("have.text", "Draft");

      // click on publish button
      cy.get('[data-test="publishButton"]').click();

      // dialog box
      cy.get('[data-test="dialogBox"]').as("dialogBox").should("be.visible");
      cy.get("@dialogBox")
        .find('[data-test="cancelButton"]')
        .should("be.visible");
      cy.get("@dialogBox")
        .find('[data-test="confirmButton"]')
        .should("be.visible")
        .click();

      // publish dialog box should be visible
      cy.get('[data-test="publishedDialog"]')
        .as("publishedDialogBox")
        .should("be.visible");

      // published dialog box options
      let publishDialogBoxOptions = [
        "publishedDialogShareButton",
        "publishedDialogPlayButton",
        "publishedDialogEmbedButton",
        "publishedDialogHomeButton",
      ];
      publishDialogBoxOptions.forEach((option) => {
        cy.get(`[data-test="${option}"]`).should("be.visible");
      });

      // status badge should change to published
      cy.get('[data-test="plioStatusBadge"]')
        .should("be.visible")
        .and("have.text", "Published");
    });
  });
});
