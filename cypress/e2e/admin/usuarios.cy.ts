import pagina1 from '../../fixtures/admin/usuarios-pagina1.json';

const LISTA = { method: 'GET', pathname: '/api/usuarios' } as const;

function linha(nome: string) {
  return cy.contains('tr', nome);
}

function escolher(combobox: string, opcao: string) {
  cy.findByRole('combobox', { name: combobox }).click();
  cy.findByRole('option', { name: opcao }).click();
}

describe('Administrador — usuários internos', () => {
  beforeEach(() => {
    cy.intercept(LISTA, { fixture: 'admin/usuarios-pagina1.json' }).as('lista');
  });

  it('lista a primeira página com papel, situação e ações por situação', () => {
    cy.visitComo('administrador', '/admin/usuarios');
    cy.wait('@lista').its('request.query').should('deep.equal', {
      page: '1',
      limit: '10',
      papel: 'recrutador,suporte',
    });

    cy.findByRole('heading', { name: 'Usuários' }).should('be.visible');
    linha('Paula Pendente').within(() => {
      cy.findByText('paula@empresa.com').should('exist');
      cy.findByText('Recrutador').should('exist');
      cy.findByText('Pendente').should('exist');
      cy.findByText('10/10/2026').should('exist');
      cy.findByRole('button', { name: /Reenviar/ }).should('exist');
      cy.findByRole('button', { name: /Desativar/ }).should('exist');
    });
    linha('Otávio Ativo').within(() => {
      cy.findByText('Suporte').should('exist');
      cy.findByText('Ativo').should('exist');
      cy.findByRole('button', { name: /Reenviar/ }).should('not.exist');
      cy.findByRole('button', { name: /Desativar/ }).should('exist');
    });
    linha('Diego Desativado').within(() => {
      cy.findByText('Desativado').should('exist');
      cy.findByText('-').should('exist');
      cy.findByRole('button', { name: /Reativar/ }).should('exist');
    });
    // totalPages = 2 → paginação visível.
    cy.findByRole('button', { name: '2' }).should('be.visible');
  });

  it('filtros de papel e situação e a paginação enviam os params', () => {
    cy.visitComo('administrador', '/admin/usuarios');
    cy.wait('@lista');
    cy.findByText('Paula Pendente').should('be.visible');

    cy.intercept(
      { method: 'GET', pathname: '/api/usuarios', query: { page: '2' } },
      { fixture: 'admin/usuarios-pagina2.json' },
    ).as('pagina2');
    cy.findByRole('button', { name: '2' }).click();
    cy.wait('@pagina2').its('request.query').should('include', { page: '2', limit: '10' });
    cy.findByText('Sílvia Segunda').should('be.visible');
    cy.findByText('Paula Pendente').should('not.exist');

    // Trocar filtro volta para a página 1.
    cy.intercept({ method: 'GET', pathname: '/api/usuarios', query: { papel: 'suporte' } }, {
      body: { success: true, data: { docs: [pagina1.data.docs[1]], totalDocs: 1, totalPages: 1, page: 1 } },
    }).as('papel');
    escolher('Filtrar por papel', 'Suporte');
    cy.wait('@papel').its('request.query').should('deep.equal', {
      page: '1',
      limit: '10',
      papel: 'suporte',
    });
    cy.findByText('Otávio Ativo').should('be.visible');
    cy.findByText('Sílvia Segunda').should('not.exist');

    cy.intercept({ method: 'GET', pathname: '/api/usuarios', query: { situacao: 'ativo' } }, {
      body: { success: true, data: { docs: [pagina1.data.docs[1]], totalDocs: 1, totalPages: 1, page: 1 } },
    }).as('situacao');
    escolher('Filtrar por situação', 'Ativo');
    cy.wait('@situacao').its('request.query').should('deep.equal', {
      page: '1',
      limit: '10',
      papel: 'suporte',
      situacao: 'ativo',
    });
  });

  it('mostra estado vazio', () => {
    cy.intercept(LISTA, {
      body: { success: true, data: { docs: [], totalDocs: 0, totalPages: 0, page: 1 } },
    }).as('vazia');
    cy.visitComo('administrador', '/admin/usuarios');
    cy.wait('@vazia');
    cy.findByText('Nenhum usuário encontrado.').should('be.visible');
  });

  it('mostra a mensagem da API quando a lista não carrega', () => {
    cy.intercept(LISTA, {
      statusCode: 500,
      body: { success: false, message: 'Erro interno ao listar usuários.' },
    }).as('erro');
    cy.visitComo('administrador', '/admin/usuarios');
    cy.wait('@erro');
    cy.findByText('Erro interno ao listar usuários.').should('be.visible');
  });

  describe('convite', () => {
    it('valida o e-mail, envia nome/e-mail/papel e recarrega a lista', () => {
      let convidou = false;
      const novo = {
        _id: 'u-9',
        nome: 'Nina Nova',
        email: 'nina@empresa.com',
        tipos_permissao: ['suporte'],
        situacao: 'pendente',
        convidadoEm: '2026-10-29T12:00:00.000Z',
        ativadoEm: null,
      };
      cy.intercept(LISTA, (req) => {
        req.alias = convidou ? 'listaNova' : 'lista';
        req.reply({
          body: convidou
            ? { ...pagina1, data: { ...pagina1.data, docs: [novo, ...pagina1.data.docs] } }
            : pagina1,
        });
      });
      cy.intercept('POST', '**/api/usuarios/convite', (req) => {
        convidou = true;
        req.reply({ statusCode: 201, body: { success: true, data: novo } });
      }).as('convite');

      cy.visitComo('administrador', '/admin/usuarios');
      cy.wait('@lista');
      cy.findByRole('button', { name: /Convidar usuário/ }).click();

      cy.findByRole('dialog', { name: 'Convidar usuário' }).within(() => {
        cy.findByLabelText('Nome').type('  Nina Nova  ');
        cy.findByLabelText('E-mail').type('nina-sem-arroba');
        cy.findByRole('button', { name: 'Enviar convite' }).click();
        // Validação nativa do input type=email barra o envio.
        cy.findByLabelText('E-mail').then(($el) => {
          const input = $el[0] as HTMLInputElement;
          expect(input.checkValidity()).to.equal(false);
          expect(input.validationMessage).to.not.equal('');
        });
      });
      cy.wrap(null).then(() => expect(convidou, 'convite não enviado').to.equal(false));

      cy.findByRole('dialog', { name: 'Convidar usuário' }).within(() => {
        cy.findByLabelText('E-mail').clear().type('nina@empresa.com ');
        cy.findByRole('combobox', { name: 'Papel' }).should('contain.text', 'Recrutador');
      });
      // Radix renderiza as opções num portal fora do dialog.
      escolher('Papel', 'Suporte');
      cy.findByRole('dialog').findByRole('button', { name: 'Enviar convite' }).click();

      cy.wait('@convite').its('request.body').should('deep.equal', {
        nome: 'Nina Nova',
        email: 'nina@empresa.com',
        papel: 'suporte',
      });
      cy.findByRole('dialog').should('not.exist');
      cy.findByText('Convite enviado para nina@empresa.com.').should('be.visible');
      cy.wait('@listaNova').its('request.query.page').should('eq', '1');
      linha('Nina Nova').should('contain.text', 'Pendente').and('contain.text', 'Suporte');
    });

    it('mantém o dialog aberto com a mensagem quando o e-mail já existe (409)', () => {
      cy.stubJson(
        'POST',
        '**/api/usuarios/convite',
        { success: false, message: 'Já existe uma conta com este e-mail.' },
        'convite',
        409,
      );
      cy.visitComo('administrador', '/admin/usuarios');
      cy.wait('@lista');
      cy.findByRole('button', { name: /Convidar usuário/ }).click();

      cy.findByRole('dialog', { name: 'Convidar usuário' }).within(() => {
        cy.findByLabelText('Nome').type('Otávio Ativo');
        cy.findByLabelText('E-mail').type('otavio@empresa.com');
        cy.findByRole('button', { name: 'Enviar convite' }).click();
      });
      cy.wait('@convite').its('request.body.papel').should('eq', 'recrutador');

      cy.findByRole('dialog', { name: 'Convidar usuário' }).within(() => {
        cy.findByText('Já existe uma conta com este e-mail.').should('be.visible');
        cy.findByLabelText('E-mail').should('have.value', 'otavio@empresa.com');
        cy.findByRole('button', { name: 'Enviar convite' }).should('be.enabled');
      });
      cy.contains('Convite enviado').should('not.exist');
    });
  });

  it('reenvia o convite de um usuário pendente', () => {
    cy.stubJson('POST', '**/api/usuarios/u-1/reenviar-convite', { success: true, data: null }, 'reenviar');
    cy.visitComo('administrador', '/admin/usuarios');
    cy.wait('@lista');

    linha('Paula Pendente').findByRole('button', { name: /Reenviar/ }).click();
    cy.wait('@reenviar').its('request.method').should('eq', 'POST');
    cy.findByText('Convite reenviado para paula@empresa.com.').should('be.visible');
  });

  it('desativa um usuário ativo e reativa um desativado via PATCH status', () => {
    cy.stubJson('PATCH', '**/api/usuarios/u-2/status', { success: true, data: null }, 'desativar');
    cy.stubJson('PATCH', '**/api/usuarios/u-3/status', { success: true, data: null }, 'reativar');
    cy.visitComo('administrador', '/admin/usuarios');
    cy.wait('@lista');

    linha('Otávio Ativo').findByRole('button', { name: /Desativar/ }).click();
    cy.wait('@desativar').its('request.body').should('deep.equal', { status_ativo: false });
    cy.findByText('Otávio Ativo foi desativado(a).').should('be.visible');

    linha('Diego Desativado').findByRole('button', { name: /Reativar/ }).click();
    cy.wait('@reativar').its('request.body').should('deep.equal', { status_ativo: true });
    cy.findByText('Diego Desativado foi reativado(a).').should('be.visible');
  });

  it('mostra a mensagem da API quando a troca de situação falha', () => {
    cy.stubJson(
      'PATCH',
      '**/api/usuarios/u-2/status',
      { success: false, message: 'Usuário não encontrado.' },
      'desativar',
      404,
    );
    cy.visitComo('administrador', '/admin/usuarios');
    cy.wait('@lista');

    linha('Otávio Ativo').findByRole('button', { name: /Desativar/ }).click();
    cy.wait('@desativar');
    cy.findByText('Usuário não encontrado.').should('be.visible');
    cy.contains('foi desativado').should('not.exist');
  });

  it('exclui somente depois da confirmação e recarrega a lista', () => {
    let excluiu = false;
    cy.intercept(LISTA, (req) => {
      req.alias = excluiu ? 'listaNova' : 'lista';
      req.reply({
        body: excluiu
          ? { ...pagina1, data: { ...pagina1.data, docs: pagina1.data.docs.filter((u) => u._id !== 'u-2') } }
          : pagina1,
      });
    });
    cy.intercept('DELETE', '**/api/usuarios/u-2', (req) => {
      excluiu = true;
      req.reply({ body: { success: true, data: null } });
    }).as('excluir');

    cy.visitComo('administrador', '/admin/usuarios');
    cy.wait('@lista');

    // Cancelar não exclui.
    linha('Otávio Ativo').findByRole('button', { name: /Excluir/ }).click();
    cy.findByRole('dialog', { name: 'Excluir usuário' })
      .should('contain.text', 'Otávio Ativo (otavio@empresa.com)')
      .findByRole('button', { name: 'Cancelar' })
      .click();
    cy.findByRole('dialog').should('not.exist');
    cy.wrap(null).then(() => expect(excluiu, 'DELETE após cancelar').to.equal(false));

    linha('Otávio Ativo').findByRole('button', { name: /Excluir/ }).click();
    cy.findByRole('dialog', { name: 'Excluir usuário' })
      .findByRole('button', { name: 'Excluir' })
      .click();

    cy.wait('@excluir').its('request.method').should('eq', 'DELETE');
    cy.wait('@listaNova');
    cy.findByRole('dialog').should('not.exist');
    cy.findByText('Otávio Ativo foi excluído(a).').should('be.visible');
    cy.findByRole('cell', { name: 'Otávio Ativo' }).should('not.exist');
  });

  it('mantém o dialog de exclusão aberto com o erro da API', () => {
    cy.stubJson(
      'DELETE',
      '**/api/usuarios/u-2',
      { success: false, message: 'Não é possível excluir este usuário.' },
      'excluir',
      409,
    );
    cy.visitComo('administrador', '/admin/usuarios');
    cy.wait('@lista');

    linha('Otávio Ativo').findByRole('button', { name: /Excluir/ }).click();
    cy.findByRole('dialog', { name: 'Excluir usuário' })
      .findByRole('button', { name: 'Excluir' })
      .click();
    cy.wait('@excluir');

    cy.findByRole('dialog', { name: 'Excluir usuário' })
      .findByText('Não é possível excluir este usuário.')
      .should('be.visible');
    cy.contains('foi excluído').should('not.exist');
  });
});
