export const NAV_ITEMS = [
  { label: 'Início',     path: '/dashboard'  },
  { label: 'Vagas',      path: '/vagas'      },
  { label: 'Candidatos', path: '/candidatos' },
  { label: 'Relatórios', path: '/relatorios' },
] as const;

export const CANDIDATO_NAV_ITEMS = [
  { label: 'Início',        path: '/candidato'           },
  { label: 'Vagas',         path: '/candidato/vagas'     },
  { label: 'Candidaturas',  path: '/minhas-candidaturas' },
  { label: 'Meu Perfil',    path: '/perfil'              },
] as const;
