describe('sees login', () => {
  beforeEach(() => {
    cy.visit('/login')
    cy.get('#locale > select').select('hi');
  });

  it('sees the google sign in option', () => {
    cy.get('[data-test="googleLogin"] p').should('have.text', 'गूगल से साइन इन करें');
  });

  it('sees the mobile sign in option', () => {
    cy.get('[data-test="phone"] input').invoke('attr', 'placeholder').should('contain', 'मोबाइल नंबर डालें');
  });

  it('logs into the system', () => {
    cy.loginByGoogleApi()
    cy.get('[data-test="logout"]').should('be.visible').should('have.text', 'लॉगआउट');
    // cy.get('[data-test="logout"]').should('have.text', 'लॉगआउट');
  });
});
