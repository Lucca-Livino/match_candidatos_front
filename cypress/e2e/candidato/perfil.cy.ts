// Área do candidato: perfil (dados pessoais, currículo e exclusão de conta).

const USUARIO = '**/api/usuarios/u-candidato';
const secao = (s: string) => `${USUARIO}/${s}`;

// O <label> do Field não tem htmlFor, então findByLabelText não acha o campo:
// busca o input/textarea irmão do label com o texto exato.
function campo(label: string) {
  return cy
    .contains('label', new RegExp(`^${label.replace(/[()]/g, '\\$&')}$`))
    .parent()
    .find('input, textarea')
    .first();
}

function dialogo(nome: string) {
  return cy.findByRole('dialog', { name: nome });
}

function secaoDaPagina(titulo: string) {
  return cy.findByRole('heading', { level: 2, name: titulo }).closest('section');
}

function stubPerfil() {
  cy.stubJson('GET', USUARIO, 'candidato/usuario.json', 'usuario');
  cy.stubJson('GET', secao('formacao'), 'candidato/formacoes.json', 'formacoes');
  cy.stubJson('GET', secao('experiencia'), 'candidato/experiencias.json', 'experiencias');
  cy.stubJson('GET', secao('habilidade'), 'candidato/habilidades.json', 'habilidades');
  cy.stubJson('GET', secao('certificacao'), 'candidato/certificacoes.json', 'certificacoes');
}

function abrirPerfil() {
  stubPerfil();
  cy.visitComo('candidato', '/perfil');
  cy.wait('@usuario');
  cy.findByRole('heading', { level: 1, name: 'Meu Perfil' }).should('be.visible');
}

describe('Candidato — perfil: dados pessoais', () => {
  it('carrega os dados do usuário e as seções do currículo', () => {
    abrirPerfil();

    secaoDaPagina('Dados pessoais').within(() => {
      cy.findByText('Caio Candidato').should('be.visible');
      cy.findByText('caio@email.com').should('be.visible');
      cy.findByText('(81) 98888-7777').should('be.visible');
      cy.findByText('Olinda').should('be.visible');
      cy.findByRole('link', { name: 'LinkedIn' })
        .should('have.attr', 'href', 'https://www.linkedin.com/in/caio-candidato');
    });
    secaoDaPagina('Formação acadêmica').within(() => {
      cy.findByText('Ciência da Computação').should('be.visible');
      cy.findByText('Graduação · Concluído · 2016 – 2020').should('be.visible');
    });
    secaoDaPagina('Experiência profissional').findByText('Desenvolvedor Júnior').should('be.visible');
    secaoDaPagina('Habilidades').findByText('SQL').should('be.visible');
    secaoDaPagina('Certificações').findByText('Scrum Foundation').should('be.visible');
  });

  it('salvar envia PATCH só com os campos editados e atualiza a tela', () => {
    abrirPerfil();
    cy.stubJson(
      'PATCH',
      USUARIO,
      {
        success: true,
        data: {
          id: 'u-candidato', nome: 'Caio C. Silva', email: 'caio@email.com', tipos_permissao: ['candidato'],
          telefone: '(81) 98888-7777', cidade: 'Recife', linkedin: 'https://www.linkedin.com/in/caio-candidato',
        },
      },
      'salvar',
    );

    secaoDaPagina('Dados pessoais').findByRole('button', { name: 'Editar' }).click();
    dialogo('Editar dados pessoais').within(() => {
      campo('Nome').should('have.value', 'Caio Candidato').clear().type('Caio C. Silva');
      campo('Cidade').should('have.value', 'Olinda').clear().type('  Recife ');
      cy.findByRole('button', { name: 'Salvar' }).click();
    });

    cy.wait('@salvar').its('request.body').should('deep.equal', { nome: 'Caio C. Silva', cidade: 'Recife' });
    cy.findByRole('dialog').should('not.exist');
    secaoDaPagina('Dados pessoais').within(() => {
      cy.findByText('Caio C. Silva').should('be.visible');
      cy.findByText('Recife').should('be.visible');
    });
    // Cache da sessão atualizado para o header.
    cy.window().then((win) => {
      expect(JSON.parse(win.localStorage.getItem('auth_user') ?? '{}').name).to.eq('Caio C. Silva');
    });
  });

  it('erro da API ao salvar mostra a mensagem e mantém o diálogo aberto', () => {
    abrirPerfil();
    cy.stubJson('PATCH', USUARIO, { success: false, message: 'E-mail já cadastrado.' }, 'salvar', 409);

    secaoDaPagina('Dados pessoais').findByRole('button', { name: 'Editar' }).click();
    dialogo('Editar dados pessoais').within(() => {
      campo('E-mail').clear().type('outro@email.com');
      cy.findByRole('button', { name: 'Salvar' }).click();
    });

    cy.wait('@salvar').its('request.body').should('deep.equal', { email: 'outro@email.com' });
    dialogo('Editar dados pessoais').within(() => {
      cy.findByText('E-mail já cadastrado.').should('be.visible');
      campo('E-mail').should('have.value', 'outro@email.com');
      cy.findByRole('button', { name: 'Cancelar' }).click();
    });
    cy.findByRole('dialog').should('not.exist');
    secaoDaPagina('Dados pessoais').findByText('caio@email.com').should('be.visible');
  });

  it('erro ao carregar os dados mostra a mensagem na seção', () => {
    stubPerfil();
    cy.stubJson('GET', USUARIO, { success: false, message: 'Falha interna.' }, 'usuario', 500);
    cy.visitComo('candidato', '/perfil');
    cy.wait('@usuario');

    secaoDaPagina('Dados pessoais').within(() => {
      cy.findByText('Falha interna.').should('be.visible');
      cy.findByRole('button', { name: 'Editar' }).should('not.exist');
    });
  });
});

