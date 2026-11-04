// Gestão de vagas (/vagas): grid de cards, filtros, paginação e ações.
// A tela faz 1 request da página (limit=6) e até 3 de contagem por status
// (limit=1), todos em GET /api/vagas.

const FIX = 'recrutador-vagas';

const vazio = { success: true, data: { docs: [], totalDocs: 0, totalPages: 1, page: 1 } };

function stubContagens(totais: Record<string, number> = { ativa: 4, pausada: 3, arquivada: 1 }) {
  cy.intercept({ method: 'GET', pathname: '/api/vagas', query: { limit: '1' } }, (req) => {
    const status = String(req.query.status ?? '');
    const total = totais[status] ?? 0;
    req.reply({ success: true, data: { docs: [], totalDocs: total, totalPages: total, page: 1 } });
  }).as('contagem');
}

function stubPagina(resposta: string | object, alias = 'lista', query: Record<string, string> = {}) {
  const body = typeof resposta === 'string' ? { fixture: resposta } : { body: resposta };
  cy.intercept({ method: 'GET', pathname: '/api/vagas', query: { limit: '6', ...query } }, body).as(alias);
}

function card(titulo: string) {
  return cy.findByRole('heading', { level: 3, name: titulo }).parents('.rounded-md').first();
}

function escolherNoSelect(rotulo: string, opcao: string) {
  cy.findByRole('combobox', { name: rotulo }).click();
  cy.findByRole('option', { name: opcao }).click();
}

