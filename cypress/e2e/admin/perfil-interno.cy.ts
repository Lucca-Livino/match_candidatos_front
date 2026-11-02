import perfis from '../../fixtures/admin/perfis-internos.json';

type PapelInterno = keyof typeof perfis;

const CASOS: { papel: PapelInterno; url: string; descricao: string }[] = [
  { papel: 'suporte', url: '/suporte/perfil', descricao: 'dentro da área de suporte' },
  { papel: 'administrador', url: '/admin/perfil', descricao: 'como administrador' },
  { papel: 'recrutador', url: '/recrutador/perfil', descricao: 'dentro da área de recrutamento' },
];

function secaoDados() {
  return cy.contains('section', 'Dados pessoais');
}

// O Field do perfil não associa <label> ao input (sem htmlFor): localiza o
// input pelo texto do rótulo irmão.
function campo(rotulo: string) {
  return cy
    .findByRole('dialog', { name: 'Editar dados pessoais' })
    .contains('label', new RegExp(`^${rotulo}`))
    .parent()
    .find('input');
}

describe('Perfil interno (suporte, administrador, recrutador)', () => {
  CASOS.forEach(({ papel, url, descricao }) => {
    it(`${papel}: carrega nome, e-mail e papel da conta`, () => {
      const perfil = perfis[papel];
      cy.stubJson('GET', `**/api/usuarios/${perfil.data.id}`, perfil, 'perfil');
      cy.visitComo(papel, url);
      cy.wait('@perfil');

      cy.findByRole('heading', { name: 'Meu Perfil' }).should('be.visible');
      cy.contains(descricao).should('be.visible');
      secaoDados().within(() => {
        cy.findByText(perfil.data.nome).should('be.visible');
        cy.findByText(perfil.data.email).should('be.visible');
        cy.findByText(perfil.data.tipos_permissao[0]).should('exist');
        cy.findByRole('button', { name: /Editar/ }).should('be.visible');
      });
      // Perfil interno não tem currículo.
      cy.contains('Formação').should('not.exist');
      cy.findByRole('button', { name: 'Excluir minha conta' }).should('be.visible');
    });
  });

  it('suporte: edita nome e contato e envia só os campos alterados', () => {
    const perfil = perfis.suporte;
    const atualizado = {
      ...perfil.data,
      nome: 'Sara Suporte Lima',
      telefone: '(81) 97777-6666',
      cidade: '',
    };
    cy.stubJson('GET', '**/api/usuarios/u-suporte', perfil, 'perfil');
    cy.stubJson('PATCH', '**/api/usuarios/u-suporte', { success: true, data: atualizado }, 'salvar');
    cy.visitComo('suporte', '/suporte/perfil');
    cy.wait('@perfil');
    secaoDados().findByText('Recife').should('be.visible');

    secaoDados().findByRole('button', { name: /Editar/ }).click();
    campo('Nome').should('have.value', 'Sara Suporte').clear().type('Sara Suporte Lima');
    campo('E-mail').should('have.value', 'sara@empresa.com');
    campo('Telefone').type('(81) 97777-6666');
    campo('Cidade').should('have.value', 'Recife').clear();
    cy.findByRole('dialog').findByRole('button', { name: 'Salvar' }).click();

    // E-mail e senha não mudaram: ficam fora; cidade limpa vai como "".
    cy.wait('@salvar').its('request.body').should('deep.equal', {
      nome: 'Sara Suporte Lima',
      telefone: '(81) 97777-6666',
      cidade: '',
    });
    cy.findByRole('dialog').should('not.exist');
    secaoDados().within(() => {
      cy.findByText('Sara Suporte Lima').should('be.visible');
      cy.findByText('(81) 97777-6666').should('be.visible');
      cy.findByText('Recife').should('not.exist');
    });
    cy.window().then((win) => {
      const cache = JSON.parse(win.localStorage.getItem('auth_user') ?? '{}');
      expect(cache.name).to.equal('Sara Suporte Lima');
    });
  });

  it('administrador: fechar sem alterações não envia PATCH', () => {
    let patches = 0;
    cy.stubJson('GET', '**/api/usuarios/u-admin', perfis.administrador, 'perfil');
    cy.intercept('PATCH', '**/api/usuarios/u-admin', (req) => {
      patches += 1;
      req.reply({ body: perfis.administrador });
    });
    cy.visitComo('administrador', '/admin/perfil');
    cy.wait('@perfil');

    secaoDados().findByRole('button', { name: /Editar/ }).click();
    campo('Telefone').should('have.value', '(81) 98888-7777');
    cy.findByRole('dialog').findByRole('button', { name: 'Salvar' }).click();
    cy.findByRole('dialog').should('not.exist');
    cy.wrap(null).then(() => expect(patches).to.equal(0));
  });

  it('administrador: mostra o erro da API ao salvar e mantém o dialog aberto', () => {
    cy.stubJson('GET', '**/api/usuarios/u-admin', perfis.administrador, 'perfil');
    cy.stubJson(
      'PATCH',
      '**/api/usuarios/u-admin',
      { success: false, message: 'E-mail já está em uso.' },
      'salvar',
      409,
    );
    cy.visitComo('administrador', '/admin/perfil');
    cy.wait('@perfil');

    secaoDados().findByRole('button', { name: /Editar/ }).click();
    campo('E-mail').clear().type('rita@empresa.com');
    cy.findByRole('dialog').findByRole('button', { name: 'Salvar' }).click();
    cy.wait('@salvar').its('request.body').should('deep.equal', { email: 'rita@empresa.com' });

    cy.findByRole('dialog').findByText('E-mail já está em uso.').should('be.visible');
    secaoDados().findByText('ana@empresa.com').should('exist');
  });

  it('recrutador: mostra erro quando o perfil não carrega', () => {
    cy.stubJson(
      'GET',
      '**/api/usuarios/u-recrutador',
      { success: false, message: 'Usuário não encontrado.' },
      'perfil',
      404,
    );
    cy.visitComo('recrutador', '/recrutador/perfil');
    cy.wait('@perfil');

    secaoDados().within(() => {
      cy.findByText('Usuário não encontrado.').should('be.visible');
      cy.findByRole('button', { name: /Editar/ }).should('not.exist');
    });
  });
});