describe('Candidato — perfil: formação', () => {
  it('cria, edita e exclui uma formação', () => {
    abrirPerfil();
    cy.wait('@formacoes');

    // ---- Criar ----
    cy.stubJson('POST', secao('formacao'), { success: true, data: { id: 'f2' } }, 'criar', 201);
    secaoDaPagina('Formação acadêmica').findByRole('button', { name: 'Adicionar' }).click();
    dialogo('Nova formação').within(() => {
      campo('Instituição').type('IFPE');
      campo('Curso').type('Análise de Sistemas');
      cy.findByRole('combobox', { name: 'Situação' }).click();
    });
    // Conteúdo do Select vai para um portal fora do diálogo.
    cy.findByRole('option', { name: 'Concluído' }).click();
    dialogo('Nova formação').within(() => {
      // clear() deixaria "0" no campo (onChange faz Number('')) e o texto
      // entraria antes dele ("20210"); selecionar tudo substitui o valor.
      campo('Ano de início').type('{selectall}2021');
      campo('Ano de conclusão').type('2023');
    });
    cy.fixture('candidato/formacoes.json').then((lista) => {
      lista.data.push({
        id: 'f2', usuarioId: 'u-candidato', instituicao: 'IFPE', curso: 'Análise de Sistemas',
        grau: 'graduacao', situacao: 'concluido', anoInicio: 2021, anoConclusao: 2023, areaId: null,
      });
      cy.stubJson('GET', secao('formacao'), lista, 'formacoes');
    });
    dialogo('Nova formação').findByRole('button', { name: 'Salvar' }).click();

    cy.wait('@criar').its('request.body').should('deep.equal', {
      instituicao: 'IFPE', curso: 'Análise de Sistemas', grau: 'graduacao',
      situacao: 'concluido', anoInicio: 2021, anoConclusao: 2023, areaId: null,
    });
    cy.findByRole('dialog').should('not.exist');
    secaoDaPagina('Formação acadêmica').findByText('Análise de Sistemas').should('be.visible');

    // ---- Editar ----
    cy.stubJson('PUT', secao('formacao/f1'), { success: true, data: { id: 'f1' } }, 'editar');
    cy.contains('p', 'Ciência da Computação')
      .parent()
      .parent()
      .findByRole('button', { name: 'Editar' })
      .click();
    dialogo('Editar formação').within(() => {
      campo('Curso').should('have.value', 'Ciência da Computação').clear().type('Engenharia da Computação');
    });
    cy.stubJson(
      'GET',
      secao('formacao'),
      {
        success: true,
        data: [{
          id: 'f1', usuarioId: 'u-candidato', instituicao: 'UFPE', curso: 'Engenharia da Computação',
          grau: 'graduacao', situacao: 'concluido', anoInicio: 2016, anoConclusao: 2020, areaId: null,
        }],
      },
      'formacoes',
    );
    dialogo('Editar formação').findByRole('button', { name: 'Salvar' }).click();

    cy.wait('@editar').its('request.body').should('deep.equal', {
      instituicao: 'UFPE', curso: 'Engenharia da Computação', grau: 'graduacao',
      situacao: 'concluido', anoInicio: 2016, anoConclusao: 2020, areaId: null,
    });
    secaoDaPagina('Formação acadêmica').within(() => {
      cy.findByText('Engenharia da Computação').should('be.visible');
      cy.findByText('Ciência da Computação').should('not.exist');
    });

    // ---- Excluir (cancelar primeiro, depois confirmar) ----
    cy.stubJson('DELETE', secao('formacao/f1'), { success: true, data: null }, 'excluir');
    secaoDaPagina('Formação acadêmica').findByRole('button', { name: 'Excluir' }).click();
    dialogo('Excluir formação?').within(() => {
      cy.findByText('Engenharia da Computação — UFPE').should('be.visible');
      cy.findByRole('button', { name: 'Cancelar' }).click();
    });
    cy.findByRole('dialog').should('not.exist');
    cy.get('@excluir.all').should('have.length', 0);

    secaoDaPagina('Formação acadêmica').findByRole('button', { name: 'Excluir' }).click();
    cy.stubJson('GET', secao('formacao'), { success: true, data: [] }, 'formacoes');
    dialogo('Excluir formação?').findByRole('button', { name: 'Excluir' }).click();
    cy.wait('@excluir');
    cy.findByRole('dialog').should('not.exist');
    secaoDaPagina('Formação acadêmica').findByText('Adicione sua formação acadêmica.').should('be.visible');
  });

  it('valida campos obrigatórios no diálogo antes de enviar', () => {
    abrirPerfil();
    cy.stubJson('POST', secao('formacao'), { success: true, data: { id: 'f2' } }, 'criar', 201);

    secaoDaPagina('Formação acadêmica').findByRole('button', { name: 'Adicionar' }).click();
    dialogo('Nova formação').within(() => {
      // Validação nativa: instituição vazia bloqueia o submit.
      cy.findByRole('button', { name: 'Salvar' }).click();
      campo('Instituição').then(($el) => {
        expect(($el[0] as HTMLInputElement).validity.valueMissing).to.eq(true);
      });

      // Situação não participa da validação nativa: mensagem própria.
      campo('Instituição').type('IFPE');
      campo('Curso').type('Redes');
      cy.findByRole('button', { name: 'Salvar' }).click();
      cy.findByText('Selecione a situação do curso.').should('be.visible');
    });
    cy.get('@criar.all').should('have.length', 0);
  });

  it('erro da API ao criar formação mostra a mensagem no diálogo', () => {
    abrirPerfil();
    cy.stubJson('POST', secao('formacao'), { success: false, message: 'Ano de conclusão inválido.' }, 'criar', 400);

    secaoDaPagina('Formação acadêmica').findByRole('button', { name: 'Adicionar' }).click();
    dialogo('Nova formação').within(() => {
      campo('Instituição').type('IFPE');
      campo('Curso').type('Redes');
      cy.findByRole('combobox', { name: 'Situação' }).click();
    });
    cy.findByRole('option', { name: 'Trancado' }).click();
    dialogo('Nova formação').within(() => {
      cy.findByText('Ano de saída (opcional)').should('be.visible');
      cy.findByRole('button', { name: 'Salvar' }).click();
    });

    // anoConclusao null é omitido do POST.
    cy.wait('@criar').its('request.body').should('not.have.property', 'anoConclusao');
    dialogo('Nova formação').findByText('Ano de conclusão inválido.').should('be.visible');
  });
});

