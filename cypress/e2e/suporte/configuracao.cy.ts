import configuracao from '../../fixtures/suporte/configuracao.json';

const URL_CONFIG = '**/api/configuracao-integracao';


function definirRange(rotulo: RegExp, valor: number) {
  cy.findByLabelText(rotulo).then(($el) => {
    const el = $el[0] as HTMLInputElement;
    const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value')!.set!;
    setter.call(el, String(valor));
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

describe('Suporte — configuração da triagem', () => {
  it('carrega a configuração salva e não expõe o valor da chave de API', () => {
    cy.stubJson('GET', URL_CONFIG, 'suporte/configuracao.json', 'getConfig');
    cy.visitComo('suporte', '/suporte/configuracao');
    cy.wait('@getConfig');

    cy.findByRole('heading', { name: 'Configuração da triagem' }).should('be.visible');
    cy.findByLabelText(/Limiar de compatibilidade: 70%/).should('have.value', '0.7');
    cy.findByLabelText(/Temperatura: 0\.20/).should('have.value', '0.2');
    cy.findByLabelText('Triagem automática ativa').should('be.checked');
    cy.findByLabelText('Modelo do degrau 1').should('have.value', 'gemini-3.1-flash-lite');
    cy.findByLabelText('Modelo do degrau 2').should('have.value', 'gemini-2.5-flash');
    cy.findByRole('combobox', { name: 'Provedor de IA' }).should('contain.text', 'Google Gemini');

    cy.contains('li', 'Google Gemini:').should('contain.text', 'configurada');
    cy.get('input[type="password"]').should('not.exist');
    cy.contains('Cascata salva:').within(() => {
      cy.get('code').eq(0).should('have.text', 'gemini-3.1-flash-lite');
      cy.get('code').eq(1).should('have.text', 'gemini-2.5-flash');
    });

    cy.findByRole('button', { name: 'Subir o degrau 1' }).should('be.disabled');
    cy.findByRole('button', { name: 'Subir o degrau 2' }).should('be.enabled');
  });

  it('indica chave ausente quando o provedor não tem chave configurada', () => {
    cy.stubJson('GET', URL_CONFIG, {
      ...configuracao,
      data: { ...configuracao.data, chavesConfiguradas: { gemini: false } },
    });
    cy.visitComo('suporte', '/suporte/configuracao');

    cy.contains('li', 'Google Gemini:').should('contain.text', 'não configurada');
    cy.findByRole('combobox', { name: 'Provedor de IA' }).click();
    cy.findByRole('option', { name: /chave ausente/ }).should('have.attr', 'aria-disabled', 'true');
  });

  it('salva as alterações com o payload completo e mostra confirmação', () => {
    const atualizada = {
      ...configuracao.data,
      limiteCompatibilidade: 0.85,
      temperatura: 0.5,
      ativo: false,
      cascata: ['gemini-2.5-flash', 'gemini-3.1-flash-lite', 'gemini-2.0-pro'],
    };
    cy.stubJson('GET', URL_CONFIG, 'suporte/configuracao.json', 'getConfig');
    cy.stubJson('PATCH', URL_CONFIG, { success: true, data: atualizada }, 'patchConfig');
    cy.visitComo('suporte', '/suporte/configuracao');
    cy.wait('@getConfig');

    cy.findByLabelText('Modelo do degrau 2').should('have.value', 'gemini-2.5-flash');

    cy.findByRole('button', { name: 'Subir o degrau 2' }).click();
    cy.findByLabelText('Modelo do degrau 1').should('have.value', 'gemini-2.5-flash');

    cy.findByRole('button', { name: /Adicionar degrau/ }).click();
    cy.findByLabelText('Modelo do degrau 3').type('  gemini-2.0-pro  ');
    cy.findByRole('button', { name: /Adicionar degrau/ }).click();
    cy.findByLabelText('Modelo do degrau 4').should('have.value', '');

    cy.findByRole('button', { name: /Adicionar degrau/ }).should('be.disabled');

    definirRange(/Limiar de compatibilidade/, 0.85);
    cy.findByLabelText(/Limiar de compatibilidade: 85%/).should('exist');
    definirRange(/Temperatura/, 0.5);
    cy.findByLabelText(/Temperatura: 0\.50/).should('exist');
    cy.findByLabelText('Triagem automática ativa').uncheck();
    cy.findByLabelText('Modelo do degrau 3').should('have.value', '  gemini-2.0-pro  ');

    cy.findByRole('button', { name: 'Salvar' }).click();

    cy.wait('@patchConfig').its('request.body').should('deep.equal', {
      limiteCompatibilidade: 0.85,
      provedor: 'gemini',
      cascata: ['gemini-2.5-flash', 'gemini-3.1-flash-lite', 'gemini-2.0-pro'],
      temperatura: 0.5,
      ativo: false,
    });

    cy.findByText('Configuração salva.').should('be.visible');
    cy.findByLabelText('Modelo do degrau 4').should('not.exist');
    cy.contains('Cascata salva:').within(() => {
      cy.get('code').should('have.length', 3);
      cy.get('code').eq(0).should('have.text', 'gemini-2.5-flash');
    });
  });

  it('não deixa remover o último degrau da cascata', () => {
    cy.stubJson('GET', URL_CONFIG, 'suporte/configuracao.json', 'getConfig');
    cy.visitComo('suporte', '/suporte/configuracao');
    cy.wait('@getConfig');

    cy.findByRole('button', { name: 'Remover o degrau 2' }).click();
    cy.findByLabelText('Modelo do degrau 2').should('not.exist');
    cy.findByRole('button', { name: 'Remover o degrau 1' }).should('be.disabled');
  });

  it('mostra a mensagem da API quando o salvamento falha', () => {
    cy.stubJson('GET', URL_CONFIG, 'suporte/configuracao.json', 'getConfig');
    cy.stubJson(
      'PATCH',
      URL_CONFIG,
      { success: false, message: 'Modelo repetido na cascata.' },
      'patchConfig',
      400,
    );
    cy.visitComo('suporte', '/suporte/configuracao');
    cy.wait('@getConfig');

    cy.findByLabelText('Modelo do degrau 2').clear().type('gemini-3.1-flash-lite');
    cy.findByRole('button', { name: 'Salvar' }).click();
    cy.wait('@patchConfig')
      .its('request.body.cascata')
      .should('deep.equal', ['gemini-3.1-flash-lite', 'gemini-3.1-flash-lite']);

    cy.findByText('Modelo repetido na cascata.').should('be.visible');
    cy.findByText('Configuração salva.').should('not.exist');
    cy.findByLabelText('Modelo do degrau 2').should('have.value', 'gemini-3.1-flash-lite');
    cy.findByRole('button', { name: 'Salvar' }).should('be.enabled');
  });

  it('mostra erro quando a configuração não carrega', () => {
    cy.stubJson('GET', URL_CONFIG, { success: false, message: 'boom' }, 'getConfig', 500);
    cy.visitComo('suporte', '/suporte/configuracao');
    cy.wait('@getConfig');

    cy.findByText('Falha ao carregar a configuração.').should('be.visible');
    cy.findByRole('button', { name: 'Salvar' }).should('not.exist');
  });
});
