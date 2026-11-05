// Kanban de candidatos de uma vaga (/vagas/:id/candidatos).
const F = 'recrutador-candidatos';
const URL_PAGINA = '/vagas/v1/candidatos';
const PATCH_STATUS = '**/api/usuarios/*/candidatura/v1/status';

function stubKanban() {
  cy.stubJson('GET', '**/api/vagas/v1', `${F}/vaga.json`, 'vaga');
  cy.stubJson('GET', '**/api/vagas/v1/candidaturas', `${F}/candidaturas-vaga.json`, 'candidaturas');
}

function stubPatchOk() {
  cy.intercept('PATCH', PATCH_STATUS, (req) => {
    const [, usuarioId] = req.url.match(/usuarios\/([^/]+)\/candidatura/) ?? [];
    req.reply({
      statusCode: 200,
      body: { success: true, data: { id: `c-${usuarioId.replace('u-', '')}`, usuarioId, vagaId: 'v1', status: req.body.status } },
    });
  }).as('patch');
}

const coluna = (nome: string) => cy.findByRole('region', { name: nome });

function abrirKanban() {
  stubKanban();
  cy.visitComo('recrutador', URL_PAGINA);
  cy.findByRole('heading', { level: 1, name: 'Desenvolvedor Front-end' }).should('be.visible');
}