describe('Candidato — perfil: habilidades', () => {
  it('cria (escolhendo do catálogo), edita o nível e exclui uma habilidade', () => {
    abrirPerfil();
    cy.wait('@habilidades');
    cy.intercept('GET', /\/api\/catalogo\?tipo=habilidade/, { fixture: 'candidato/catalogo-habilidade.json' }).as('catalogo');

    // ---- Criar ----
    cy.stubJson('POST', secao('habilidade'), { success: true, data: { id: 'h2' } }, 'criar', 201);
    secaoDaPagina('Habilidades').findByRole('button', { name: 'Adicionar' }).click();
    dialogo('Nova habilidade').within(() => {
      cy.findByPlaceholderText('Ex.: React, SQL, Inglês').type('Rea');
      cy.wait('@catalogo').its('request.url').should('include', 'q=Rea');
      cy.findByRole('option', { name: /React/ }).click();
      cy.findByPlaceholderText('Ex.: React, SQL, Inglês').should('have.value', 'React');
    });
    cy.stubJson(
      'GET',
      secao('habilidade'),
      {
        success: true,
        data: [
          { id: 'h1', usuarioId: 'u-candidato', habilidade: 'SQL', nivel: 'avancado', itemId: 'cat-sql' },
          { id: 'h2', usuarioId: 'u-candidato', habilidade: 'React', nivel: 'intermediario', itemId: 'cat-react' },
        ],
      },
      'habilidades',
    );
    dialogo('Nova habilidade').findByRole('button', { name: 'Salvar' }).click();

    cy.wait('@criar').its('request.body').should('deep.equal', {
      habilidade: 'React', nivel: 'intermediario', itemId: 'cat-react',
    });
    cy.findByRole('dialog').should('not.exist');
    secaoDaPagina('Habilidades').findByText('React').should('be.visible');

    // ---- Editar nível ----
    cy.stubJson('PUT', secao('habilidade/h2'), { success: true, data: { id: 'h2' } }, 'editar');
    cy.contains('span', 'React').findByRole('button', { name: 'Editar' }).click();
    dialogo('Editar habilidade').within(() => {
      cy.contains('label', 'Nível').parent().find('[role="combobox"]').click();
    });
    cy.findByRole('option', { name: 'Especialista' }).click();
    cy.stubJson(
      'GET',
      secao('habilidade'),
      {
        success: true,
        data: [
          { id: 'h1', usuarioId: 'u-candidato', habilidade: 'SQL', nivel: 'avancado', itemId: 'cat-sql' },
          { id: 'h2', usuarioId: 'u-candidato', habilidade: 'React', nivel: 'especialista', itemId: 'cat-react' },
        ],
      },
      'habilidades',
    );
    dialogo('Editar habilidade').findByRole('button', { name: 'Salvar' }).click();

    cy.wait('@editar').its('request.body').should('deep.equal', {
      habilidade: 'React', nivel: 'especialista', itemId: 'cat-react',
    });
    cy.contains('span', 'React').should('contain.text', 'Especialista');

    // ---- Excluir ----
    cy.stubJson('DELETE', secao('habilidade/h1'), { success: true, data: null }, 'excluir');
    cy.contains('span', 'SQL').findByRole('button', { name: 'Excluir' }).click();
    cy.stubJson(
      'GET',
      secao('habilidade'),
      { success: true, data: [{ id: 'h2', usuarioId: 'u-candidato', habilidade: 'React', nivel: 'especialista', itemId: 'cat-react' }] },
      'habilidades',
    );
    dialogo('Excluir habilidade?').within(() => {
      cy.findByText('SQL').should('be.visible');
      cy.findByRole('button', { name: 'Excluir' }).click();
    });
    cy.wait('@excluir');
    cy.findByRole('dialog').should('not.exist');
    secaoDaPagina('Habilidades').within(() => {
      cy.findByText('SQL').should('not.exist');
      cy.findByText('React').should('be.visible');
    });
  });

  it('habilidade é obrigatória e texto fora do catálogo vai com itemId null', () => {
    abrirPerfil();
    cy.stubJson('POST', secao('habilidade'), { success: true, data: { id: 'h2' } }, 'criar', 201);

    secaoDaPagina('Habilidades').findByRole('button', { name: 'Adicionar' }).click();
    dialogo('Nova habilidade').within(() => {
      cy.findByRole('button', { name: 'Salvar' }).click();
      cy.findByPlaceholderText('Ex.: React, SQL, Inglês').then(($el) => {
        expect(($el[0] as HTMLInputElement).validity.valueMissing).to.eq(true);
      });
    });
    cy.get('@criar.all').should('have.length', 0);

    dialogo('Nova habilidade').within(() => {
      cy.findByPlaceholderText('Ex.: React, SQL, Inglês').type('Liderança');
      cy.findByText('Fora do catálogo: vale para a análise, mas não comprova requisito obrigatório.').should('be.visible');
      cy.findByRole('button', { name: 'Salvar' }).click();
    });
    cy.wait('@criar').its('request.body').should('deep.equal', {
      habilidade: 'Liderança', nivel: 'intermediario', itemId: null,
    });
  });

  it('erro da API ao excluir mostra a mensagem no diálogo de confirmação', () => {
    abrirPerfil();
    cy.stubJson('DELETE', secao('habilidade/h1'), { success: false, message: 'Não foi possível excluir.' }, 'excluir', 500);

    cy.contains('span', 'SQL').findByRole('button', { name: 'Excluir' }).click();
    dialogo('Excluir habilidade?').findByRole('button', { name: 'Excluir' }).click();
    cy.wait('@excluir');
    dialogo('Excluir habilidade?').within(() => {
      cy.findByText('Não foi possível excluir.').should('be.visible');
      cy.findByRole('button', { name: 'Cancelar' }).click();
    });
    cy.findByRole('dialog').should('not.exist');
    secaoDaPagina('Habilidades').findByText('SQL').should('be.visible');
  });
});

