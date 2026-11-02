// Relatórios: geral (/relatorios) e por vaga (/vagas/:id/relatorio).
const F = 'recrutador-candidatos';

type Periodo = '30d' | '90d' | '12m' | 'tudo';

function stubGeral(periodo: Periodo, resposta: string | object, alias: string, statusCode = 200) {
  const body = typeof resposta === 'string' ? { fixture: resposta } : { body: resposta };
  cy.intercept(
    { method: 'GET', pathname: '/api/vagas/relatorio', query: { periodo } },
    { statusCode, ...body },
  ).as(alias);
}

function stubVaga(periodo: Periodo, resposta: string | object, alias: string, statusCode = 200) {
  const body = typeof resposta === 'string' ? { fixture: resposta } : { body: resposta };
  cy.intercept(
    { method: 'GET', pathname: '/api/vagas/v1/relatorio', query: { periodo } },
    { statusCode, ...body },
  ).as(alias);
}

/** Valor e detalhe de um cartão do resumo (dl > dt/dd). */
function metrica(rotulo: string, valor: string, detalhe?: string) {
  cy.contains('dt', rotulo)
    .closest('[class*="break-inside-avoid"]')
    .within(() => {
      cy.get('dd').first().should('have.text', valor);
      if (detalhe) cy.get('dd').eq(1).should('have.text', detalhe);
    });
}

/** Linhas da tabela acessível (sr-only) de um gráfico. */
function tabela(legenda: string, linhas: [string, string][]) {
  cy.findByRole('table', { name: legenda }).within(() => {
    cy.get('tbody tr').should('have.length', linhas.length);
    linhas.forEach(([rotulo, valor], i) => {
      cy.get('tbody tr').eq(i).within(() => {
        cy.get('th').should('have.text', rotulo);
        cy.get('td').should('have.text', valor);
      });
    });
  });
}

const periodo = (rotulo: string) => cy.findByRole('radio', { name: rotulo });