describe('Recrutador: kanban de candidatos da vaga', () => {
  it('mostra as colunas por status com os candidatos nos lugares certos', () => {
    abrirKanban();
    cy.contains('4 candidatos').should('be.visible');

    coluna('Inscrito').within(() => {
      cy.findByText('Ana Souza').should('be.visible');
      cy.findByText('1').should('be.visible');
      cy.findByRole('button', { name: /Mover para análise/ }).should('be.visible');
      cy.findByRole('button', { name: /Aprovar|Reprovar|Reabrir/ }).should('not.exist');
    });
    coluna('Em análise').within(() => {
      cy.findByText('Bruno Lima').should('be.visible');
      cy.findByText('Análise reaberta em 10/10/2026').should('be.visible');
      cy.findByRole('button', { name: /^Aprovar$/ }).should('be.visible');
      cy.findByRole('button', { name: /^Reprovar$/ }).should('be.visible');
      cy.findByRole('button', { name: /Mover para análise|Reabrir/ }).should('not.exist');
    });
    coluna('Aprovado').within(() => {
      cy.findByText('Carla Dias').should('be.visible');
      cy.findAllByRole('button', { name: /Reabrir análise/ }).should('have.length', 1);
      cy.findByRole('button', { name: /^Aprovar$|^Reprovar$/ }).should('not.exist');
    });
    coluna('Reprovado').within(() => {
      cy.findByText('Candidato removido').should('be.visible');
      cy.findAllByRole('button', { name: /Reabrir análise/ }).should('have.length', 1);
    });
  });

  it('inscrito -> em análise envia PATCH sem confirmação e move o card', () => {
    stubPatchOk();
    abrirKanban();

    coluna('Inscrito').findByRole('button', { name: /Mover para análise/ }).click();

    cy.wait('@patch').then(({ request }) => {
      expect(request.url).to.match(/\/api\/usuarios\/u-1\/candidatura\/v1\/status$/);
      expect(request.body).to.deep.equal({ status: 'em_analise', movidoPor: 'recrutador' });
    });
    coluna('Inscrito').within(() => {
      cy.findByText('Ana Souza').should('not.exist');
      cy.findByText('Nenhum candidato').should('be.visible');
    });
    coluna('Em análise').findByText('Ana Souza').should('be.visible');
  });

  it('em análise -> aprovado pede confirmação, envia PATCH e move o card', () => {
    stubPatchOk();
    abrirKanban();

    coluna('Em análise').findByRole('button', { name: /^Aprovar$/ }).click();
    cy.findByRole('dialog', { name: 'Aprovar Bruno Lima?' }).within(() => {
      cy.findByRole('button', { name: 'Aprovar candidato' }).click();
    });

    cy.wait('@patch').then(({ request }) => {
      expect(request.url).to.match(/\/usuarios\/u-2\/candidatura\/v1\/status$/);
      expect(request.body).to.deep.equal({ status: 'aprovado', movidoPor: 'recrutador' });
    });
    cy.findByRole('dialog').should('not.exist');
    coluna('Aprovado').within(() => {
      cy.findByText('Bruno Lima').should('be.visible');
      cy.findByText('Carla Dias').should('be.visible');
    });
    coluna('Em análise').findByText('Bruno Lima').should('not.exist');
  });

  it('em análise -> reprovado pede confirmação; cancelar não envia nada', () => {
    stubPatchOk();
    abrirKanban();

    coluna('Em análise').findByRole('button', { name: /^Reprovar$/ }).click();
    cy.findByRole('dialog', { name: 'Reprovar Bruno Lima?' })
      .findByRole('button', { name: 'Cancelar' })
      .click();
    cy.findByRole('dialog').should('not.exist');
    cy.get('@patch.all').should('have.length', 0);
    coluna('Em análise').findByText('Bruno Lima').should('be.visible');

    coluna('Em análise').findByRole('button', { name: /^Reprovar$/ }).click();
    cy.findByRole('dialog', { name: 'Reprovar Bruno Lima?' })
      .findByRole('button', { name: 'Reprovar candidato' })
      .click();

    cy.wait('@patch').its('request.body').should('deep.equal', { status: 'reprovado', movidoPor: 'recrutador' });
    coluna('Reprovado').findByText('Bruno Lima').should('be.visible');
    coluna('Em análise').findByText('Nenhum candidato').should('be.visible');
  });

  it('aprovado e reprovado podem ser reabertos para análise', () => {
    stubPatchOk();
    abrirKanban();

    coluna('Aprovado').findByRole('button', { name: /Reabrir análise/ }).click();
    cy.wait('@patch').then(({ request }) => {
      expect(request.url).to.match(/\/usuarios\/u-3\/candidatura\/v1\/status$/);
      expect(request.body).to.deep.equal({ status: 'em_analise', movidoPor: 'recrutador' });
    });
    coluna('Em análise').findByText('Carla Dias').should('be.visible');
    coluna('Aprovado').findByText('Nenhum candidato').should('be.visible');

    coluna('Reprovado').findByRole('button', { name: /Reabrir análise/ }).click();
    cy.wait('@patch').then(({ request }) => {
      expect(request.url).to.match(/\/usuarios\/u-4\/candidatura\/v1\/status$/);
      expect(request.body).to.deep.equal({ status: 'em_analise', movidoPor: 'recrutador' });
    });
    coluna('Em análise').findByText('Candidato removido').should('be.visible');
    coluna('Reprovado').findByText('Nenhum candidato').should('be.visible');
  });

  it('erro no PATCH mostra a mensagem da API e mantém o card na coluna', () => {
    cy.stubJson(
      'PATCH',
      PATCH_STATUS,
      { success: false, message: 'Transição de status inválida.' },
      'patch',
      422,
    );
    abrirKanban();

    coluna('Inscrito').findByRole('button', { name: /Mover para análise/ }).click();
    cy.wait('@patch');

    cy.findByRole('alert').should('contain.text', 'Transição de status inválida.');
    coluna('Inscrito').findByText('Ana Souza').should('be.visible');
    coluna('Em análise').findByText('Ana Souza').should('not.exist');
  });

  it('erro ao carregar candidaturas mostra alerta e recarrega', () => {
    cy.stubJson('GET', '**/api/vagas/v1', `${F}/vaga.json`);
    cy.stubJson('GET', '**/api/vagas/v1/candidaturas', { success: false, message: 'boom' }, 'falha', 500);
    cy.visitComo('recrutador', URL_PAGINA);

    cy.findByRole('alert').should('contain.text', 'Falha ao carregar candidatos da vaga.');

    cy.stubJson('GET', '**/api/vagas/v1/candidaturas', `${F}/candidaturas-vaga.json`, 'candidaturas');
    cy.findByRole('button', { name: /Recarregar candidatos/ }).click();
    cy.wait('@candidaturas');
    cy.findByRole('alert').should('not.exist');
    coluna('Inscrito').findByText('Ana Souza').should('be.visible');
  });

  it('abre o detalhe com o currículo do candidato e o link da ficha de impressão', () => {
    cy.stubJson('GET', '**/api/usuarios/u-1/formacao', `${F}/formacao.json`, 'formacao');
    cy.stubJson('GET', '**/api/usuarios/u-1/experiencia', `${F}/experiencia.json`, 'experiencia');
    cy.stubJson('GET', '**/api/usuarios/u-1/habilidade', `${F}/habilidade.json`, 'habilidade');
    cy.stubJson('GET', '**/api/usuarios/u-1/certificacao', `${F}/certificacao.json`, 'certificacao');
    abrirKanban();

    coluna('Inscrito').findByRole('button', { name: /Ana Souza/ }).click();
    cy.wait(['@formacao', '@experiencia', '@habilidade', '@certificacao']);

    cy.findByRole('dialog', { name: 'Ana Souza' }).within(() => {
      cy.findByText('ana.souza@email.com').should('be.visible');
      cy.findByText('Inscrito').should('be.visible');
      cy.findByText('React · Avançado').should('be.visible');
      cy.findByText('TypeScript · Intermediário').should('be.visible');
      cy.findByText('Desenvolvedora Front-end').should('be.visible');
      cy.findByText('Acme Tecnologia').should('be.visible');
      cy.findByText('Manutenção de SPA em React.').should('be.visible');
      cy.findByText('Engenharia de Software').should('be.visible');
      cy.findByText('UFPR · Graduação').should('be.visible');
      cy.findByText('2022 - previsão 2027 · Cursando').should('be.visible');
      cy.findByText('AWS Cloud Practitioner').should('be.visible');
      cy.findByText('Amazon').should('be.visible');
      cy.findByText(/AWS-123/).should('be.visible');

      cy.findByRole('link', { name: /Imprimir \/ PDF/ })
        .should('have.attr', 'href', '/impressao/vagas/v1/candidatos/u-1')
        .and('have.attr', 'target', '_blank');
    });
  });

  it('detalhe sem currículo mostra "Nada informado." e falha mostra erro', () => {
    abrirKanban();
    // catch-all devolve data: [] para u-2
    coluna('Em análise').findByRole('button', { name: /Bruno Lima/ }).click();
    cy.findByRole('dialog', { name: 'Bruno Lima' })
      .findAllByText('Nada informado.')
      .should('have.length', 4);
    cy.get('body').type('{esc}');
    cy.findByRole('dialog').should('not.exist');

    cy.stubJson('GET', '**/api/usuarios/u-3/formacao', { success: false, message: 'erro' }, 'formacaoErro', 500);
    coluna('Aprovado').findByRole('button', { name: /Carla Dias/ }).click();
    cy.wait('@formacaoErro');
    cy.findByRole('dialog', { name: 'Carla Dias' })
      .findByText('Falha ao carregar dados do candidato.')
      .should('be.visible');
  });

  it('mostra o status da vaga e permite pausar sem sair do kanban', () => {
    cy.intercept('PATCH', '**/api/vagas/v1', (req) => {
      req.reply({ statusCode: 200, body: { success: true, data: { _id: 'v1', titulo: 'Desenvolvedor Front-end', status: req.body.status } } });
    }).as('statusVaga');
    abrirKanban();

    cy.findByText('STATUS: PUBLICADA E ATIVA').should('be.visible');
    cy.findByRole('button', { name: 'Pausar' }).click();

    cy.wait('@statusVaga').its('request.body').should('deep.equal', { status: 'pausada' });
    cy.findByText('STATUS: PAUSADA PARA REVISÃO').should('be.visible');
    cy.findByRole('button', { name: 'Ativar' }).should('be.visible');
    coluna('Inscrito').findByText('Ana Souza').should('be.visible');
  });
});

export {};
