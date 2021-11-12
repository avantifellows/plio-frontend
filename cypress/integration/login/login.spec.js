describe('sees login', () => {
  beforeEach(() => {
    cy.visit('/login')
  });

  it('sees the google sign in option', () => {
    cy.get('[data-test="googleLogin"] p').should('have.text', 'Sign in with Google');
    // cy.get('[data-test="googleLogin"] p').should('have.text', 'गूगल से साइन इन करें');
  });

  it('sees the language switcher dropdown', () => {
    cy.get('#locale > select').should('be.visible');
  });

  it('logs into the system', () => {
    cy.loginByGoogleApi()
    cy.get('[data-test="logout"]').should('be.visible');
  });
});