describe('Candidato — perfil: experiência e certificação', () => {
  it('cria uma experiência atual (dataFim null)', () => {
    abrirPerfil();
    cy.stubJson('POST', secao('experiencia'), { success: true, data: { id: 'x2' } }, 'criar', 201);

    secaoDaPagina('Experiência profissional').findByRole('button', { name: 'Adicionar' }).click();
    dialogo('Nova experiência').within(() => {
      campo('Empresa').type('Beta Sistemas');
      campo('Cargo').type('Desenvolvedor Pleno');
      campo('Descrição das atividades').type('Front-end em React.');
      campo('Início').type('2023-01-15');
      cy.findByRole('checkbox', { name: 'Trabalho atual' }).check();
      campo('Fim').should('be.disabled');
    });
    cy.stubJson(
      'GET',
      secao('experiencia'),
      {
        success: true,
        data: [{
          id: 'x2', usuarioId: 'u-candidato', empresa: 'Beta Sistemas', cargo: 'Desenvolvedor Pleno',
          descricaoAtivida_: 'Front-end em React.', dataInicio: '2023-01-15T12:00:00.000Z', dataFim: null, areaId: null,
        }],
      },
      'experiencias',
    );
    dialogo('Nova experiência').findByRole('button', { name: 'Salvar' }).click();

    cy.wait('@criar').its('request.body').should('deep.equal', {
      empresa: 'Beta Sistemas', cargo: 'Desenvolvedor Pleno', descricaoAtivida_: 'Front-end em React.',
      dataInicio: '2023-01-15', dataFim: null, areaId: null,
    });
    cy.findByRole('dialog').should('not.exist');
    secaoDaPagina('Experiência profissional').within(() => {
      cy.findByText('Desenvolvedor Pleno').should('be.visible');
      cy.contains('– Atual').should('be.visible');
    });
  });

  it('cria uma certificação', () => {
    abrirPerfil();
    cy.stubJson('POST', secao('certificacao'), { success: true, data: { id: 'ce2' } }, 'criar', 201);

    secaoDaPagina('Certificações').findByRole('button', { name: 'Adicionar' }).click();
    dialogo('Nova certificação').within(() => {
      cy.findByRole('combobox').type('AWS Cloud Practitioner');
      campo('Emissor').type('Amazon');
      campo('Data de emissão').type('2024-03-01');
      campo('Código (opcional)').type('AWS-999');
    });
    cy.stubJson(
      'GET',
      secao('certificacao'),
      {
        success: true,
        data: [{
          id: 'ce2', usuarioId: 'u-candidato', nome: 'AWS Cloud Practitioner', emissor: 'Amazon',
          dataEmissao: '2024-03-01T12:00:00.000Z', dataExpiracao: null, codigo: 'AWS-999', itemId: null,
        }],
      },
      'certificacoes',
    );
    dialogo('Nova certificação').findByRole('button', { name: 'Salvar' }).click();

    cy.wait('@criar').its('request.body').should('deep.equal', {
      nome: 'AWS Cloud Practitioner', emissor: 'Amazon', dataEmissao: '2024-03-01',
      dataExpiracao: null, codigo: 'AWS-999', itemId: null,
    });
    cy.findByRole('dialog').should('not.exist');
    secaoDaPagina('Certificações').within(() => {
      cy.findByText('AWS Cloud Practitioner').should('be.visible');
      cy.contains('cód. AWS-999').should('be.visible');
    });
  });
});