describe('Recrutador — lista de vagas', () => {
  beforeEach(() => {
    stubContagens();
    stubPagina(`${FIX}/vagas-pagina1.json`);
  });

  it('mostra os cards com área, título, candidatos e status, e os totais', () => {
    cy.visitComo('recrutador', '/vagas');
    cy.wait('@lista').its('request.query').should('include', { page: '1', limit: '6' });

    cy.findByRole('heading', { name: 'Gerenciamento de Vagas' }).should('be.visible');
    cy.findAllByRole('heading', { level: 3 }).should('have.length', 3);

    card('Desenvolvedor Front-end').within(() => {
      cy.findByText('TI').should('be.visible');
      cy.findByText('5 Candidatos').should('be.visible');
      cy.findByText('STATUS: PUBLICADA E ATIVA').should('be.visible');
    });
    card('Analista de RH').within(() => {
      cy.findByText('1 Candidato').should('be.visible');
      cy.findByText('STATUS: PAUSADA PARA REVISÃO').should('be.visible');
    });
    card('Analista Financeiro').within(() => {
      cy.findByText('FINANCEIRO').should('be.visible');
      cy.findByText('STATUS: ENCERRADA').should('be.visible');
    });

    // Totais: total vem da página; os demais das requests de contagem.
    cy.contains('span', 'TOTAL:').find('strong').should('have.text', '8');
    cy.contains('span', 'ATIVAS:').find('strong').should('have.text', '4');
    cy.contains('span', 'PAUSADAS:').find('strong').should('have.text', '3');
    cy.contains('span', 'ENCERRADAS:').find('strong').should('have.text', '1');
  });

  it('a busca envia o termo como `titulo` e mostra o resultado filtrado', () => {
    cy.visitComo('recrutador', '/vagas');
    cy.wait('@lista');

    stubPagina(
      {
        success: true,
        data: {
          docs: [{ _id: 'v-1', titulo: 'Desenvolvedor Front-end', area: 'TI', status: 'ativa' }],
          totalDocs: 1,
          totalPages: 1,
          page: 1,
        },
      },
      'busca',
      { titulo: 'Front' },
    );
    cy.findByRole('searchbox', { name: 'Buscar vagas' }).type('Front');

    // O front manda o termo em `titulo` (não em `q`).
    cy.wait('@busca').its('request.query').should('include', { titulo: 'Front', page: '1' });
    cy.findAllByRole('heading', { level: 3 }).should('have.length', 1);
    cy.findByRole('heading', { level: 3, name: 'Desenvolvedor Front-end' }).should('be.visible');
    cy.findByRole('heading', { level: 3, name: 'Analista de RH' }).should('not.exist');
  });

  it('o filtro de área envia `area` na request', () => {
    cy.visitComo('recrutador', '/vagas');
    cy.wait('@lista');

    stubPagina(
      {
        success: true,
        data: {
          docs: [{ _id: 'v-2', titulo: 'Analista de RH', area: 'RH', status: 'pausada' }],
          totalDocs: 1,
          totalPages: 1,
          page: 1,
        },
      },
      'porArea',
      { area: 'RH' },
    );
    escolherNoSelect('Filtrar por área', 'RH');

    cy.wait('@porArea').its('request.query').should('include', { area: 'RH' });
    cy.findByRole('combobox', { name: 'Filtrar por área' }).should('contain.text', 'RH');
    cy.findAllByRole('heading', { level: 3 }).should('have.length', 1).and('have.text', 'Analista de RH');
  });

  it('o filtro de status envia `status` e só conta o status escolhido', () => {
    cy.visitComo('recrutador', '/vagas');
    cy.wait('@lista');

    stubPagina(
      {
        success: true,
        data: {
          docs: [{ _id: 'v-2', titulo: 'Analista de RH', area: 'RH', status: 'pausada' }],
          totalDocs: 3,
          totalPages: 1,
          page: 1,
        },
      },
      'porStatus',
      { status: 'pausada' },
    );
    escolherNoSelect('Filtrar por status', 'Pausada');

    cy.wait('@porStatus').its('request.query').should('include', { status: 'pausada' });
    cy.findByRole('combobox', { name: 'Filtrar por status' }).should('contain.text', 'Pausada');
    cy.findAllByRole('heading', { level: 3 }).should('have.length', 1);
    cy.contains('span', 'PAUSADAS:').find('strong').should('have.text', '3');
    // Com status filtrado, as outras contagens não são buscadas e ficam em 0.
    cy.contains('span', 'ATIVAS:').find('strong').should('have.text', '0');
    cy.contains('span', 'ENCERRADAS:').find('strong').should('have.text', '0');
  });

  it('a paginação pede a página 2 e mostra as vagas dela', () => {
    cy.visitComo('recrutador', '/vagas');
    cy.wait('@lista');

    stubPagina(`${FIX}/vagas-pagina2.json`, 'pagina2', { page: '2' });
    cy.findByRole('button', { name: '2' }).click();

    cy.wait('@pagina2').its('request.query').should('include', { page: '2', limit: '6' });
    cy.findByRole('heading', { level: 3, name: 'Advogado Trabalhista' }).should('be.visible');
    cy.findByRole('heading', { level: 3, name: 'Coordenador de Operações' }).should('be.visible');
    cy.findByRole('heading', { level: 3, name: 'Desenvolvedor Front-end' }).should('not.exist');
    card('Coordenador de Operações').findByText('OPERAÇÕES').should('be.visible');
  });

  it('sem vagas mostra o estado vazio e o botão leva para /vagas/nova', () => {
    stubContagens({});
    stubPagina(vazio);
    cy.visitComo('recrutador', '/vagas');
    cy.wait('@lista');

    cy.findByText('Nenhuma vaga cadastrada ainda.').should('be.visible');
    cy.findByText('Crie a primeira vaga para começar a receber candidaturas.').should('be.visible');
    cy.findAllByRole('heading', { level: 3 }).should('not.exist');

    // Há dois botões "Nova vaga" (cabeçalho e estado vazio); ambos vão para o form.
    cy.findAllByRole('button', { name: /nova vaga/i }).should('have.length', 2).last().click();
    cy.location('pathname').should('eq', '/vagas/nova');
  });

  it('busca sem resultado mostra o vazio com "Limpar filtros", que zera a busca', () => {
    cy.visitComo('recrutador', '/vagas');
    cy.wait('@lista');

    stubPagina(vazio, 'semResultado', { titulo: 'xyz' });
    cy.findByRole('searchbox', { name: 'Buscar vagas' }).type('xyz');
    cy.wait('@semResultado');
    cy.findByText('Nenhuma vaga corresponde aos filtros.').should('be.visible');

    cy.findByRole('button', { name: 'Limpar filtros' }).click();
    cy.findByRole('searchbox', { name: 'Buscar vagas' }).should('have.value', '');
    cy.findAllByRole('heading', { level: 3 }).should('have.length', 3);
  });

  it('erro da API mostra o alerta e "Tentar novamente" recarrega', () => {
    cy.intercept(
      { method: 'GET', pathname: '/api/vagas', query: { limit: '6' } },
      { statusCode: 500, body: { success: false, message: 'Erro interno' } },
    ).as('listaErro');
    cy.visitComo('recrutador', '/vagas');
    cy.wait('@listaErro');

    cy.findByRole('alert').within(() => {
      cy.findByText('Não foi possível carregar as vagas.').should('be.visible');
    });

    stubPagina(`${FIX}/vagas-pagina1.json`, 'listaOk');
    cy.findByRole('button', { name: /tentar novamente/i }).click();
    cy.wait('@listaOk');
    cy.findByRole('alert').should('not.exist');
    cy.findAllByRole('heading', { level: 3 }).should('have.length', 3);
  });

  describe('ações do card', () => {
    beforeEach(() => {
      cy.visitComo('recrutador', '/vagas');
      cy.wait('@lista');
    });

    it('"Editar Vaga" abre /vagas/:id/editar', () => {
      card('Desenvolvedor Front-end').findByRole('button', { name: 'Editar Vaga' }).click();
      cy.location('pathname').should('eq', '/vagas/v-1/editar');
    });

    it('"Ver Candidatos" abre /vagas/:id/candidatos', () => {
      card('Analista de RH').findByRole('button', { name: 'Ver Candidatos' }).click();
      cy.location('pathname').should('eq', '/vagas/v-2/candidatos');
    });

    // As telas de destino montam depois do clique: sem stub, o `data: []` do
    // catch-all quebra a duplicação (lê `vaga.titulo`) e o relatório (`dados.vaga`).
    it('"Duplicar" abre /vagas/:id/duplicar', () => {
      cy.intercept({ method: 'GET', pathname: '/api/vagas/v-1' }, { fixture: `${FIX}/vaga-existente.json` });
      card('Desenvolvedor Front-end').findByRole('button', { name: 'Duplicar' }).click();
      cy.location('pathname').should('eq', '/vagas/v-1/duplicar');
    });

    it('vaga encerrada mostra "Relatório" e "Duplicar", sem editar', () => {
      cy.intercept(
        { method: 'GET', pathname: '/api/vagas/v-3/relatorio' },
        { fixture: 'recrutador-candidatos/relatorio-vaga.json' },
      );
      card('Analista Financeiro').within(() => {
        cy.findByRole('button', { name: 'Editar Vaga' }).should('not.exist');
        cy.findByRole('button', { name: 'Ver Candidatos' }).should('not.exist');
        cy.findByRole('button', { name: 'Duplicar' }).should('be.visible');
        cy.findByRole('button', { name: 'Relatório' }).click();
      });
      cy.location('pathname').should('eq', '/vagas/v-3/relatorio');
    });

    it('"Nova Vaga" do cabeçalho abre o formulário', () => {
      cy.findByRole('button', { name: /nova vaga/i }).click();
      cy.location('pathname').should('eq', '/vagas/nova');
    });
  });

  describe('troca rápida de status', () => {
    beforeEach(() => {
      cy.visitComo('recrutador', '/vagas');
      cy.wait('@lista');
    });

    it('"Pausar" envia só o status e recarrega a lista', () => {
      cy.intercept({ method: 'PATCH', pathname: '/api/vagas/v-1' }, { success: true, data: { _id: 'v-1', status: 'pausada' } }).as('status');
      card('Desenvolvedor Front-end').within(() => {
        cy.findByRole('button', { name: 'Ativar' }).should('not.exist');
        cy.findByRole('button', { name: 'Pausar' }).click();
      });
      cy.wait('@status').its('request.body').should('deep.equal', { status: 'pausada' });
      cy.wait('@lista');
    });

    it('"Ativar" em vaga pausada mostra o erro da API no card', () => {
      cy.intercept(
        { method: 'PATCH', pathname: '/api/vagas/v-2' },
        { statusCode: 400, body: { success: false, message: 'Vaga só pode ser ativada com um questionário ativo.' } },
      ).as('status');
      card('Analista de RH').within(() => {
        cy.findByRole('button', { name: 'Ativar' }).click();
        cy.findByRole('alert').should('have.text', 'Vaga só pode ser ativada com um questionário ativo.');
      });
      cy.wait('@status').its('request.body').should('deep.equal', { status: 'ativa' });
    });

    it('"Encerrar" pede confirmação antes de enviar', () => {
      cy.intercept({ method: 'PATCH', pathname: '/api/vagas/v-1' }, { success: true, data: { _id: 'v-1', status: 'arquivada' } }).as('status');
      card('Desenvolvedor Front-end').within(() => {
        cy.findByRole('button', { name: 'Encerrar' }).click();
      });
      cy.findByRole('dialog').within(() => {
        cy.findByText(/não poderá ser reaberta/).should('be.visible');
        cy.findByRole('button', { name: 'Cancelar' }).click();
      });
      cy.get('@status.all').should('have.length', 0);

      card('Desenvolvedor Front-end').within(() => {
        cy.findByRole('button', { name: 'Encerrar' }).click();
      });
      cy.findByRole('button', { name: 'Encerrar vaga' }).click();
      cy.wait('@status').its('request.body').should('deep.equal', { status: 'arquivada' });
      cy.findByRole('dialog').should('not.exist');
    });

    it('vaga encerrada não mostra ações de status', () => {
      card('Analista Financeiro').within(() => {
        cy.findByRole('button', { name: /Pausar|Ativar|Encerrar/ }).should('not.exist');
      });
    });
  });
});

export {};
