// Formulário de vaga: criar (/vagas/nova), editar (/vagas/:id/editar) e
// duplicar (/vagas/:id/duplicar).
//
// Sequência do save no modo criar (VagaForm + salvarQuestionarioCompleto):
//   POST /api/vagas -> GET /api/questionario?vagaId -> POST /api/questionario
//   -> POST /api/pergunta -> PATCH /api/pergunta/reordenar
//   -> POST /api/pergunta/:id/opcao (todas com correta=0)
//   -> PUT /api/pergunta/:id/opcao/:opcaoId { correta: 1 }
//   -> PATCH /api/vagas/:id { status } (só se o status não for "pausada")
// No modo editar: PATCH /api/vagas/:id -> PUT /api/questionario/:id
//   -> [PATCH /api/questionario/:id/ativo] -> PUT /api/pergunta/:id
//   -> PATCH /api/pergunta/reordenar -> PUT de cada opção -> PUT da correta.

const FIX = 'recrutador-vagas';

const ok = (data: unknown = {}) => ({ success: true, data });

/* ---------------- stubs ---------------- */

function stubCriacao() {
  cy.intercept(
    { method: 'POST', pathname: '/api/vagas' },
    { statusCode: 201, body: ok({ _id: 'v-nova', titulo: 'Nova', status: 'pausada' }) },
  ).as('criarVaga');
  cy.intercept(
    { method: 'GET', pathname: '/api/questionario', query: { vagaId: 'v-nova' } },
    ok([]),
  ).as('questExistente');
  cy.intercept(
    { method: 'POST', pathname: '/api/questionario' },
    { statusCode: 201, body: ok({ id: 'q-nova' }) },
  ).as('criarQuest');
  cy.intercept(
    { method: 'POST', pathname: '/api/pergunta' },
    { statusCode: 201, body: ok({ id: 'p-nova' }) },
  ).as('criarPergunta');
  cy.intercept({ method: 'PATCH', pathname: '/api/pergunta/reordenar' }, ok()).as('reordenar');

  let n = 0;
  cy.intercept({ method: 'POST', pathname: '/api/pergunta/*/opcao' }, (req) => {
    n += 1;
    req.reply({ statusCode: 201, body: ok({ id: `o-nova-${n}`, ...req.body }) });
  }).as('criarOpcao');
  cy.intercept({ method: 'PUT', pathname: '/api/pergunta/*/opcao/*' }, ok()).as('atualizarOpcao');
  cy.intercept(
    { method: 'PATCH', pathname: '/api/vagas/v-nova' },
    ok({ _id: 'v-nova', status: 'ativa' }),
  ).as('patchVagaNova');
}

function stubVagaExistente(questionario = `${FIX}/questionario-completo.json`) {
  cy.intercept({ method: 'GET', pathname: '/api/vagas/v-100' }, { fixture: `${FIX}/vaga-existente.json` }).as('vaga');
  cy.intercept(
    { method: 'GET', pathname: '/api/questionario', query: { vagaId: 'v-100' } },
    { fixture: `${FIX}/questionarios-da-vaga.json` },
  ).as('questLista');
  cy.intercept({ method: 'GET', pathname: '/api/questionario/q-100' }, { fixture: questionario }).as('questCompleto');
}

function stubEdicao() {
  cy.intercept({ method: 'PATCH', pathname: '/api/vagas/v-100' }, ok({ _id: 'v-100' })).as('salvarVaga');
  cy.intercept({ method: 'PUT', pathname: '/api/questionario/q-100' }, ok({ id: 'q-100' })).as('salvarQuest');
  cy.intercept({ method: 'PATCH', pathname: '/api/questionario/q-100/ativo' }, ok({ id: 'q-100' })).as('ativoQuest');
  cy.intercept({ method: 'PUT', pathname: '/api/pergunta/p-1' }, ok({ id: 'p-1' })).as('salvarPergunta');
  cy.intercept({ method: 'PATCH', pathname: '/api/pergunta/reordenar' }, ok()).as('reordenar');
  cy.intercept({ method: 'PUT', pathname: '/api/pergunta/p-1/opcao/*' }, ok()).as('atualizarOpcao');
}

/* ---------------- helpers de tela ---------------- */