describe('Candidato — perfil: exclusão de conta', () => {
  it('exige digitar o e-mail, envia DELETE /api/usuarios/me e leva ao login do candidato sem sessão', () => {
    abrirPerfil();
    cy.stubJson('DELETE', '**/api/usuarios/me', { success: true, data: null }, 'excluirConta');

    cy.findByRole('button', { name: 'Excluir minha conta' }).click();
    dialogo('Excluir sua conta').within(() => {
      cy.findByRole('button', { name: 'Excluir permanentemente' }).should('be.disabled');
      campo('E-mail da conta').type('outro@email.com');
      cy.findByRole('button', { name: 'Excluir permanentemente' }).should('be.disabled');
      // Normaliza caixa e espaços como o back-end.
      campo('E-mail da conta').clear().type('  CAIO@email.com ');
      cy.findByRole('button', { name: 'Excluir permanentemente' }).should('be.enabled').click();
    });

    cy.wait('@excluirConta').its('request.body').should('deep.equal', { emailConfirmacao: 'CAIO@email.com' });
    cy.location('pathname').should('eq', '/candidato/login');
    cy.findByRole('heading', { name: /Encontre sua próxima/ }).should('be.visible');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('auth_token')).to.eq(null);
      expect(win.localStorage.getItem('auth_user')).to.eq(null);
    });
  });

  it('cancelar não envia nada', () => {
    abrirPerfil();
    cy.stubJson('DELETE', '**/api/usuarios/me', { success: true, data: null }, 'excluirConta');

    cy.findByRole('button', { name: 'Excluir minha conta' }).click();
    dialogo('Excluir sua conta').findByRole('button', { name: 'Cancelar' }).click();
    cy.findByRole('dialog').should('not.exist');
    cy.get('@excluirConta.all').should('have.length', 0);
    cy.location('pathname').should('eq', '/perfil');
  });

  it('erro da API ao excluir mostra a mensagem e mantém a sessão', () => {
    abrirPerfil();
    cy.stubJson('DELETE', '**/api/usuarios/me', { success: false, message: 'E-mail de confirmação não confere.' }, 'excluirConta', 400);

    cy.findByRole('button', { name: 'Excluir minha conta' }).click();
    dialogo('Excluir sua conta').within(() => {
      campo('E-mail da conta').type('caio@email.com');
      cy.findByRole('button', { name: 'Excluir permanentemente' }).click();
    });

    cy.wait('@excluirConta');
    dialogo('Excluir sua conta').findByText('E-mail de confirmação não confere.').should('be.visible');
    cy.location('pathname').should('eq', '/perfil');
    cy.window().its('localStorage').invoke('getItem', 'auth_token').should('eq', 'token-candidato');
  });
});

// Módulo isolado: sem isso as constantes de topo colidem entre specs no tsc.
export {};
