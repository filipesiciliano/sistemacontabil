import { PRODUCT_NAME } from './product-name.js';

/**
 * Single pt-BR dictionary for every user-facing text. Language must be cooperative:
 * "revisar o tratamento desta receita", never "erro do contador".
 */
export const ptBR = {
  app: {
    productName: PRODUCT_NAME,
    tagline: 'Clareza sobre os tributos da sua empresa, com memória de cálculo.',
  },
  home: {
    title: 'Fundação do projeto',
    description:
      'Esqueleto da plataforma. As funcionalidades do POC serão construídas sobre esta base.',
  },
  coverage: {
    covered: 'Atendido',
    partially_covered: 'Atendido parcialmente',
    specialist_review_required: 'Revisão especializada necessária',
  },
} as const;

export type Dictionary = typeof ptBR;
