import usuarios from '../../fixtures/usuarios.json';

type Papel = keyof typeof usuarios;

// O better-auth devolve o usuário sem `tipos_permissao`: o papel só vem do /me.
function stubSignIn(papel: Papel) {
  const { id, name, email } = usuarios[papel];
  cy.stubJson('POST', '**/api/auth/sign-in/email', { token: `tok-${papel}`, user: { id, name, email } }, 'signIn');
  cy.stubJson('GET', '**/api/me', { success: true, data: usuarios[papel] }, 'me');
}

function entrar(email: string, senha: string) {
  cy.findByLabelText('E-mail').type(email);
  cy.findByLabelText('Senha').type(senha);
  cy.findByRole('button', { name: 'Entrar' }).click();
}

describe('login', () => {
  // O dashboard (home do recrutador) lê `resumo.vagas.porStatus` e quebra com o
  // `data: []` do catch-all; `null` é o estado "sem resumo" que ele trata. As
  // homes do suporte e do administrador também quebram com ele: a configuração
  // lê o objeto da integração e o painel de usuários lê `docs`.
  beforeEach(() => {
    cy.stubJson('GET', '**/api/vagas/relatorio*', { success: true, data: null });
    cy.stubJson('GET', '**/api/configuracao-integracao', 'suporte/configuracao.json');
    cy.intercept({ method: 'GET', pathname: '/api/usuarios' }, { fixture: 'admin/usuarios-pagina1.json' });
  });

  const casos: { papel: Papel; home: string }[] = [
    { papel: 'recrutador', home: '/dashboard' },
    { papel: 'suporte', home: '/suporte/configuracao' },
    { papel: 'administrador', home: '/admin/usuarios' },
  ];

  casos.forEach(({ papel, home }) => {
    it(`login interno do ${papel} redireciona para ${home}`, () => {
      stubSignIn(papel);
      cy.visit('/login');
      entrar(usuarios[papel].email, 'Senha@123');

      cy.location('pathname').should('eq', home);
      cy.window().its('localStorage').invoke('getItem', 'auth_token').should('eq', `tok-${papel}`);
    });
  });

  it('login do candidato em /candidato/login leva para /candidato', () => {
    stubSignIn('candidato');
    cy.visit('/candidato/login');
    entrar(usuarios.candidato.email, 'Senha@123');

    cy.location('pathname').should('eq', '/candidato');
  });

  it('envia e-mail e senha digitados, salva token e usuário com papel', () => {
    stubSignIn('recrutador');
    cy.visit('/login');
    entrar('rita@empresa.com', 'MinhaSenha#9');

    cy.wait('@signIn').its('request.body').should('deep.equal', {
      email: 'rita@empresa.com',
      password: 'MinhaSenha#9',
    });
    // A checagem de bloqueio e o getMe usam o token recém-recebido.
    cy.wait('@me').its('request.headers.authorization').should('eq', 'Bearer tok-recrutador');

    cy.location('pathname').should('eq', '/dashboard');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('auth_token')).to.eq('tok-recrutador');
      const user = JSON.parse(win.localStorage.getItem('auth_user') ?? 'null');
      expect(user.tipos_permissao).to.deep.equal(['recrutador']);
    });
  });

  it('credenciais inválidas mostram mensagem e não salvam sessão', () => {
    cy.stubJson('POST', '**/api/auth/sign-in/email', 'auth/sign-in-invalido.json', 'signIn', 401);
    cy.visit('/login');
    entrar('rita@empresa.com', 'errada');

    cy.wait('@signIn');
    cy.findByText('Credenciais inválidas. Tente novamente.').should('be.visible');
    cy.location('pathname').should('eq', '/login');
    cy.window().its('localStorage').invoke('getItem', 'auth_token').should('be.null');
  });

  it('falha de rede no sign-in mostra erro de conexão', () => {
    cy.intercept('POST', '**/api/auth/sign-in/email', { forceNetworkError: true }).as('signIn');
    cy.visit('/candidato/login');
    entrar('caio@email.com', 'Senha@123');

    cy.findByText('Erro ao conectar com a API. Verifique sua conexão.').should('be.visible');
    cy.location('pathname').should('eq', '/candidato/login');
  });

  const bloqueios = [
    { fixture: 'auth/conta-desativada.json', mensagem: 'Esta conta está desativada. Procure o administrador.' },
    { fixture: 'auth/convite-pendente.json', mensagem: 'Ative sua conta pelo link enviado por e-mail.' },
  ];

  bloqueios.forEach(({ fixture, mensagem }) => {
    it(`conta bloqueada (${fixture}) mostra "${mensagem}"`, () => {
      cy.stubJson('POST', '**/api/auth/sign-in/email', { token: 'tok-bloqueado', user: { id: 'u-x', name: 'X', email: 'x@empresa.com' } }, 'signIn');
      cy.stubJson('GET', '**/api/me', fixture, 'me', 401);
      cy.visit('/login');
      entrar('x@empresa.com', 'Senha@123');

      cy.wait('@me');
      cy.findByText(mensagem).should('be.visible');
      cy.location('pathname').should('eq', '/login');
      cy.window().its('localStorage').invoke('getItem', 'auth_token').should('be.null');
    });
  });

  it('logout pelo menu da conta do recrutador limpa storage e volta a /login', () => {
    cy.visitComo('recrutador', '/dashboard');
    cy.findByRole('button', { name: 'Menu da conta' }).click();
    cy.findByRole('menuitem', { name: 'Sair' }).click();

    cy.location('pathname').should('eq', '/login');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('auth_token')).to.be.null;
      expect(win.localStorage.getItem('auth_user')).to.be.null;
    });
    cy.findByRole('button', { name: 'Entrar' }).should('be.visible');
  });

  it('logout do candidato volta a /candidato/login', () => {
    cy.visitComo('candidato', '/candidato');
    cy.findByRole('button', { name: 'Menu da conta' }).click();
    cy.findByRole('menuitem', { name: 'Sair' }).click();

    cy.location('pathname').should('eq', '/candidato/login');
    cy.window().its('localStorage').invoke('getItem', 'auth_token').should('be.null');
  });
});
