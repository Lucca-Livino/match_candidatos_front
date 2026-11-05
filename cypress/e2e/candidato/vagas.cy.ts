// Área do candidato: home, listagem de vagas, detalhe e candidatura com questionário.

const VAGAS_LISTA = /\/api\/vagas\?/;
const CANDIDATURAS = '**/api/usuarios/u-candidato/candidatura';

// stubJson só aceita glob; a listagem tem query string variável, então regex.
function stubVagas(fixture: string) {
  cy.intercept('GET', VAGAS_LISTA, { fixture }).as('vagas');
}

// Cada tecla dispara um GET (sem debounce). Todos os prefixos devolvem o mesmo
// resultado filtrado para que a ordem de chegada não importe — a corrida real
// tem teste próprio ("resposta atrasada de um prefixo").
function stubBusca() {
  cy.intercept('GET', /\/api\/vagas\?.*titulo=/, { fixture: 'candidato/vagas-paginadas-busca.json' });
  cy.intercept('GET', /\/api\/vagas\?.*titulo=React$/, { fixture: 'candidato/vagas-paginadas-busca.json' }).as('busca');
}

describe('Candidato — home', () => {
  it('mostra as vagas ativas do fixture e o total no banner', () => {
    stubVagas('candidato/vagas-paginadas.json');
    cy.visitComo('candidato', '/candidato');

    cy.wait('@vagas').its('request.url').should('include', 'status=ativa').and('include', 'limit=9');
    cy.findByRole('heading', { name: 'Candidate-se às vagas disponíveis' }).should('be.visible');
    cy.findByText('3 oportunidades encontradas para o seu perfil.').should('be.visible');
    cy.findByRole('heading', { name: 'Desenvolvedor React Pleno' }).should('be.visible');
    cy.findByRole('heading', { name: 'Analista de RH' }).should('be.visible');
    // rotuloArea acentua JURIDICO.
    cy.findByText('JURÍDICO').should('be.visible');
    // Só os 3 primeiros critérios viram chip; o resto vira "+N mais".
    cy.findByText('+1 mais').should('be.visible');
    cy.findAllByRole('button', { name: 'Candidatar-se' }).should('have.length', 3);
  });

  it('busca por título e filtra por área enviando os parâmetros à API', () => {
    stubVagas('candidato/vagas-paginadas.json');
    cy.visitComo('candidato', '/candidato');
    cy.wait('@vagas');

    stubBusca();
    cy.findByRole('textbox', { name: 'Buscar vagas por título ou palavra-chave' }).type('React');
    cy.wait('@busca').its('request.url').should('include', 'titulo=React');
    cy.findByText('1 oportunidade encontrada para o seu perfil.').should('be.visible');
    cy.findByRole('heading', { name: 'Analista de RH' }).should('not.exist');

    cy.intercept('GET', /\/api\/vagas\?.*area=RH/, { fixture: 'candidato/vagas-vazio.json' }).as('area');
    cy.findByRole('combobox').click();
    cy.findByRole('option', { name: 'RH' }).click();
    cy.wait('@area').its('request.url').should('include', 'area=RH').and('include', 'titulo=React');
    cy.findByText('Nenhuma vaga encontrada').should('be.visible');
  });

  it('botão "Ver candidaturas" leva para a lista de candidaturas', () => {
    cy.visitComo('candidato', '/candidato');
    cy.findByRole('button', { name: /Ver candidaturas/ }).click();
    cy.location('pathname').should('eq', '/minhas-candidaturas');
    cy.findByRole('heading', { name: 'Minhas Candidaturas' }).should('be.visible');
  });
});

