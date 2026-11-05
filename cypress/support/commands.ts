import usuarios from '../fixtures/usuarios.json';

export type Papel = keyof typeof usuarios;

type Metodo = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Rede de segurança: qualquer chamada sem stub específico recebe um envelope
// vazio em vez de bater numa API que não está rodando. Registrado no
// beforeEach global (support/e2e.ts) para ser sempre o intercept mais antigo:
// no Cypress o intercept mais recente tem prioridade.
Cypress.Commands.add('stubApi', () => {
  cy.intercept('**/api/**', { statusCode: 200, body: { success: true, data: [] } });
});

// Atalho de intercept. `resposta` é o nome de uma fixture (string terminada
// em .json) ou o próprio corpo da resposta.
Cypress.Commands.add(
  'stubJson',
  (metodo: Metodo, url: string, resposta: unknown, alias?: string, statusCode = 200) => {
    const body =
      typeof resposta === 'string' && resposta.endsWith('.json')
        ? { statusCode, fixture: resposta }
        : { statusCode, body: resposta as object };
    const chain = cy.intercept(metodo, url, body);
    if (alias) chain.as(alias);
  },
);

// Sessão injetada direto no storage, como o login deixa: o fluxo de login pela
// UI tem spec própria (auth/login.cy.ts).
Cypress.Commands.add('visitComo', (papel: Papel, url: string) => {
  const user = usuarios[papel];
  cy.intercept('GET', '**/api/me', { statusCode: 200, body: { success: true, data: user } }).as('me');
  cy.visit(url, {
    onBeforeLoad(win) {
      win.localStorage.setItem('auth_token', `token-${papel}`);
      win.localStorage.setItem('auth_user', JSON.stringify(user));
    },
  });
});

export { usuarios };
