/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /** Catch-all: toda chamada `**\/api/**` sem stub recebe `{ success: true, data: [] }`. */
    stubApi(): Chainable<void>;
    /** Intercept com alias; `resposta` é nome de fixture (`x.json`) ou o corpo. */
    stubJson(
      metodo: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
      url: string,
      resposta: unknown,
      alias?: string,
      statusCode?: number,
    ): Chainable<void>;
    /**
     * Abre `url` já autenticado como `papel` (storage + stub de `GET /api/me`).
     * Registre os stubs do teste antes desta chamada.
     */
    visitComo(papel: 'recrutador' | 'candidato' | 'suporte' | 'administrador', url: string): Chainable<void>;
  }
}
