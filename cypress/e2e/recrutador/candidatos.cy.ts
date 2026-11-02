// Lista geral de candidatos (/candidatos).
const F = 'recrutador-candidatos';
const API_USUARIOS = '**/api/usuarios?limit=100';

const busca = () => cy.findByRole('searchbox', { name: 'Buscar candidatos por nome ou e-mail' });

describe('Recrutador: todos os candidatos', () => {
  it('lista somente usuários com papel de candidato', () => {
    cy.stubJson('GET', API_USUARIOS, `${F}/usuarios.json`, 'usuarios');
    cy.visitComo('recrutador', '/candidatos');
    cy.wait('@usuarios');

    cy.findByRole('heading', { level: 1, name: 'Candidatos' }).should('be.visible');
    cy.contains('3 candidatos').should('be.visible');
    cy.findByRole('button', { name: 'Ver currículo de Ana Souza' }).should('contain.text', 'ana.souza@email.com');
    cy.findByRole('button', { name: 'Ver currículo de Bruno Lima' }).should('contain.text', 'Inativo');
    // sem tipos_permissao conta como candidato
    cy.findByRole('button', { name: 'Ver currículo de Carla Dias' }).should('be.visible');
    cy.findByRole('button', { name: 'Ver currículo de Ana Souza' }).should('not.contain.text', 'Inativo');
    cy.findByText('Rita Recrutadora').should('not.exist');
    cy.findByText('Sara Suporte').should('not.exist');
  });

  it('busca filtra por nome e por e-mail', () => {
    cy.stubJson('GET', API_USUARIOS, `${F}/usuarios.json`, 'usuarios');
    cy.visitComo('recrutador', '/candidatos');
    cy.wait('@usuarios');

    busca().type('bruno');
    cy.findAllByRole('button', { name: /^Ver currículo de/ }).should('have.length', 1);
    cy.findByRole('button', { name: 'Ver currículo de Bruno Lima' }).should('be.visible');
    cy.contains('1 candidato').should('be.visible');

    busca().clear().type('OUTRODOMINIO');
    cy.findAllByRole('button', { name: /^Ver currículo de/ }).should('have.length', 1);
    cy.findByRole('button', { name: 'Ver currículo de Carla Dias' }).should('be.visible');

    // recrutador não aparece nem buscando pelo nome dele
    busca().clear().type('rita');
    cy.findByText('Nenhum candidato encontrado.').should('be.visible');
    cy.contains('0 candidatos').should('be.visible');

    busca().clear();
    cy.findAllByRole('button', { name: /^Ver currículo de/ }).should('have.length', 3);
  });

  it('estado vazio', () => {
    cy.stubJson('GET', API_USUARIOS, { success: true, data: { docs: [], totalDocs: 0, totalPages: 0, page: 1 } }, 'usuarios');
    cy.visitComo('recrutador', '/candidatos');
    cy.wait('@usuarios');
    cy.findByText('Nenhum candidato encontrado.').should('be.visible');
    cy.contains('0 candidatos').should('be.visible');
  });

  it('erro na API mostra alerta e "Tentar novamente" recarrega', () => {
    cy.stubJson('GET', API_USUARIOS, { success: false, message: 'boom' }, 'falha', 500);
    cy.visitComo('recrutador', '/candidatos');
    cy.wait('@falha');
    cy.findByRole('alert').should(
      'contain.text',
      'Não foi possível carregar os candidatos. Verifique a conexão e tente novamente.',
    );

    cy.stubJson('GET', API_USUARIOS, `${F}/usuarios.json`, 'usuarios');
    cy.findByRole('button', { name: /Tentar novamente/ }).click();
    cy.wait('@usuarios');
    cy.findByRole('alert').should('not.exist');
    cy.findByRole('button', { name: 'Ver currículo de Ana Souza' }).should('be.visible');
  });

  it('abre o currículo do candidato sem link de ficha', () => {
    cy.stubJson('GET', API_USUARIOS, `${F}/usuarios.json`, 'usuarios');
    cy.stubJson('GET', '**/api/usuarios/u-1/formacao', `${F}/formacao.json`, 'formacao');
    cy.stubJson('GET', '**/api/usuarios/u-1/experiencia', `${F}/experiencia.json`, 'experiencia');
    cy.stubJson('GET', '**/api/usuarios/u-1/habilidade', `${F}/habilidade.json`, 'habilidade');
    cy.stubJson('GET', '**/api/usuarios/u-1/certificacao', `${F}/certificacao.json`, 'certificacao');
    cy.visitComo('recrutador', '/candidatos');
    cy.wait('@usuarios');

    cy.findByRole('button', { name: 'Ver currículo de Ana Souza' }).click();
    cy.wait(['@formacao', '@experiencia', '@habilidade', '@certificacao']);

    cy.findByRole('dialog', { name: 'Ana Souza' }).within(() => {
      cy.findByText('ana.souza@email.com').should('be.visible');
      cy.findByText('React · Avançado').should('be.visible');
      cy.findByText('Desenvolvedora Front-end').should('be.visible');
      cy.findByText('Engenharia de Software').should('be.visible');
      cy.findByText('AWS Cloud Practitioner').should('be.visible');
      cy.findByRole('link', { name: /Imprimir/ }).should('not.exist');
    });
  });
});

export {};
