// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element' }, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional' }, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add("loginByGoogleApi", () => {
  cy.log("Logging in to Google");
  cy.visit("/login");
  cy.window().then((window) => {
    cy.request({
      method: "POST",
      url: "https://www.googleapis.com/oauth2/v4/token",
      body: {
        grant_type: "refresh_token",
        client_id: Cypress.env("auth").google.client_id,
        client_secret: Cypress.env("auth").google.client_secret,
        refresh_token: Cypress.env("auth").google.refresh_token,
      },
    }).then(({ body }) => {
      const { access_token: socialAuthToken } = body;

      // call backend to convert social auth token to django app token
      // see if there is a way to reuse the function defined in VueApp
      cy.request({
        method: "POST",
        url: Cypress.env("plio_backend").convert_social_auth_token_url,
        body: {
          grant_type: "convert_token",
          client_id: Cypress.env("plio_backend").client_id,
          client_secret: Cypress.env("plio_backend").client_secret,
          backend: "google-oauth2",
          token: socialAuthToken,
        },
      }).then(async ({ body }) => {
        await window.__store__.dispatch("auth/setAccessToken", body);
        cy.visit("/home");
      });
    });
  });
});