const secaoDados = () => cy.findByRole('heading', { name: 'Dados da Vaga' }).parent();
const secaoQuestionario = () => cy.findByRole('heading', { name: 'Questionário *' }).closest('.rounded-md');

function escolherNoSelect(rotulo: string, opcao: string) {
  cy.findByRole('combobox', { name: rotulo }).click();
  cy.findByRole('option', { name: opcao }).click();
  cy.findByRole('combobox', { name: rotulo }).should('contain.text', opcao);
}

function preencherDadosBasicos({ comArea = true } = {}) {
  secaoDados().within(() => {
    cy.findByLabelText('Título *').type('Desenvolvedor Back-end');
    cy.findByLabelText('Descrição *').type('Manter APIs em Node.js e bancos relacionais.');
    cy.findByLabelText('Requisitos Gerais').type('Node.js, SQL e testes automatizados.');
  });
  if (comArea) escolherNoSelect('Área *', 'TI');
}

function preencherQuestionario({ titulo = 'Avaliação técnica', comPergunta = true } = {}) {
  secaoQuestionario().within(() => {
    if (titulo) cy.findByLabelText('Título *').type(titulo);
    cy.findByLabelText('Instruções').type('Responda sem consultar.');
    if (!comPergunta) return;
    cy.findByRole('button', { name: /adicionar pergunta/i }).click();
    cy.findByPlaceholderText('Digite o enunciado da pergunta...').type('Qual hook guarda estado local?');
    cy.findByPlaceholderText('Opção 1').type('useFetch');
    cy.findByPlaceholderText('Opção 2').type('useState');
    cy.findAllByRole('radio', { name: 'Marcar como correta' }).eq(1).check();
  });
}

const criarVaga = () => cy.findByRole('button', { name: 'Criar Vaga' }).click();

function deveBloquearCom(mensagem: string, rota = '/vagas/nova') {
  cy.findByRole('alert').should('contain.text', mensagem);
  cy.location('pathname').should('eq', rota);
  cy.get('@criarVaga.all').should('have.length', 0);
}

/* ---------------- specs ---------------- */

