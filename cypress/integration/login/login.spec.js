/// <reference types="cypress" />

describe('sees login', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080/')
  });

  it('sees the google sign in option', () => {
    cy.get('[data-test="googleLogin"] p').should('have.text', 'Sign in with Google');
    // cy.get('[data-test="googleLogin"] p').should('have.text', 'गूगल से साइन इन करें');
  });

  it('sees the language switcher dropdown', () => {
    cy.get('#locale > select').should('be.visible');
  });
});
