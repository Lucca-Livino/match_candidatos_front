describe('smoke', () => {
  it('abre o dashboard autenticado como recrutador', () => {

    cy.stubJson('GET', '**/api/vagas/relatorio*', { success: true, data: null });
    cy.visitComo('recrutador', '/dashboard');
    cy.findByRole('link', { name: 'Vagas' }).should('be.visible');
    cy.contains('Unexpected Application Error').should('not.exist');
  });
});
