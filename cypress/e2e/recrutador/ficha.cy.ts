// Ficha de impressão do candidato (/impressao/vagas/:vagaId/candidatos/:usuarioId).
const F = 'recrutador-candidatos';
const URL_FICHA = '/impressao/vagas/v1/candidatos/u-1';
const API_FICHA = '**/api/vagas/v1/candidaturas/u-1/ficha';

function deveMostrarFicha() {
  cy.findByRole('heading', { level: 1, name: 'Ana Souza' }).should('be.visible');
  cy.findByText('ana.souza@email.com').should('be.visible');
  cy.findByText('(41) 99999-0001').should('be.visible');
  cy.findByText('Curitiba').should('be.visible');
  cy.findByText('https://www.linkedin.com/in/anasouza').should('be.visible');

  cy.contains('p', 'Vaga:')
    .should('contain.text', 'Desenvolvedor Front-end (OPERAÇÕES)')
    .and('contain.text', 'Status: Em análise')
    .and('contain.text', 'Inscrição: 01/10/2026');

  cy.findByText('React (Avançado) · TypeScript (Intermediário)').should('be.visible');
  cy.findByText('Desenvolvedora Front-end · Acme Tecnologia').should('be.visible');
  cy.findByText('Manutenção de SPA em React.').should('be.visible');
  cy.findByText('Engenharia de Software · UFPR').should('be.visible');
  cy.findByText('Graduação · 2022 - previsão 2027 · Cursando').should('be.visible');
  cy.findByText('AWS Cloud Practitioner · Amazon').should('be.visible');

  cy.findByRole('heading', { name: 'Questionário: Triagem Front' }).should('be.visible');
  cy.findByText('Por que você quer esta vaga?').should('be.visible');
  cy.findByText('Gosto de interfaces acessíveis.').should('be.visible');
  cy.findByText('React, Vue').should('be.visible');
  // resposta sem texto nem opção vira travessão
  cy.contains('li', 'Tem disponibilidade presencial?').should('contain.text', '-');

  cy.findByRole('button', { name: /Imprimir \/ Salvar PDF/ }).should('be.enabled');
  cy.title().should('eq', 'Ficha - Ana Souza - Desenvolvedor Front-end');
}

describe('Ficha de impressão do candidato', () => {
  it('renderiza os dados para o recrutador', () => {
    cy.stubJson('GET', API_FICHA, `${F}/ficha.json`, 'ficha');
    cy.visitComo('recrutador', URL_FICHA);
    cy.wait('@ficha');
    deveMostrarFicha();
  });

  it('renderiza os dados para o suporte', () => {
    cy.stubJson('GET', API_FICHA, `${F}/ficha.json`, 'ficha');
    cy.visitComo('suporte', URL_FICHA);
    cy.wait('@ficha');
    cy.location('pathname').should('eq', URL_FICHA);
    deveMostrarFicha();
  });

  it('mostra textos de vazio quando não há currículo nem questionário', () => {
    cy.fixture(`${F}/ficha.json`).then((ficha) => {
      ficha.data.curriculo = { habilidades: [], formacoes: [], experiencias: [], certificacoes: [] };
      ficha.data.questionario = { titulo: null, respostas: [] };
      ficha.data.candidato.telefone = '';
      cy.stubJson('GET', API_FICHA, ficha, 'ficha');
    });
    cy.visitComo('recrutador', URL_FICHA);
    cy.wait('@ficha');

    cy.findByRole('heading', { level: 1, name: 'Ana Souza' }).should('be.visible');
    cy.findAllByText('Nada informado.').should('have.length', 4);
    cy.findByRole('heading', { name: 'Questionário' }).should('be.visible');
    cy.findByText('Sem respostas de questionário para esta vaga.').should('be.visible');
    cy.findByText('(41) 99999-0001').should('not.exist');
  });

  it('404 mostra "Candidatura não encontrada."', () => {
    cy.stubJson('GET', API_FICHA, { success: false, message: 'Not found' }, 'ficha', 404);
    cy.visitComo('recrutador', URL_FICHA);
    cy.wait('@ficha');
    cy.findByText('Candidatura não encontrada.').should('be.visible');
    cy.findByRole('button', { name: /Imprimir \/ Salvar PDF/ }).should('be.disabled');
  });

  it('erro 500 mostra a mensagem da API', () => {
    cy.stubJson('GET', API_FICHA, { success: false, message: 'Erro interno ao montar ficha.' }, 'ficha', 500);
    cy.visitComo('recrutador', URL_FICHA);
    cy.wait('@ficha');
    cy.findByText('Erro interno ao montar ficha.').should('be.visible');
    cy.findByRole('heading', { level: 1 }).should('not.exist');
  });

  it('403 redireciona para a home do papel', () => {
    cy.stubJson('GET', API_FICHA, { success: false, message: 'Sem acesso' }, 'ficha', 403);
    cy.visitComo('recrutador', URL_FICHA);
    cy.wait('@ficha');
    cy.location('pathname').should('eq', '/dashboard');
  });

  it('candidato não acessa a área de impressão', () => {
    cy.visitComo('candidato', URL_FICHA);
    cy.location('pathname').should('eq', '/candidato');
  });
});

export {};