describe('Candidato — listagem de vagas', () => {
  it('lista vagas, filtra pela aba de área e mostra estado vazio com "Limpar filtros"', () => {
    stubVagas('candidato/vagas-paginadas.json');
    cy.visitComo('candidato', '/candidato/vagas');
    cy.wait('@vagas');

    cy.findByText('3 vagas').should('be.visible');
    cy.findByRole('heading', { name: 'Assistente Jurídico' }).should('be.visible');

    cy.intercept('GET', /\/api\/vagas\?.*area=MARKETING/, { fixture: 'candidato/vagas-vazio.json' }).as('marketing');
    cy.findByRole('button', { name: 'MARKETING' }).click();
    cy.wait('@marketing').its('request.url').should('include', 'status=ativa');
    cy.findByText('Nenhuma vaga encontrada').should('be.visible');
    cy.findByText('0 vagas').should('be.visible');

    // Limpar volta para "Todas" (sem parâmetro area).
    cy.findByRole('button', { name: 'Limpar filtros' }).click();
    cy.wait('@vagas').its('request.url').should('not.include', 'area=');
    cy.findByRole('heading', { name: 'Desenvolvedor React Pleno' }).should('be.visible');
  });

  it('busca por palavra-chave', () => {
    stubVagas('candidato/vagas-paginadas.json');
    cy.visitComo('candidato', '/candidato/vagas');
    cy.wait('@vagas');

    stubBusca();
    cy.findByPlaceholderText('Buscar por título ou palavra-chave...').type('React');
    cy.wait('@busca');
    cy.findByText('1 vaga').should('be.visible');
    cy.findByRole('heading', { name: 'Assistente Jurídico' }).should('not.exist');
  });

  // Regressão: cada tecla dispara um GET; a resposta de um prefixo ("Reac") que
  // chega depois da do termo completo ("React") tem de ser descartada. O atraso
  // torna a corrida determinística.
  it('resposta atrasada de um prefixo não sobrescreve o resultado da busca completa', () => {
    stubVagas('candidato/vagas-paginadas.json');
    cy.visitComo('candidato', '/candidato/vagas');
    cy.wait('@vagas');

    cy.intercept('GET', /\/api\/vagas\?.*titulo=Reac$/, {
      delay: 800,
      fixture: 'candidato/vagas-paginadas.json',
    }).as('prefixo');
    cy.intercept('GET', /\/api\/vagas\?.*titulo=React$/, { fixture: 'candidato/vagas-paginadas-busca.json' }).as('busca');
    cy.findByPlaceholderText('Buscar por título ou palavra-chave...').type('React');
    cy.wait('@busca');
    cy.wait('@prefixo');
    cy.findByText('1 vaga').should('be.visible');
    cy.findByRole('heading', { name: 'Assistente Jurídico' }).should('not.exist');
  });

  it('pagina pedindo page=2 à API', () => {
    stubVagas('candidato/vagas-pagina-1.json');
    cy.visitComo('candidato', '/candidato/vagas');
    cy.wait('@vagas');

    cy.intercept('GET', /\/api\/vagas\?page=2&/, { fixture: 'candidato/vagas-pagina-2.json' }).as('pagina2');
    cy.findByRole('button', { name: '2' }).click();
    cy.wait('@pagina2');
    cy.findByRole('heading', { name: 'Engenheiro de Dados Sênior' }).should('be.visible');
  });

  it('o card leva ao detalhe da vaga', () => {
    stubVagas('candidato/vagas-paginadas.json');
    cy.stubJson('GET', '**/api/vagas/v2', 'candidato/vaga-v2.json', 'vaga');
    cy.visitComo('candidato', '/candidato/vagas');
    cy.wait('@vagas');

    cy.contains('h3', 'Analista de RH')
      .closest('div.rounded-2xl')
      .within(() => cy.findByRole('button', { name: 'Candidatar-se' }).click());
    cy.location('pathname').should('eq', '/vagas/v2');
    cy.wait('@vaga');
    cy.findByRole('heading', { level: 1, name: 'Analista de RH' }).should('be.visible');
  });
});

