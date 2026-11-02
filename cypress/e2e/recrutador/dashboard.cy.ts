// Dashboard do recrutador: cards de resumo, tabela de vagas e atalhos.
// Fontes: GET /api/vagas?limit=100, GET /api/usuarios?limit=100 e
// GET /api/vagas/relatorio?periodo=tudo.

const FIX = 'recrutador-vagas';

function stubDashboard() {
  cy.intercept(
    { method: 'GET', pathname: '/api/vagas', query: { limit: '100' } },
    { fixture: `${FIX}/vagas-dashboard.json` },
  ).as('vagas');
  cy.intercept(
    { method: 'GET', pathname: '/api/usuarios', query: { limit: '100' } },
    { fixture: `${FIX}/usuarios-dashboard.json` },
  ).as('usuarios');
  cy.intercept(
    { method: 'GET', pathname: '/api/vagas/relatorio', query: { periodo: 'tudo' } },
    { fixture: `${FIX}/relatorio-geral.json` },
  ).as('relatorio');
}

describe('Recrutador — dashboard', () => {
  beforeEach(() => {
    // Acima de lg para a coluna "Data" da tabela aparecer.
    cy.viewport(1280, 900);
  });

  it('mostra os cards de resumo calculados a partir das APIs', () => {
    stubDashboard();
    cy.visitComo('recrutador', '/dashboard');
    cy.wait(['@vagas', '@usuarios', '@relatorio']);

    // 3 candidatos: dois com papel candidato e um sem tipos_permissao (o
    // recrutador da lista não conta).
    cy.findByRole('link', { name: /^candidatos.*cadastrados$/i })
      .should('have.attr', 'href', '/candidatos')
      .and('contain.text', '3');

    // 2 ativas de 4 vagas.
    cy.findByRole('link', { name: /vagas em aberto/i })
      .should('have.attr', 'href', '/vagas')
      .and('contain.text', '2')
      .and('contain.text', 'de 4 no total');

    // Cobertura: 7 candidaturas / 2 vagas ativas = 3,5.
    cy.findByRole('link', { name: /cobertura das vagas/i })
      .should('have.attr', 'href', '/relatorios')
      .and('contain.text', '3,5')
      .and('contain.text', 'candidaturas por vaga ativa');
  });

  it('lista as vagas na tabela com localização, data e status', () => {
    stubDashboard();
    cy.visitComo('recrutador', '/dashboard');
    cy.wait('@vagas');

    cy.findByRole('table').within(() => {
      cy.findAllByRole('row').should('have.length', 5); // cabeçalho + 4 vagas

      cy.contains('tr', 'Desenvolvedor Front-end').within(() => {
        cy.findByText('Construir interfaces em React para o produto principal.').should('exist');
        cy.findByText('São Paulo - SP').should('be.visible');
        cy.contains(/15 de mar\.? de 2026/).should('be.visible');
        cy.findByText('Ativa').should('be.visible');
      });
      cy.contains('tr', 'Analista de RH').within(() => {
        cy.findByText('Remoto').should('be.visible');
        cy.findByText('Pausada').should('be.visible');
      });
      cy.contains('tr', 'Analista Financeiro').within(() => {
        cy.findByText('Encerrada').should('be.visible');
        cy.findAllByText('—').should('have.length', 1); // sem localização
      });
    });
  });

  it('mostra o nome e o e-mail do usuário logado no menu da conta', () => {
    stubDashboard();
    cy.visitComo('recrutador', '/dashboard');

    cy.findByRole('button', { name: 'Menu da conta' }).should('contain.text', 'RR').click();
    cy.findByRole('menu').within(() => {
      cy.findByText('Rita Recrutadora').should('be.visible');
      cy.findByText('rita@empresa.com').should('be.visible');
      cy.findByRole('menuitem', { name: /sair/i }).should('be.visible');
    });
  });

  it('tem navegação principal e atalhos para as rotas certas', () => {
    stubDashboard();
    cy.visitComo('recrutador', '/dashboard');

    cy.findByRole('navigation', { name: 'Principal' }).within(() => {
      cy.findByRole('link', { name: 'Início' })
        .should('have.attr', 'href', '/dashboard')
        .and('have.attr', 'aria-current', 'page');
      cy.findByRole('link', { name: 'Vagas' }).should('have.attr', 'href', '/vagas');
      cy.findByRole('link', { name: 'Candidatos' }).should('have.attr', 'href', '/candidatos');
      cy.findByRole('link', { name: 'Relatórios' }).should('have.attr', 'href', '/relatorios');
    });

    cy.findByRole('link', { name: /acessar candidatos/i }).should('have.attr', 'href', '/candidatos');
    cy.findByRole('link', { name: /ver relatórios/i }).should('have.attr', 'href', '/relatorios');

    cy.findByRole('link', { name: /criar vaga/i }).click();
    cy.location('pathname').should('eq', '/vagas/nova');
    cy.findByRole('heading', { name: 'Nova Vaga' }).should('be.visible');
  });

  it('clicar no item "Vagas" do menu abre a gestão de vagas', () => {
    stubDashboard();
    cy.visitComo('recrutador', '/dashboard');

    cy.findByRole('navigation', { name: 'Principal' }).findByRole('link', { name: 'Vagas' }).click();
    cy.location('pathname').should('eq', '/vagas');
    cy.findByRole('heading', { name: 'Gerenciamento de Vagas' }).should('be.visible');
  });

  it('avisa quando a lista de vagas falha e mostra o estado vazio', () => {
    stubDashboard();
    cy.intercept(
      { method: 'GET', pathname: '/api/vagas', query: { limit: '100' } },
      { statusCode: 500, body: { success: false, message: 'Falha interna' } },
    ).as('vagasErro');
    cy.visitComo('recrutador', '/dashboard');
    cy.wait('@vagasErro');

    cy.findByText('Erro ao carregar').should('be.visible');
    cy.findByText('Nenhuma vaga cadastrada ainda.').should('be.visible');
    cy.findByRole('table').should('not.exist');

    // "Atualizar" refaz a busca; agora com sucesso.
    cy.intercept(
      { method: 'GET', pathname: '/api/vagas', query: { limit: '100' } },
      { fixture: `${FIX}/vagas-dashboard.json` },
    ).as('vagasOk');
    cy.findByRole('button', { name: /atualizar/i }).click();
    cy.wait('@vagasOk');
    cy.findByRole('table').should('contain.text', 'Desenvolvedor Front-end');
  });

  it('some com o aviso de erro depois de um "Atualizar" bem-sucedido', () => {
    stubDashboard();
    cy.intercept(
      { method: 'GET', pathname: '/api/vagas', query: { limit: '100' } },
      { statusCode: 500, body: { success: false, message: 'Falha interna' } },
    ).as('vagasErro');
    cy.visitComo('recrutador', '/dashboard');
    cy.wait('@vagasErro');
    cy.findByText('Erro ao carregar').should('be.visible');

    cy.intercept(
      { method: 'GET', pathname: '/api/vagas', query: { limit: '100' } },
      { fixture: `${FIX}/vagas-dashboard.json` },
    ).as('vagasOk');
    cy.findByRole('button', { name: /atualizar/i }).click();
    cy.wait('@vagasOk');
    cy.findByRole('table').should('contain.text', 'Desenvolvedor Front-end');
    cy.findByText('Erro ao carregar').should('not.exist');
  });
});

export {};