describe('Recrutador: relatório geral', () => {
  it('mostra os números do período "Tudo" por padrão', () => {
    stubGeral('tudo', `${F}/relatorio-geral.json`, 'tudo');
    cy.visitComo('recrutador', '/relatorios');
    cy.wait('@tudo');

    cy.findByRole('heading', { level: 1, name: 'Relatórios' }).should('be.visible');
    periodo('Tudo').should('have.attr', 'aria-checked', 'true');

    metrica('Candidaturas', '20', 'Recebidas em todo o período');
    metrica('Taxa de aprovação', '60%', '3 de 5 decididas');
    metrica('Vagas ativas', '4', 'De 6 criadas em todo o período');

    tabela('Candidaturas por etapa', [
      ['Inscrito', '10'], ['Em análise', '5'], ['Aprovado', '3'], ['Reprovado', '2'],
    ]);
    tabela('Vagas por status', [['Ativa', '4'], ['Pausada', '1'], ['Encerrada', '1']]);
    tabela('Vagas por área', [['TI', '4'], ['OPERAÇÕES', '2']]);
    tabela('Candidaturas por mês', [['set/26', '12'], ['out/26', '8']]);
  });

  it('trocar o período refaz a request com o novo `periodo`', () => {
    stubGeral('tudo', `${F}/relatorio-geral.json`, 'tudo');
    cy.fixture(`${F}/relatorio-geral.json`).then((r) => {
      r.data.periodo = '90d';
      r.data.candidaturas = {
        total: 7,
        porStatus: { inscrito: 3, em_analise: 2, aprovado: 1, reprovado: 1 },
        taxaAprovacao: 0.5,
      };
      stubGeral('90d', r, 'p90');
    });
    cy.visitComo('recrutador', '/relatorios');
    cy.wait('@tudo');
    metrica('Candidaturas', '20');

    periodo('90 dias').click();
    cy.wait('@p90').its('request.url').should('match', /\/api\/vagas\/relatorio\?periodo=90d$/);
    periodo('90 dias').should('have.attr', 'aria-checked', 'true');
    periodo('Tudo').should('have.attr', 'aria-checked', 'false');
    metrica('Candidaturas', '7', 'Recebidas nos últimos 90 dias');
    metrica('Taxa de aprovação', '50%', '1 de 2 decididas');
    metrica('Vagas ativas', '4', 'De 6 criadas nos últimos 90 dias');

    // clicar no item ativo não desmarca nem refaz request
    periodo('90 dias').click();
    periodo('90 dias').should('have.attr', 'aria-checked', 'true');
  });

  it('período sem candidaturas mostra aviso e "Ver todo o período" volta para Tudo', () => {
    stubGeral('tudo', `${F}/relatorio-geral.json`, 'tudo');
    stubGeral('30d', `${F}/relatorio-geral-vazio.json`, 'p30');
    cy.visitComo('recrutador', '/relatorios');
    cy.wait('@tudo');

    periodo('30 dias').click();
    cy.wait('@p30');

    cy.findByRole('status')
      .should('contain.text', 'Nenhuma candidatura nos últimos 30 dias.')
      .and('contain.text', 'Os números abaixo aparecem zerados para este período.');
    metrica('Candidaturas', '0');
    metrica('Taxa de aprovação', '—', 'Nenhuma candidatura decidida ainda');
    metrica('Vagas ativas', '0', 'De 0 criadas nos últimos 30 dias');
    cy.findByText('Nenhuma vaga criada nos últimos 30 dias.').should('be.visible');
    cy.findByText('Nenhuma candidatura registrada.').should('be.visible');
    cy.findByRole('table', { name: 'Vagas por área' }).should('not.exist');

    cy.findByRole('button', { name: 'Ver todo o período' }).click();
    cy.wait('@tudo');
    periodo('Tudo').should('have.attr', 'aria-checked', 'true');
    metrica('Candidaturas', '20');
    cy.findByRole('status').should('not.exist');
  });

  it('"Tudo" sem candidaturas não mostra o aviso de período', () => {
    cy.fixture(`${F}/relatorio-geral-vazio.json`).then((r) => {
      r.data.periodo = 'tudo';
      stubGeral('tudo', r, 'tudo');
    });
    cy.visitComo('recrutador', '/relatorios');
    cy.wait('@tudo');
    metrica('Candidaturas', '0', 'Recebidas em todo o período');
    cy.findByRole('status').should('not.exist');
    cy.findByRole('button', { name: 'Ver todo o período' }).should('not.exist');
  });

  it('erro da API mostra "Relatório indisponível" e "Tentar novamente" recarrega', () => {
    stubGeral('tudo', { success: false, message: 'falhou' }, 'falha', 500);
    cy.visitComo('recrutador', '/relatorios');
    cy.wait('@falha');

    cy.findByRole('alert')
      .should('contain.text', 'Relatório indisponível')
      .and('contain.text', 'Não foi possível gerar o relatório. Verifique a conexão e tente novamente.');

    stubGeral('tudo', `${F}/relatorio-geral.json`, 'tudo');
    cy.findByRole('button', { name: /Tentar novamente/ }).click();
    cy.wait('@tudo');
    cy.findByRole('alert').should('not.exist');
    metrica('Candidaturas', '20');
  });
});