describe('Candidato — detalhe da vaga e candidatura', () => {
  function stubVagaComQuestionario() {
    cy.stubJson('GET', '**/api/vagas/v1', 'candidato/vaga-v1.json', 'vaga');
    cy.stubJson('GET', '**/api/questionario?vagaId=v1', 'candidato/questionarios-v1.json', 'questionarios');
    cy.stubJson('GET', '**/api/questionario/q1', 'candidato/questionario-q1.json', 'questionario');
  }

  it('mostra dados, requisitos e critérios da vaga', () => {
    cy.stubJson('GET', '**/api/vagas/v1', 'candidato/vaga-v1.json', 'vaga');
    cy.visitComo('candidato', '/vagas/v1');
    cy.wait('@vaga');

    cy.findByRole('heading', { level: 1, name: 'Desenvolvedor React Pleno' }).should('be.visible');
    cy.findByText('Construir interfaces web modernas com React e TypeScript.').should('be.visible');
    cy.findByRole('heading', { name: 'Requisitos gerais' }).should('be.visible');
    cy.contains('Experiência com SPA.').should('be.visible');
    cy.findByRole('heading', { name: 'O que buscamos' }).should('be.visible');
    cy.findByText('Hooks e componentes funcionais').should('be.visible');
    cy.findByText('Habilidade técnica').should('be.visible');
    cy.findByText('Formação').should('be.visible');
    cy.findAllByText('Obrigatório').should('have.length', 1);
    // Sem questionário ativo: só o botão.
    cy.findByText('Responda ao questionário acima para concluir sua candidatura.').should('not.exist');
    cy.findByRole('button', { name: 'Candidatar-se' }).should('be.enabled');
  });

  it('vaga inexistente mostra mensagem de não encontrada', () => {
    cy.stubJson('GET', '**/api/vagas/nao-existe', { success: false, message: 'Vaga não encontrada' }, 'vaga', 404);
    cy.visitComo('candidato', '/vagas/nao-existe');
    cy.wait('@vaga');
    cy.findByText('Vaga não encontrada.').should('be.visible');
    cy.findByRole('button', { name: 'Candidatar-se' }).should('not.exist');
  });

  it('vaga sem questionário: candidata-se só com POST da candidatura', () => {
    cy.stubJson('GET', '**/api/vagas/v1', 'candidato/vaga-v1.json', 'vaga');
    cy.stubJson(
      'POST',
      CANDIDATURAS,
      { success: true, data: { id: 'cand-1', usuarioId: 'u-candidato', vagaId: 'v1', compativel: 1, status: 'inscrito' } },
      'candidatar',
      201,
    );
    cy.visitComo('candidato', '/vagas/v1');
    cy.wait('@vaga');

    cy.findByRole('button', { name: 'Candidatar-se' }).click();
    cy.wait('@candidatar').its('request.body').should('deep.equal', { vagaId: 'v1' });
    cy.findByText('Você já se candidatou a esta vaga').should('be.visible');
    cy.findByRole('button', { name: 'Candidatar-se' }).should('not.exist');
  });

  it('com questionário: valida obrigatória e envia candidatura → iniciar → responder → finalizar, nessa ordem', () => {
    stubVagaComQuestionario();
    const ordem: string[] = [];
    cy.intercept('POST', CANDIDATURAS, (req) => {
      ordem.push('candidatura');
      req.reply({ statusCode: 201, body: { success: true, data: { id: 'cand-1', vagaId: 'v1', status: 'inscrito' } } });
    }).as('candidatar');
    cy.intercept('POST', '**/api/resposta-questionario/iniciar', (req) => {
      ordem.push('iniciar');
      req.reply({ success: true, data: { id: 'r1', questionarioId: 'q1', usuarioId: 'u-candidato', status: 'em_andamento' } });
    }).as('iniciar');
    cy.intercept('POST', '**/api/resposta-questionario/r1/responder', (req) => {
      ordem.push('responder');
      req.reply({ success: true, data: null });
    }).as('responder');
    cy.intercept('PATCH', '**/api/resposta-questionario/r1/finalizar', (req) => {
      ordem.push('finalizar');
      req.reply({ success: true, data: null });
    }).as('finalizar');

    cy.visitComo('candidato', '/vagas/v1');
    cy.wait('@questionario');

    cy.findByRole('heading', { name: 'Triagem técnica' }).should('be.visible');
    cy.findByText('Responda com sinceridade.').should('be.visible');
    cy.findByText('Responda ao questionário acima para concluir sua candidatura.').should('be.visible');

    // Sem responder a obrigatória: erro e nada é enviado.
    cy.findByRole('button', { name: 'Candidatar-se' }).click();
    cy.findByText('Pergunta 1 é obrigatória.').should('be.visible');
    cy.get('@candidatar.all').should('have.length', 0);

    cy.findByRole('radio', { name: 'De 1 a 3 anos' }).check();
    cy.findByPlaceholderText('Digite sua resposta...').type('  Um app de agendamento.  ');
    cy.findByRole('button', { name: 'Candidatar-se' }).click();

    cy.wait('@candidatar').its('request.body').should('deep.equal', { vagaId: 'v1' });
    cy.wait('@iniciar').its('request.body').should('deep.equal', { questionarioId: 'q1', usuarioId: 'u-candidato' });
    cy.wait('@responder').its('request.body').should('deep.equal', {
      respostas: [
        { perguntaId: 'p1', opcaoRespostaIds: ['o2'] },
        { perguntaId: 'p2', textoResposta: 'Um app de agendamento.' },
      ],
    });
    cy.wait('@finalizar');
    cy.wrap(ordem).should('deep.equal', ['candidatura', 'iniciar', 'responder', 'finalizar']);

    cy.findByText('Você já se candidatou a esta vaga').should('be.visible');
    cy.findByRole('heading', { name: 'Triagem técnica' }).should('not.exist');
    cy.findByRole('button', { name: 'Candidatar-se' }).should('not.exist');
  });

  it('409 na candidatura (reenvio) segue para o questionário', () => {
    stubVagaComQuestionario();
    cy.stubJson('POST', CANDIDATURAS, { success: false, message: 'Candidatura já existe' }, 'candidatar', 409);
    cy.stubJson('POST', '**/api/resposta-questionario/iniciar', { success: true, data: { id: 'r1', status: 'em_andamento' } }, 'iniciar');
    cy.stubJson('POST', '**/api/resposta-questionario/r1/responder', { success: true, data: null }, 'responder');
    cy.stubJson('PATCH', '**/api/resposta-questionario/r1/finalizar', { success: true, data: null }, 'finalizar');

    cy.visitComo('candidato', '/vagas/v1');
    cy.wait('@questionario');
    cy.findByRole('radio', { name: 'Mais de 3 anos' }).check();
    cy.findByRole('button', { name: 'Candidatar-se' }).click();

    cy.wait('@candidatar');
    cy.wait('@responder').its('request.body').should('deep.equal', {
      respostas: [{ perguntaId: 'p1', opcaoRespostaIds: ['o3'] }],
    });
    cy.wait('@finalizar');
    cy.findByText('Você já se candidatou a esta vaga').should('be.visible');
  });

  it('vaga já candidatada mostra o aviso e esconde questionário e botão', () => {
    stubVagaComQuestionario();
    cy.stubJson('GET', CANDIDATURAS, 'candidato/candidaturas.json', 'candidaturas');
    cy.visitComo('candidato', '/vagas/v1');
    cy.wait('@candidaturas');
    cy.wait('@vaga');

    cy.findByText('Você já se candidatou a esta vaga').should('be.visible');
    cy.findByRole('heading', { name: 'Triagem técnica' }).should('not.exist');
    cy.findByRole('button', { name: 'Candidatar-se' }).should('not.exist');
  });

  it('erro da API ao candidatar mostra a mensagem e mantém o botão', () => {
    cy.stubJson('GET', '**/api/vagas/v1', 'candidato/vaga-v1.json', 'vaga');
    cy.stubJson('POST', CANDIDATURAS, { success: false, message: 'Vaga não está aceitando candidaturas.' }, 'candidatar', 422);
    cy.visitComo('candidato', '/vagas/v1');
    cy.wait('@vaga');

    cy.findByRole('button', { name: 'Candidatar-se' }).click();
    cy.wait('@candidatar');
    cy.findByText('Vaga não está aceitando candidaturas.').should('be.visible');
    cy.findByText('Você já se candidatou a esta vaga').should('not.exist');
    cy.findByRole('button', { name: 'Candidatar-se' }).should('be.enabled');
  });

  it('falha ao finalizar o questionário mostra erro (sem marcar como candidatado)', () => {
    stubVagaComQuestionario();
    cy.stubJson('POST', CANDIDATURAS, { success: true, data: { id: 'cand-1', vagaId: 'v1' } }, 'candidatar', 201);
    cy.stubJson('POST', '**/api/resposta-questionario/iniciar', { success: true, data: { id: 'r1' } }, 'iniciar');
    cy.stubJson('POST', '**/api/resposta-questionario/r1/responder', { success: true, data: null }, 'responder');
    cy.stubJson('PATCH', '**/api/resposta-questionario/r1/finalizar', { success: false }, 'finalizar', 500);

    cy.visitComo('candidato', '/vagas/v1');
    cy.wait('@questionario');
    cy.findByRole('radio', { name: 'Menos de 1 ano' }).check();
    cy.findByRole('button', { name: 'Candidatar-se' }).click();

    cy.wait('@finalizar');
    // Sem "message" no corpo, o request() cai no texto genérico com o status.
    cy.findByText('Erro 500').should('be.visible');
    cy.findByText('Você já se candidatou a esta vaga').should('not.exist');
    cy.findByText(/Sua candidatura foi registrada, mas o questionário não foi concluído/).should('be.visible');
    cy.findByRole('button', { name: 'Concluir candidatura' }).should('be.enabled');
  });

  it('candidatura com questionário pendente: retoma sem novo POST de candidatura', () => {
    stubVagaComQuestionario();
    cy.stubJson('GET', CANDIDATURAS, {
      success: true,
      data: [{ id: 'cand-1', vagaId: 'v1', status: 'inscrito', questionarioPendente: true }],
    }, 'candidaturas');
    cy.stubJson('POST', CANDIDATURAS, { success: true, data: {} }, 'candidatar', 201);
    cy.stubJson('POST', '**/api/resposta-questionario/iniciar', { success: true, data: { id: 'r1' } }, 'iniciar', 201);
    cy.stubJson('POST', '**/api/resposta-questionario/r1/responder', { success: true, data: null }, 'responder');
    cy.stubJson('PATCH', '**/api/resposta-questionario/r1/finalizar', { success: true, data: {} }, 'finalizar');

    cy.visitComo('candidato', '/vagas/v1');
    cy.wait(['@candidaturas', '@questionario']);
    cy.findByText(/Sua candidatura foi registrada, mas o questionário não foi concluído/).should('be.visible');
    cy.findByRole('button', { name: 'Candidatar-se' }).should('not.exist');

    cy.findByRole('radio', { name: 'Menos de 1 ano' }).check();
    cy.findByRole('button', { name: 'Concluir candidatura' }).click();

    cy.wait('@finalizar');
    cy.findByText('Você já se candidatou a esta vaga').should('be.visible');
    cy.get('@candidatar.all').should('have.length', 0);
  });

  it('candidatura concluída mostra "já se candidatou" sem questionário', () => {
    stubVagaComQuestionario();
    cy.stubJson('GET', CANDIDATURAS, {
      success: true,
      data: [{ id: 'cand-1', vagaId: 'v1', status: 'inscrito', questionarioPendente: false }],
    }, 'candidaturas');

    cy.visitComo('candidato', '/vagas/v1');
    cy.wait('@candidaturas');
    cy.findByText('Você já se candidatou a esta vaga').should('be.visible');
    cy.findByRole('button', { name: /Candidatar-se|Concluir candidatura/ }).should('not.exist');
  });

  it('falha ao carregar o questionário bloqueia a candidatura', () => {
    cy.stubJson('GET', '**/api/vagas/v1', 'candidato/vaga-v1.json', 'vaga');
    cy.stubJson('GET', '**/api/questionario?vagaId=v1', { success: false }, 'questionarios', 500);
    cy.stubJson('POST', CANDIDATURAS, { success: true, data: {} }, 'candidatar', 201);

    cy.visitComo('candidato', '/vagas/v1');
    cy.wait('@questionarios');
    cy.findByRole('alert').should('contain.text', 'Não foi possível carregar o questionário da vaga.');
    cy.findByRole('button', { name: 'Candidatar-se' }).should('be.disabled');
    cy.get('@candidatar.all').should('have.length', 0);
  });

  it('vaga pausada não oferece candidatura a quem não se inscreveu', () => {
    cy.fixture('candidato/vaga-v1.json').then((fixture) => {
      cy.stubJson('GET', '**/api/vagas/v1', { ...fixture, data: { ...fixture.data, status: 'pausada' } }, 'vaga');
    });

    cy.visitComo('candidato', '/vagas/v1');
    cy.wait('@vaga');
    cy.findByText('Esta vaga não está recebendo candidaturas no momento.').should('be.visible');
    cy.findByRole('button', { name: 'Candidatar-se' }).should('not.exist');
  });
});

// Módulo isolado: sem isso as constantes de topo colidem entre specs no tsc.
export {};
