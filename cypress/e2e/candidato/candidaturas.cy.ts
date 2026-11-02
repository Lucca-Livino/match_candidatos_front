// Área do candidato: lista e detalhe das próprias candidaturas.

const CANDIDATURAS = '**/api/usuarios/u-candidato/candidatura';

function stubVagasDasCandidaturas() {
  cy.stubJson('GET', '**/api/vagas/v1', 'candidato/vaga-v1.json', 'vagaV1');
  cy.stubJson('GET', '**/api/vagas/v2', 'candidato/vaga-v2.json', 'vagaV2');
  // Vaga removida: a lista continua mostrando a candidatura.
  cy.stubJson('GET', '**/api/vagas/v-removida', { success: false, message: 'Vaga não encontrada' }, 'vagaRemovida', 404);
}

describe('Candidato — minhas candidaturas', () => {
  it('lista as candidaturas com título da vaga, área e status', () => {
    cy.stubJson('GET', CANDIDATURAS, 'candidato/candidaturas.json', 'candidaturas');
    stubVagasDasCandidaturas();
    cy.visitComo('candidato', '/minhas-candidaturas');
    cy.wait('@candidaturas');

    cy.findByRole('heading', { name: 'Minhas Candidaturas' }).should('be.visible');

    cy.findByRole('button', { name: /Desenvolvedor React Pleno/ }).within(() => {
      cy.findByText('Em análise').should('be.visible');
      cy.findByText('TI').should('be.visible');
      cy.contains('Candidatura em').should('be.visible');
    });
    cy.findByRole('button', { name: /Analista de RH/ }).within(() => {
      cy.findByText('Aprovado').should('be.visible');
      cy.findByText('RH').should('be.visible');
    });
    // getVaga falhou: título de fallback, status preservado.
    cy.findByRole('button', { name: /Vaga indisponível/ }).within(() => {
      cy.findByText('Reprovado').should('be.visible');
    });
  });

  it('estado vazio quando não há candidaturas', () => {
    cy.stubJson('GET', CANDIDATURAS, { success: true, data: [] }, 'candidaturas');
    cy.visitComo('candidato', '/minhas-candidaturas');
    cy.wait('@candidaturas');

    cy.findByText('Nenhuma candidatura ainda').should('be.visible');
    cy.findByText('Explore as vagas disponíveis e candidate-se para acompanhar aqui.').should('be.visible');
  });

  it('erro da API ao listar mostra a mensagem', () => {
    cy.stubJson('GET', CANDIDATURAS, { success: false, message: 'Serviço indisponível.' }, 'candidaturas', 500);
    cy.visitComo('candidato', '/minhas-candidaturas');
    cy.wait('@candidaturas');

    cy.findByText('Serviço indisponível.').should('be.visible');
    cy.findByText('Nenhuma candidatura ainda').should('not.exist');
  });

  it('clicar numa candidatura abre o detalhe', () => {
    cy.stubJson('GET', CANDIDATURAS, 'candidato/candidaturas.json', 'candidaturas');
    stubVagasDasCandidaturas();
    cy.stubJson('GET', `${CANDIDATURAS}/v1`, 'candidato/candidatura-v1.json', 'candidatura');
    cy.visitComo('candidato', '/minhas-candidaturas');
    cy.wait('@candidaturas');

    cy.findByRole('button', { name: /Desenvolvedor React Pleno/ }).click();
    cy.location('pathname').should('eq', '/minhas-candidaturas/v1');
    cy.wait('@candidatura');
    cy.findByRole('heading', { level: 1, name: 'Desenvolvedor React Pleno' }).should('be.visible');
  });
});

describe('Candidato — detalhe da candidatura', () => {
  it('mostra status, data, descrição da vaga e navega para a vaga e de volta à lista', () => {
    cy.stubJson('GET', `${CANDIDATURAS}/v1`, 'candidato/candidatura-v1.json', 'candidatura');
    cy.stubJson('GET', '**/api/vagas/v1', 'candidato/vaga-v1.json', 'vaga');
    cy.visitComo('candidato', '/minhas-candidaturas/v1');
    cy.wait('@candidatura');

    cy.findByRole('heading', { level: 1, name: 'Desenvolvedor React Pleno' }).should('be.visible');
    cy.findByText('Em análise').should('be.visible');
    cy.findByText('TI').should('be.visible');
    cy.contains('Candidatura enviada em').should('be.visible');
    cy.findByRole('heading', { name: 'Sobre a vaga' }).should('be.visible');
    cy.findByText('Construir interfaces web modernas com React e TypeScript.').should('be.visible');

    cy.findByRole('button', { name: 'Ver detalhes da vaga' }).click();
    cy.location('pathname').should('eq', '/vagas/v1');

    cy.go('back');
    cy.location('pathname').should('eq', '/minhas-candidaturas/v1');
    cy.findByRole('button', { name: 'Voltar para candidaturas' }).click();
    cy.location('pathname').should('eq', '/minhas-candidaturas');
  });

  it('vaga indisponível: mantém status e esconde o link para a vaga', () => {
    cy.stubJson(
      'GET',
      `${CANDIDATURAS}/v-removida`,
      { success: true, data: { id: 'cand-3', usuarioId: 'u-candidato', vagaId: 'v-removida', compativel: 0, status: 'reprovado' } },
      'candidatura',
    );
    cy.stubJson('GET', '**/api/vagas/v-removida', { success: false }, 'vaga', 404);
    cy.visitComo('candidato', '/minhas-candidaturas/v-removida');
    cy.wait('@candidatura');

    cy.findByRole('heading', { level: 1, name: 'Vaga indisponível' }).should('be.visible');
    cy.findByText('Reprovado').should('be.visible');
    cy.findByRole('button', { name: 'Ver detalhes da vaga' }).should('not.exist');
  });

  it('candidatura inexistente mostra a mensagem de erro da API', () => {
    cy.stubJson('GET', `${CANDIDATURAS}/v9`, { success: false, message: 'Candidatura não encontrada.' }, 'candidatura', 404);
    cy.visitComo('candidato', '/minhas-candidaturas/v9');
    cy.wait('@candidatura');

    cy.findByText('Candidatura não encontrada.').should('be.visible');
    cy.findByRole('button', { name: 'Voltar para candidaturas' }).should('be.visible');
  });
});

// Módulo isolado: sem isso as constantes de topo colidem entre specs no tsc.
export {};