describe('Recrutador: relatório da vaga', () => {
  it('mostra cabeçalho, números, série e tabela de candidatos', () => {
    stubVaga('tudo', `${F}/relatorio-vaga.json`, 'tudo');
    cy.visitComo('recrutador', '/vagas/v1/relatorio');
    cy.wait('@tudo');

    cy.findByText('Relatório da vaga').should('be.visible');
    cy.findByRole('heading', { level: 1, name: 'Desenvolvedor Front-end' }).should('be.visible');
    cy.findByText('TI · Pausada · criada em 01/09/2026').should('be.visible');
    cy.findByRole('link', { name: /Voltar para vagas/ }).should('have.attr', 'href', '/vagas');

    metrica('Candidaturas', '4', 'Recebidas em todo o período');
    metrica('Taxa de aprovação', '50%', '1 de 2 decididas');
    metrica('Em análise', '1', 'Aguardando decisão');

    tabela('Candidaturas por etapa', [
      ['Inscrito', '1'], ['Em análise', '1'], ['Aprovado', '1'], ['Reprovado', '1'],
    ]);
    tabela('Candidaturas por semana', [['14/09', '3'], ['21/09', '1']]);

    cy.findByRole('table', { name: 'Candidatos da vaga por etapa' }).within(() => {
      cy.get('tbody tr').should('have.length', 4);
      cy.get('tbody tr').eq(0).should('contain.text', 'Ana Souza').and('contain.text', 'Inscrito').and('contain.text', '15/09/2026');
      cy.get('tbody tr').eq(2).should('contain.text', 'Carla Dias').and('contain.text', 'Aprovado');
      cy.get('tbody tr').eq(3).should('contain.text', 'Candidato removido').and('contain.text', 'Reprovado').and('contain.text', '22/09/2026');
    });
  });

  it('trocar o período refaz a request da vaga e mostra estado vazio', () => {
    stubVaga('tudo', `${F}/relatorio-vaga.json`, 'tudo');
    cy.fixture(`${F}/relatorio-vaga.json`).then((r) => {
      r.data.periodo = '12m';
      r.data.candidaturas = {
        total: 0,
        porStatus: { inscrito: 0, em_analise: 0, aprovado: 0, reprovado: 0 },
        taxaAprovacao: null,
      };
      r.data.serie = { granularidade: 'mes', pontos: [] };
      r.data.candidatos = [];
      stubVaga('12m', r, 'p12');
    });
    cy.visitComo('recrutador', '/vagas/v1/relatorio');
    cy.wait('@tudo');

    periodo('12 meses').click();
    cy.wait('@p12').its('request.url').should('match', /\/api\/vagas\/v1\/relatorio\?periodo=12m$/);

    cy.findByRole('status').should('contain.text', 'Nenhuma candidatura nos últimos 12 meses.');
    metrica('Candidaturas', '0', 'Recebidas nos últimos 12 meses');
    metrica('Taxa de aprovação', '—', 'Nenhuma candidatura decidida ainda');
    cy.findByText('Nenhuma candidatura registrada.').should('be.visible');
    cy.findByRole('region', { name: 'Candidatos' })
      .findByText('Nenhuma candidatura nos últimos 12 meses.')
      .should('be.visible');
    cy.findByRole('table', { name: 'Candidatos da vaga por etapa' }).should('not.exist');
  });

  it('404 mostra "Vaga não encontrada" sem filtro de período', () => {
    stubVaga('tudo', { success: false, message: 'Vaga não encontrada' }, 'nf', 404);
    cy.visitComo('recrutador', '/vagas/v1/relatorio');
    cy.wait('@nf');

    cy.findByRole('heading', { level: 1, name: 'Vaga não encontrada' }).should('be.visible');
    cy.findByText('A vaga pode ter sido removida.').should('be.visible');
    cy.findByRole('link', { name: 'Ir para a lista de vagas' }).should('have.attr', 'href', '/vagas');
    cy.findByRole('group', { name: 'Período do relatório' }).should('not.exist');
    cy.findByRole('button', { name: /Imprimir/ }).should('not.exist');
  });

  it('erro 500 mostra "Relatório indisponível"', () => {
    stubVaga('tudo', { success: false, message: 'erro' }, 'falha', 500);
    cy.visitComo('recrutador', '/vagas/v1/relatorio');
    cy.wait('@falha');
    cy.findByRole('alert')
      .should('contain.text', 'Relatório indisponível')
      .and('contain.text', 'Não foi possível gerar o relatório.');
    cy.findByRole('button', { name: /Tentar novamente/ }).should('be.visible');
  });
});

export {};
