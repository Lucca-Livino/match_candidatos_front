const FICHA = '/impressao/vagas/v1/candidatos/c1';

describe('guardas de rota', () => {
  // As homes de destino renderizam depois do redirecionamento e quebram com o
  // `data: []` do catch-all: o dashboard lê `resumo.vagas.porStatus`, a
  // configuração lê o objeto da integração e o painel de usuários lê `docs`.
  beforeEach(() => {
    cy.stubJson('GET', '**/api/vagas/relatorio*', { success: true, data: null });
    cy.stubJson('GET', '**/api/configuracao-integracao', 'suporte/configuracao.json');
    cy.intercept({ method: 'GET', pathname: '/api/usuarios' }, { fixture: 'admin/usuarios-pagina1.json' });
  });

  describe('sem token', () => {
    const casos = [
      { rota: '/dashboard', login: '/login' },
      { rota: '/vagas', login: '/login' },
      { rota: '/candidato', login: '/candidato/login' },
      { rota: '/perfil', login: '/candidato/login' },
      { rota: '/suporte/configuracao', login: '/login' },
      { rota: '/admin/usuarios', login: '/login' },
      { rota: FICHA, login: '/login' },
    ];

    casos.forEach(({ rota, login }) => {
      it(`${rota} redireciona para ${login}`, () => {
        cy.visit(rota);
        cy.location('pathname').should('eq', login);
        cy.findByRole('button', { name: 'Entrar' }).should('be.visible');
      });
    });
  });

  describe('papel fora da área vai para a própria home', () => {
    const casos = [
      { papel: 'candidato', rota: '/dashboard', home: '/candidato' },
      { papel: 'recrutador', rota: '/candidato', home: '/dashboard' },
      { papel: 'suporte', rota: '/admin/usuarios', home: '/suporte/configuracao' },
      { papel: 'administrador', rota: '/suporte/configuracao', home: '/admin/usuarios' },
      { papel: 'administrador', rota: '/vagas', home: '/admin/usuarios' },
    ] as const;

    casos.forEach(({ papel, rota, home }) => {
      it(`${papel} em ${rota} vai para ${home}`, () => {
        cy.visitComo(papel, rota);
        cy.location('pathname').should('eq', home);
      });
    });
  });

  describe('rota pública com sessão', () => {
    it('recrutador logado abrindo /login vai para /dashboard', () => {
      cy.visitComo('recrutador', '/login');
      cy.location('pathname').should('eq', '/dashboard');
    });

    it('candidato logado abrindo /candidato/login vai para /candidato', () => {
      cy.visitComo('candidato', '/candidato/login');
      cy.location('pathname').should('eq', '/candidato');
    });

    it('sessão sem papel em cache consulta /me antes de redirecionar', () => {
      cy.intercept('GET', '**/api/me', {
        statusCode: 200,
        body: { success: true, data: { id: 'u-suporte', name: 'Sara', email: 'sara@empresa.com', tipos_permissao: ['suporte'] } },
      }).as('me');
      cy.visit('/login', {
        onBeforeLoad(win) {
          win.localStorage.setItem('auth_token', 'tok-suporte');
          win.localStorage.setItem('auth_user', JSON.stringify({ id: 'u-suporte', name: 'Sara', email: 'sara@empresa.com' }));
        },
      });
      cy.wait('@me');
      cy.location('pathname').should('eq', '/suporte/configuracao');
    });
  });

  describe('resposta 401 da API', () => {
    it('recrutador: limpa storage e redireciona para /login', () => {
      // Registrado antes do visitComo: o /me dele vence, todo o resto responde 401.
      cy.intercept('**/api/**', { statusCode: 401, body: { message: 'Sessão expirada' } }).as('expirada');
      cy.visitComo('recrutador', '/dashboard');

      cy.wait('@expirada');
      cy.location('pathname').should('eq', '/login');
      cy.window().then((win) => {
        expect(win.localStorage.getItem('auth_token')).to.be.null;
        expect(win.localStorage.getItem('auth_user')).to.be.null;
      });
    });

    it('candidato: um 401 limpa storage e redireciona para /candidato/login', () => {
      // Só a primeira chamada expira; as demais caem no catch-all.
      cy.intercept({ url: '**/api/**', times: 1 }, { statusCode: 401, body: { message: 'Sessão expirada' } }).as('expirada');
      cy.visitComo('candidato', '/candidato');

      cy.wait('@expirada');
      cy.location('pathname').should('eq', '/candidato/login');
      cy.window().its('localStorage').invoke('getItem', 'auth_token').should('be.null');
    });

    // Regressão: o primeiro 401 apaga o papel em cache; os 401 paralelos que
    // chegam depois (a home do candidato dispara mais de uma requisição, e o
    // StrictMode duplica) não podem sobrescrever o destino com '/login'.
    it('candidato: vários 401 simultâneos ainda levam a /candidato/login', () => {
      cy.intercept('**/api/**', { statusCode: 401, body: { message: 'Sessão expirada' } }).as('expirada');
      cy.visitComo('candidato', '/candidato');

      cy.wait('@expirada');
      cy.location('pathname').should('eq', '/candidato/login');
    });
  });

  describe('ficha de impressão', () => {
    // 404 da ficha prova que a guarda deixou passar sem montar uma ficha inteira.
    beforeEach(() => {
      cy.stubJson('GET', '**/api/vagas/v1/candidaturas/c1/ficha', 'auth/ficha-nao-encontrada.json', 'ficha', 404);
    });

    (['recrutador', 'suporte'] as const).forEach((papel) => {
      it(`${papel} acessa a ficha`, () => {
        cy.visitComo(papel, FICHA);
        cy.wait('@ficha');
        cy.location('pathname').should('eq', FICHA);
        cy.findByText('Candidatura não encontrada.').should('be.visible');
        cy.findByRole('button', { name: /Imprimir/ }).should('be.disabled');
      });
    });

    const negados = [
      { papel: 'candidato', home: '/candidato' },
      { papel: 'administrador', home: '/admin/usuarios' },
    ] as const;

    negados.forEach(({ papel, home }) => {
      it(`${papel} não acessa a ficha e vai para ${home}`, () => {
        cy.visitComo(papel, FICHA);
        cy.location('pathname').should('eq', home);
      });
    });
  });
});