describe('Recrutador — formulário de vaga', () => {
  describe('criar', () => {
    beforeEach(() => {
      stubCriacao();
      cy.intercept(
        { method: 'GET', pathname: '/api/catalogo', query: { tipo: 'habilidade' } },
        { fixture: `${FIX}/catalogo-habilidades.json` },
      ).as('catalogo');
    });

    it('cria vaga completa com critério do catálogo e questionário, e volta para /vagas', () => {
      cy.visitComo('recrutador', '/vagas/nova');
      cy.findByRole('heading', { name: 'Nova Vaga' }).should('be.visible');
      cy.findByText('A vaga será ativada após o questionário ser salvo.').should('be.visible');

      preencherDadosBasicos();

      // Critério obrigatório de habilidade, vinculado ao catálogo.
      cy.findByText('Nenhum critério adicionado. Critérios são opcionais.').should('be.visible');
      cy.findByRole('button', { name: /adicionar critério/i }).click();
      cy.findByLabelText('Nome *').type('React');
      cy.findByLabelText('Peso (%) *').should('have.value', '10').clear().type('30');
      cy.findByText('Soma dos pesos: 30% de 100% (70% disponíveis)').should('be.visible');
      cy.findByLabelText('Sim, é obrigatório').check();
      cy.findByRole('combobox', { name: 'Habilidade do catálogo *' }).type('Rea');
      cy.wait('@catalogo').its('request.query').should('include', { tipo: 'habilidade' });
      cy.findByRole('option', { name: /^React/ }).click();
      cy.findByRole('combobox', { name: 'Habilidade do catálogo *' }).should('have.value', 'React');
      cy.findByLabelText('Descrição do critério').type('Hooks e componentização');

      preencherQuestionario();
      criarVaga();

      cy.wait('@criarVaga').its('request.body').should('deep.equal', {
        titulo: 'Desenvolvedor Back-end',
        area: 'TI',
        descricao: 'Manter APIs em Node.js e bancos relacionais.',
        requisitos_gerais: 'Node.js, SQL e testes automatizados.',
        criterio_vaga: [
          {
            nome: 'React',
            tipo_criterio: 'skill_tecnica',
            peso_percentual: 30,
            obrigatorio: true,
            descricao: 'Hooks e componentização',
            requisito: { itemId: 'cat-react' },
          },
        ],
      });
      cy.wait('@questExistente');
      cy.wait('@criarQuest').its('request.body').should('deep.equal', {
        vagaId: 'v-nova',
        criadoPor: 'Rita Recrutadora',
        titulo: 'Avaliação técnica',
        instrucoes: 'Responda sem consultar.',
        ativo: 1,
      });
      cy.wait('@criarPergunta').its('request.body').should('deep.equal', {
        questionarioId: 'q-nova',
        enunciado: 'Qual hook guarda estado local?',
        tipoResposta: 'multipla_escolha',
        peso: 1,
        obrigatoria: 1,
        ordem: 100001,
      });
      cy.wait('@reordenar').its('request.body').should('deep.equal', {
        questionarioId: 'q-nova',
        perguntas: [{ id: 'p-nova', ordem: 1 }],
      });
      cy.wait('@criarOpcao').then(({ request }) => {
        expect(request.url).to.contain('/api/pergunta/p-nova/opcao');
        expect(request.body).to.deep.equal({ texto: 'useFetch', correta: 0, ordem: 1 });
      });
      cy.wait('@criarOpcao').its('request.body').should('deep.equal', { texto: 'useState', correta: 0, ordem: 2 });
      // A correta (2ª opção) só é marcada depois que todas existem.
      cy.wait('@atualizarOpcao').then(({ request }) => {
        expect(request.url).to.match(/\/api\/pergunta\/p-nova\/opcao\/o-nova-2$/);
        expect(request.body).to.deep.equal({ correta: 1 });
      });
      cy.wait('@patchVagaNova').its('request.body').should('deep.equal', { status: 'ativa' });

      cy.location('pathname').should('eq', '/vagas');
      cy.findByRole('heading', { name: 'Gerenciamento de Vagas' }).should('be.visible');
    });

    it('vaga pausada com pergunta dissertativa não cria opções nem muda o status', () => {
      cy.visitComo('recrutador', '/vagas/nova');
      preencherDadosBasicos();
      escolherNoSelect('Status *', 'Pausada');
      cy.findByText('A vaga será ativada após o questionário ser salvo.').should('not.exist');

      secaoQuestionario().within(() => {
        cy.findByLabelText('Título *').type('Perguntas abertas');
        cy.findByRole('button', { name: /adicionar pergunta/i }).click();
        cy.findByPlaceholderText('Digite o enunciado da pergunta...').type('Conte um projeto recente.');
      });
      // Único select da seção do questionário: o "Tipo" da pergunta (sem rótulo associado).
      secaoQuestionario().findByRole('combobox').should('contain.text', 'Múltipla escolha').click();
      cy.findByRole('option', { name: 'Dissertativa' }).click();
      cy.findByText('Resposta aberta — o candidato responderá em texto livre.').should('be.visible');

      criarVaga();

      cy.wait('@criarVaga').its('request.body').should('include', { titulo: 'Desenvolvedor Back-end', area: 'TI' })
        .and('not.have.property', 'status');
      cy.wait('@criarPergunta').its('request.body').should('include', {
        tipoResposta: 'dissertativa',
        enunciado: 'Conte um projeto recente.',
      });
      cy.wait('@reordenar');
      cy.location('pathname').should('eq', '/vagas');
      cy.get('@criarOpcao.all').should('have.length', 0);
      cy.get('@atualizarOpcao.all').should('have.length', 0);
      cy.get('@patchVagaNova.all').should('have.length', 0);
    });

    describe('validações que bloqueiam o envio', () => {
      it('campos obrigatórios vazios: o navegador barra e nada é enviado', () => {
        cy.visitComo('recrutador', '/vagas/nova');
        criarVaga();
        secaoDados().within(() => {
          cy.findByLabelText('Título *').should('match', ':invalid');
          cy.findByLabelText('Descrição *').should('match', ':invalid');
        });
        cy.findByRole('alert').should('not.exist');
        cy.location('pathname').should('eq', '/vagas/nova');
        cy.get('@criarVaga.all').should('have.length', 0);
      });

      it('sem área', () => {
        cy.visitComo('recrutador', '/vagas/nova');
        preencherDadosBasicos({ comArea: false });
        preencherQuestionario();
        criarVaga();
        deveBloquearCom('Selecione a área da vaga.');
      });

      it('questionário sem pergunta', () => {
        cy.visitComo('recrutador', '/vagas/nova');
        preencherDadosBasicos();
        preencherQuestionario({ comPergunta: false });
        cy.findByText('Adicione ao menos uma pergunta.').should('be.visible');
        criarVaga();
        deveBloquearCom('Adicione ao menos uma pergunta ao questionário.');
      });

      it('questionário sem título', () => {
        cy.visitComo('recrutador', '/vagas/nova');
        preencherDadosBasicos();
        preencherQuestionario({ titulo: '' });
        criarVaga();
        deveBloquearCom('O título do questionário deve ter ao menos 3 caracteres.');
      });

      it('múltipla escolha com opção sem texto', () => {
        cy.visitComo('recrutador', '/vagas/nova');
        preencherDadosBasicos();
        preencherQuestionario();
        secaoQuestionario().within(() => {
          cy.findByRole('button', { name: /^opção$/i }).click();
          cy.findByPlaceholderText('Opção 3').should('have.value', '');
        });
        criarVaga();
        deveBloquearCom('Pergunta 1: preencha o texto de todas as opções.');
      });

      it('soma dos pesos acima de 100%', () => {
        cy.visitComo('recrutador', '/vagas/nova');
        preencherDadosBasicos();
        cy.findByRole('button', { name: /adicionar critério/i }).click();
        cy.findByRole('button', { name: /adicionar critério/i }).click();
        cy.findAllByLabelText('Nome *').eq(0).type('React');
        cy.findAllByLabelText('Nome *').eq(1).type('Node.js');
        cy.findAllByLabelText('Peso (%) *').eq(0).clear().type('60');
        cy.findAllByLabelText('Peso (%) *').eq(1).clear().type('50');
        cy.findByText('Soma dos pesos: 110% de 100%').should('be.visible');
        preencherQuestionario();
        criarVaga();
        deveBloquearCom('A soma dos pesos é 110% e não pode passar de 100%.');
      });

      it('critério obrigatório sem item do catálogo', () => {
        cy.visitComo('recrutador', '/vagas/nova');
        preencherDadosBasicos();
        cy.findByRole('button', { name: /adicionar critério/i }).click();
        cy.findByLabelText('Nome *').type('React');
        cy.findByLabelText('Sim, é obrigatório').check();
        preencherQuestionario();
        criarVaga();
        deveBloquearCom("O critério 'React' é obrigatório e precisa de um requisito do catálogo.");
      });
    });

    it('erro da API ao criar a vaga mostra o banner e mantém o formulário', () => {
      cy.intercept(
        { method: 'POST', pathname: '/api/vagas' },
        { statusCode: 500, body: { success: false, message: 'Erro interno ao criar vaga' } },
      ).as('criarVagaErro');
      cy.visitComo('recrutador', '/vagas/nova');
      preencherDadosBasicos();
      preencherQuestionario();
      criarVaga();

      cy.wait('@criarVagaErro');
      cy.findByRole('alert').should('contain.text', 'Erro interno ao criar vaga');
      cy.location('pathname').should('eq', '/vagas/nova');
      cy.findByRole('button', { name: 'Criar Vaga' }).should('be.enabled');
      secaoDados().findByLabelText('Título *').should('have.value', 'Desenvolvedor Back-end');
      cy.get('@criarQuest.all').should('have.length', 0);
    });

    it('se o questionário falhar, o reenvio reaproveita a vaga já criada (PATCH, não novo POST)', () => {
      cy.intercept(
        { method: 'POST', pathname: '/api/questionario', times: 1 },
        { statusCode: 500, body: { success: false, message: 'Falha ao criar questionário' } },
      ).as('criarQuestErro');
      cy.visitComo('recrutador', '/vagas/nova');
      preencherDadosBasicos();
      preencherQuestionario();
      criarVaga();

      cy.wait('@criarVaga');
      cy.wait('@criarQuestErro');
      cy.findByRole('alert').should('contain.text', 'Falha ao criar questionário');
      cy.location('pathname').should('eq', '/vagas/nova');

      criarVaga();
      // Reenvio: atualiza a vaga v-nova sem aplicar status ainda.
      cy.wait('@patchVagaNova').its('request.body').should((body) => {
        expect(body).to.include({ titulo: 'Desenvolvedor Back-end', area: 'TI' });
        expect(body).not.to.have.property('status');
      });
      cy.wait('@criarQuest').its('request.body').should('include', { vagaId: 'v-nova' });
      cy.wait('@patchVagaNova').its('request.body').should('deep.equal', { status: 'ativa' });
      cy.location('pathname').should('eq', '/vagas');
      cy.get('@criarVaga.all').should('have.length', 1);
    });
  });

  describe('editar', () => {
    it('carrega a vaga e o questionário existentes e envia PATCH/PUT com as mudanças', () => {
      stubVagaExistente();
      stubEdicao();
      cy.visitComo('recrutador', '/vagas/v-100/editar');
      cy.wait(['@vaga', '@questLista', '@questCompleto']);

      cy.findByRole('heading', { name: 'Editar Vaga' }).should('be.visible');
      secaoDados().within(() => {
        cy.findByLabelText('Título *').should('have.value', 'Desenvolvedor Front-end');
        cy.findByLabelText('Descrição *').should('have.value', 'Construir interfaces em React para o produto principal.');
        cy.findByLabelText('Requisitos Gerais').should('have.value', 'Experiência com TypeScript e testes.');
      });
      cy.findByRole('combobox', { name: 'Área *' }).should('contain.text', 'TI');
      cy.findByRole('combobox', { name: 'Status *' }).should('contain.text', 'Ativa');
      cy.findByLabelText('Nome *').should('have.value', 'React');
      cy.findByLabelText('Peso (%) *').should('have.value', '40');
      cy.findByLabelText('Descrição do critério').should('have.value', 'Hooks e componentização');

      secaoQuestionario().within(() => {
        cy.findByLabelText('Título *').should('have.value', 'Avaliação técnica inicial');
        cy.findByLabelText('Instruções').should('have.value', 'Responda com calma.');
        cy.findByLabelText(/questionário ativo/i).should('be.checked');
        cy.findByPlaceholderText('Digite o enunciado da pergunta...').should('have.value', 'Qual hook guarda estado local?');
        // Opções ordenadas por `ordem`, não pela ordem do JSON.
        cy.findByPlaceholderText('Opção 1').should('have.value', 'useState');
        cy.findByPlaceholderText('Opção 2').should('have.value', 'useFetch');
        cy.findAllByRole('radio', { name: 'Marcar como correta' }).eq(0).should('be.checked');
      });

      secaoDados().findByLabelText('Título *').clear().type('Desenvolvedor Front-end Pleno');
      escolherNoSelect('Status *', 'Pausada');
      secaoQuestionario().findByLabelText(/questionário ativo/i).uncheck();
      cy.findByRole('button', { name: 'Salvar Alterações' }).click();

      cy.wait('@salvarVaga').its('request.body').should('deep.equal', {
        titulo: 'Desenvolvedor Front-end Pleno',
        area: 'TI',
        descricao: 'Construir interfaces em React para o produto principal.',
        requisitos_gerais: 'Experiência com TypeScript e testes.',
        criterio_vaga: [
          {
            _id: 'c-1',
            nome: 'React',
            tipo_criterio: 'skill_tecnica',
            peso_percentual: 40,
            obrigatorio: false,
            descricao: 'Hooks e componentização',
          },
        ],
        status: 'pausada',
      });
      cy.wait('@salvarQuest').its('request.body').should('deep.equal', {
        titulo: 'Avaliação técnica inicial',
        instrucoes: 'Responda com calma.',
      });
      cy.wait('@ativoQuest').its('request.body').should('deep.equal', { ativo: 0 });
      cy.wait('@salvarPergunta').its('request.body').should('deep.equal', {
        enunciado: 'Qual hook guarda estado local?',
        tipoResposta: 'multipla_escolha',
        peso: 1,
        obrigatoria: 1,
      });
      cy.wait('@reordenar').its('request.body').should('deep.equal', {
        questionarioId: 'q-100',
        perguntas: [{ id: 'p-1', ordem: 1 }],
      });
      cy.wait('@atualizarOpcao').then(({ request }) => {
        expect(request.url).to.match(/\/opcao\/o-1$/);
        expect(request.body).to.deep.equal({ texto: 'useState', correta: 0 });
      });
      cy.wait('@atualizarOpcao').then(({ request }) => {
        expect(request.url).to.match(/\/opcao\/o-2$/);
        expect(request.body).to.deep.equal({ texto: 'useFetch', correta: 0 });
      });
      cy.wait('@atualizarOpcao').then(({ request }) => {
        expect(request.url).to.match(/\/opcao\/o-1$/);
        expect(request.body).to.deep.equal({ correta: 1 });
      });

      cy.location('pathname').should('eq', '/vagas');
    });

    it('sem mudar "ativo", não chama o PATCH de ativo do questionário', () => {
      stubVagaExistente();
      stubEdicao();
      cy.visitComo('recrutador', '/vagas/v-100/editar');
      cy.wait('@questCompleto');
      secaoQuestionario().findByLabelText('Título *').should('have.value', 'Avaliação técnica inicial');

      cy.findByRole('button', { name: 'Salvar Alterações' }).click();
      cy.wait('@salvarVaga').its('request.body').should('not.have.property', 'status');
      cy.location('pathname').should('eq', '/vagas');
      cy.get('@ativoQuest.all').should('have.length', 0);
    });

    it('pausar na edição vai no PATCH da vaga, antes do questionário', () => {
      stubVagaExistente();
      stubEdicao();
      cy.visitComo('recrutador', '/vagas/v-100/editar');
      cy.wait('@questCompleto');

      escolherNoSelect('Status *', 'Pausada');
      cy.findByRole('button', { name: 'Salvar Alterações' }).click();

      cy.wait('@salvarVaga').its('request.body').should('include', { status: 'pausada' });
      cy.location('pathname').should('eq', '/vagas');
      cy.get('@salvarVaga.all').should('have.length', 1);
    });

    it('ativar na edição só envia o status depois de salvar o questionário', () => {
      cy.fixture(`${FIX}/vaga-existente.json`).then((fx) => {
        cy.intercept(
          { method: 'GET', pathname: '/api/vagas/v-100' },
          { ...fx, data: { ...fx.data, status: 'pausada' } },
        ).as('vaga');
      });
      cy.intercept(
        { method: 'GET', pathname: '/api/questionario', query: { vagaId: 'v-100' } },
        { fixture: `${FIX}/questionarios-da-vaga.json` },
      ).as('questLista');
      cy.intercept({ method: 'GET', pathname: '/api/questionario/q-100' }, { fixture: `${FIX}/questionario-completo.json` }).as('questCompleto');
      stubEdicao();

      const ordem: string[] = [];
      cy.intercept({ method: 'PATCH', pathname: '/api/vagas/v-100' }, (req) => {
        ordem.push(req.body.status ? `vaga:${req.body.status}` : 'vaga');
        req.reply(ok({ _id: 'v-100' }));
      }).as('salvarVaga');
      cy.intercept({ method: 'PUT', pathname: '/api/questionario/q-100' }, (req) => {
        ordem.push('questionario');
        req.reply(ok({ id: 'q-100' }));
      }).as('salvarQuest');

      cy.visitComo('recrutador', '/vagas/v-100/editar');
      cy.wait('@questCompleto');
      escolherNoSelect('Status *', 'Ativa');
      cy.findByRole('button', { name: 'Salvar Alterações' }).click();

      cy.location('pathname').should('eq', '/vagas');
      cy.wrap(ordem).should('deep.equal', ['vaga', 'questionario', 'vaga:ativa']);
    });

    it('vaga encerrada só oferece o status Encerrada', () => {
      cy.fixture(`${FIX}/vaga-existente.json`).then((fx) => {
        cy.intercept(
          { method: 'GET', pathname: '/api/vagas/v-100' },
          { ...fx, data: { ...fx.data, status: 'arquivada' } },
        ).as('vaga');
      });
      cy.visitComo('recrutador', '/vagas/v-100/editar');
      cy.wait('@vaga');

      cy.findByRole('combobox', { name: 'Status *' }).click();
      cy.findAllByRole('option').should('have.length', 1).first().should('have.text', 'Encerrada');
    });

    it('questionário já respondido trava as perguntas e salva só o cabeçalho', () => {
      cy.fixture(`${FIX}/questionario-completo.json`).then((fx) => {
        cy.intercept(
          { method: 'GET', pathname: '/api/questionario/q-100' },
          { ...fx, data: { ...fx.data, respondido: true } },
        ).as('questCompleto');
      });
      cy.intercept({ method: 'GET', pathname: '/api/vagas/v-100' }, { fixture: `${FIX}/vaga-existente.json` }).as('vaga');
      cy.intercept(
        { method: 'GET', pathname: '/api/questionario', query: { vagaId: 'v-100' } },
        { fixture: `${FIX}/questionarios-da-vaga.json` },
      ).as('questLista');
      stubEdicao();
      cy.visitComo('recrutador', '/vagas/v-100/editar');
      cy.wait('@questCompleto');

      cy.findByRole('note').should('contain.text', 'Candidatos já responderam a este questionário');
      cy.findByRole('button', { name: /Adicionar Pergunta/ }).should('be.disabled');
      secaoQuestionario().find('fieldset').should('be.disabled');

      secaoQuestionario().findByLabelText('Título *').clear().type('Avaliação revisada');
      cy.findByRole('button', { name: 'Salvar Alterações' }).click();

      cy.wait('@salvarQuest').its('request.body').should('deep.equal', {
        titulo: 'Avaliação revisada',
        instrucoes: 'Responda com calma.',
      });
      cy.location('pathname').should('eq', '/vagas');
      cy.get('@salvarPergunta.all').should('have.length', 0);
      cy.get('@reordenar.all').should('have.length', 0);
      cy.get('@atualizarOpcao.all').should('have.length', 0);
    });

    it('questionário carregado sem opção correta bloqueia o envio', () => {
      stubVagaExistente(`${FIX}/questionario-sem-correta.json`);
      stubEdicao();
      cy.visitComo('recrutador', '/vagas/v-100/editar');
      cy.wait('@questCompleto');
      cy.findAllByRole('radio', { name: 'Marcar como correta' }).should('have.length', 2).and('not.be.checked');

      cy.findByRole('button', { name: 'Salvar Alterações' }).click();
      cy.findByRole('alert').should('contain.text', 'Pergunta 1: marque exatamente uma opção correta.');
      cy.location('pathname').should('eq', '/vagas/v-100/editar');
      cy.get('@salvarVaga.all').should('have.length', 0);
    });

    it('erro da API ao salvar mostra o banner e continua na edição', () => {
      stubVagaExistente();
      stubEdicao();
      cy.intercept(
        { method: 'PATCH', pathname: '/api/vagas/v-100' },
        { statusCode: 422, body: { success: false, message: 'A soma dos pesos não pode passar de 100%.' } },
      ).as('salvarVagaErro');
      cy.visitComo('recrutador', '/vagas/v-100/editar');
      cy.wait('@questCompleto');
      secaoQuestionario().findByLabelText('Título *').should('have.value', 'Avaliação técnica inicial');

      cy.findByRole('button', { name: 'Salvar Alterações' }).click();
      cy.wait('@salvarVagaErro');
      cy.findByRole('alert').should('contain.text', 'A soma dos pesos não pode passar de 100%.');
      cy.location('pathname').should('eq', '/vagas/v-100/editar');
      cy.findByRole('button', { name: 'Salvar Alterações' }).should('be.enabled');
      cy.get('@salvarQuest.all').should('have.length', 0);
    });

    it('vaga inexistente mostra a mensagem da API em vez do formulário', () => {
      cy.intercept(
        { method: 'GET', pathname: '/api/vagas/v-404' },
        { statusCode: 404, body: { success: false, message: 'Vaga não encontrada' } },
      ).as('vaga404');
      cy.visitComo('recrutador', '/vagas/v-404/editar');
      cy.wait('@vaga404');
      cy.findByText('Vaga não encontrada').should('be.visible');
      cy.findByRole('button', { name: 'Salvar Alterações' }).should('not.exist');
    });
  });

  describe('duplicar', () => {
    it('pré-preenche a partir da vaga de origem e cria uma vaga nova com questionário próprio', () => {
      stubVagaExistente();
      stubCriacao();
      cy.visitComo('recrutador', '/vagas/v-100/duplicar');
      cy.wait(['@vaga', '@questCompleto']);

      cy.findByRole('heading', { name: 'Duplicar Vaga' }).should('be.visible');
      cy.findByText('Revise a cópia antes de salvar. Ela vira uma vaga nova, sem candidaturas.').should('be.visible');
      secaoDados().within(() => {
        cy.findByLabelText('Título *').should('have.value', 'Desenvolvedor Front-end (cópia)');
        cy.findByLabelText('Descrição *').should('have.value', 'Construir interfaces em React para o produto principal.');
      });
      cy.findByRole('combobox', { name: 'Área *' }).should('contain.text', 'TI');
      cy.findByLabelText('Nome *').should('have.value', 'React');
      secaoQuestionario().within(() => {
        cy.findByLabelText('Título *').should('have.value', 'Avaliação técnica inicial');
        cy.findByPlaceholderText('Opção 1').should('have.value', 'useState');
      });

      criarVaga();

      cy.wait('@criarVaga').its('request.body').should('deep.equal', {
        titulo: 'Desenvolvedor Front-end (cópia)',
        area: 'TI',
        descricao: 'Construir interfaces em React para o produto principal.',
        requisitos_gerais: 'Experiência com TypeScript e testes.',
        // Sem _id: o servidor gera os critérios da cópia.
        criterio_vaga: [
          {
            nome: 'React',
            tipo_criterio: 'skill_tecnica',
            peso_percentual: 40,
            obrigatorio: false,
            descricao: 'Hooks e componentização',
          },
        ],
      });
      cy.wait('@questExistente');
      cy.wait('@criarQuest').its('request.body').should('deep.equal', {
        vagaId: 'v-nova',
        criadoPor: 'Rita Recrutadora',
        titulo: 'Avaliação técnica inicial',
        instrucoes: 'Responda com calma.',
        ativo: 1,
      });
      cy.wait('@criarPergunta').its('request.body').should('include', {
        questionarioId: 'q-nova',
        enunciado: 'Qual hook guarda estado local?',
      });
      cy.wait('@criarOpcao').its('request.body').should('deep.equal', { texto: 'useState', correta: 0, ordem: 1 });
      cy.wait('@criarOpcao').its('request.body').should('deep.equal', { texto: 'useFetch', correta: 0, ordem: 2 });
      cy.wait('@atualizarOpcao').then(({ request }) => {
        expect(request.url).to.match(/\/opcao\/o-nova-1$/);
        expect(request.body).to.deep.equal({ correta: 1 });
      });
      cy.wait('@patchVagaNova').its('request.body').should('deep.equal', { status: 'ativa' });
      cy.location('pathname').should('eq', '/vagas');
    });

    it('se o questionário de origem falhar, avisa e começa um questionário vazio', () => {
      stubVagaExistente();
      stubCriacao();
      cy.intercept(
        { method: 'GET', pathname: '/api/questionario', query: { vagaId: 'v-100' } },
        { statusCode: 500, body: { success: false, message: 'Erro interno' } },
      ).as('questListaErro');
      cy.visitComo('recrutador', '/vagas/v-100/duplicar');
      cy.wait(['@vaga', '@questListaErro']);

      cy.findByRole('status').should(
        'contain.text',
        'Não foi possível copiar o questionário da vaga original. Monte um novo antes de salvar.',
      );
      secaoDados().findByLabelText('Título *').should('have.value', 'Desenvolvedor Front-end (cópia)');
      secaoQuestionario().within(() => {
        cy.findByLabelText('Título *').should('have.value', '');
        cy.findByText('Adicione ao menos uma pergunta.').should('be.visible');
      });

      criarVaga();
      deveBloquearCom('O título do questionário deve ter ao menos 3 caracteres.', '/vagas/v-100/duplicar');
    });
  });
});

export {};
