const SENHA_FORTE = 'Forte@2026';

function preencher(senha: string, confirmacao = senha) {
  cy.findByLabelText('Nova senha').clear().type(senha);
  cy.findByLabelText('Confirme a senha').clear().type(confirmacao);
}

describe('ativar conta', () => {
  it('sem token na URL mostra aviso de link incompleto e nenhum formulário', () => {
    cy.visit('/ativar-conta');
    cy.findByText(/Link incompleto/).should('be.visible');
    cy.findByLabelText('Nova senha').should('not.exist');
  });

  it('lê o token da URL e limpa a barra de endereço', () => {
    cy.visit('/ativar-conta?token=tok-convite');
    cy.findByRole('heading', { name: 'Ativar conta' }).should('be.visible');
    cy.location('search').should('eq', '');
    cy.findByLabelText('Nova senha').should('be.visible');
  });

  it('valida as regras de senha e a confirmação antes de habilitar o envio', () => {
    cy.intercept('POST', '**/api/usuarios/ativar', cy.spy().as('ativarSpy'));
    cy.visit('/ativar-conta?token=tok-convite');
    const botao = () => cy.findByRole('button', { name: 'Ativar conta' });

    botao().should('be.disabled');

    // Só minúsculas e curta: nenhuma regra além da minúscula é atendida.
    cy.findByLabelText('Nova senha').type('abc');
    cy.findByText(/Uma letra minúscula/).should('contain.text', '✓');
    cy.findByText(/De 8 a 128 caracteres/).should('contain.text', '•');
    cy.findByText(/Uma letra maiúscula/).should('contain.text', '•');
    cy.findByText(/Um número/).should('contain.text', '•');
    cy.findByText(/Um caractere especial/).should('contain.text', '•');
    botao().should('be.disabled');

    // Senha forte, confirmação diferente.
    preencher(SENHA_FORTE, 'Outra@2026');
    ['De 8 a 128 caracteres', 'Uma letra maiúscula', 'Uma letra minúscula', 'Um número', 'Um caractere especial'].forEach(
      (regra) => cy.findByText(new RegExp(regra)).should('contain.text', '✓'),
    );
    cy.findByText('As senhas não conferem.').should('be.visible');
    botao().should('be.disabled');

    preencher(SENHA_FORTE);
    cy.findByText('As senhas não conferem.').should('not.exist');
    botao().should('be.enabled');
    cy.get('@ativarSpy').should('not.have.been.called');
  });

  it('ativa a conta, encerra sessão anterior e leva ao login', () => {
    cy.stubJson('POST', '**/api/usuarios/ativar', { success: true, data: null }, 'ativar');
    cy.visit('/ativar-conta?token=tok-convite', {
      onBeforeLoad(win) {
        // Outra conta logada neste navegador (ex.: o admin que convidou).
        win.localStorage.setItem('auth_token', 'token-administrador');
        win.localStorage.setItem('auth_user', JSON.stringify({ id: 'u-admin', tipos_permissao: ['administrador'] }));
      },
    });

    preencher(SENHA_FORTE);
    cy.findByRole('button', { name: 'Ativar conta' }).click();

    cy.wait('@ativar').its('request.body').should('deep.equal', { token: 'tok-convite', senha: SENHA_FORTE });
    cy.findByText('Senha definida. Sua conta está ativa.').should('be.visible');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('auth_token')).to.be.null;
      expect(win.localStorage.getItem('auth_user')).to.be.null;
    });

    cy.findByRole('button', { name: 'Ir para o login' }).click();
    cy.location('pathname').should('eq', '/login');
    cy.findByRole('button', { name: 'Entrar' }).should('be.visible');
  });

  it('token inválido mostra a mensagem da API e mantém o formulário', () => {
    cy.stubJson('POST', '**/api/usuarios/ativar', 'auth/ativar-token-invalido.json', 'ativar', 400);
    cy.visit('/ativar-conta?token=tok-vencido');

    preencher(SENHA_FORTE);
    cy.findByRole('button', { name: 'Ativar conta' }).click();

    cy.wait('@ativar').its('request.body.token').should('eq', 'tok-vencido');
    cy.findByText('Link de ativação inválido ou expirado.').should('be.visible');
    cy.findByText('Senha definida. Sua conta está ativa.').should('not.exist');
    cy.findByRole('button', { name: 'Ativar conta' }).should('be.enabled');
    cy.location('pathname').should('eq', '/ativar-conta');
  });

  it('erro 500 sem mensagem mostra o status genérico', () => {
    cy.stubJson('POST', '**/api/usuarios/ativar', {}, 'ativar', 500);
    cy.visit('/ativar-conta?token=tok-convite');

    preencher(SENHA_FORTE);
    cy.findByRole('button', { name: 'Ativar conta' }).click();

    cy.wait('@ativar');
    cy.findByText('Erro 500').should('be.visible');
  });
});
