# CLAUDE.md

Convenções e princípios do repositório. Valem para qualquer pessoa ou agente que altere o código.

## Produto

Plataforma de inteligência tributária para empresas do Simples Nacional (fora do SIMEI). Ela confere a apuração, identifica oportunidades e projeta tributos. O diferencial é **alertar durante a competência, enquanto ainda dá para agir** (D1).

- Fonte da verdade: `docs/00-escopo-stakeholders.md`. **Nunca altere este arquivo.**
- Decisões: `docs/04-registro-de-decisoes.md` (D1–D25). Decisões em aberto: **[DECISÃO PENDENTE]** em `docs/02-arquitetura-proposta.md`.
- **Nome do produto não definido (D11).** Não escreva nome de produto em código, pacotes, infraestrutura ou documentação. Use o escopo `@platform/*`, o prefixo `platform` na AWS e a constante `PRODUCT_NAME` (`apps/web/src/i18n/product-name.ts`, `PLACEHOLDER`). "Crivo" é o escritório de um stakeholder, não o produto.

## Regras de trabalho

- Diagnóstico antes de implementação.
- **Não tome decisões fiscais ou de produto.** Registre como pergunta (doc 01), **[A CONFIRMAR]** ou **[DECISÃO PENDENTE]**.
- **Nunca implemente alíquotas, faixas, parcelas a deduzir, limites ou repartições de memória.** Enquanto não houver fonte, use `placeholder('PLACEHOLDER_...', '...')` no catálogo. Os valores são transcritos da fonte oficial (com documento, seção, vigência e link) e conferidos pelos responsáveis tributários antes da aprovação (D3, D25).

## Princípios de domínio (inegociáveis)

1. **Motor determinístico e puro** (`packages/tax-engine`): sem I/O, sem relógio, sem aleatoriedade e independente da interface. **IA nunca produz valor de imposto.**
2. **Diagnóstico de cobertura antes de qualquer cálculo:** `covered` | `partially_covered` | `specialist_review_required`. Operações fora do recorte (Anexo IV, exportação, retenções, ST, monofásicos, mercadorias) nunca são calculadas como se estivessem cobertas. Ver `docs/03-matriz-cobertura.md`.
3. **Ausência de dado não é zero.** Use `DataPoint<T>` = `Missing` | `Informed<T>` | `Confirmed<T>`. Dado obrigatório ausente impede a conclusão definitiva.
4. **Precisão decimal.** Dinheiro é `Money`, e alíquota é `Rate` (fração: 28% = `0.28`), ambos sobre o `Decimal` exportado por `@platform/shared-types`. Nunca use `number` para dinheiro. No Postgres, use `numeric`, lido como string. Todo arredondamento é explícito (`applyRounding` com `RoundingPolicy`), documentado e testado.
5. **Toda regra tem:** identificação, fonte oficial, vigência, abrangência, responsável, testes (casos de referência) e status de aprovação. As regras são selecionadas pela vigência da competência (`selectRuleVersion`).
6. **Regras como código (D9):** uma nova versão é um **novo arquivo** (`*.v2.ts`), nunca a edição de uma versão publicada. A aprovação acontece no PR e fica registrada em `approval`. O CI roda `validateCatalog`.
7. **Cada cálculo grava** um snapshot imutável: entradas, versões das regras, versão do motor e memória de cálculo passo a passo. Mudar regras nunca altera análises históricas.
8. **Postergação** de pagamento é benefício de caixa, separado de redução de tributo.
9. **Oportunidades** são `potential` → `validated` → `realized`. Projeções explicitam premissas e horizonte e **nunca** multiplicam a economia mensal por 12: cada competência futura é recalculada.
10. **Multi-estabelecimento:** consolidar no CNPJ raiz quando a regra exigir (por exemplo, RBT12), sem tratar filial como empresa independente.
11. **Linguagem cooperativa** na interface: "revisar o tratamento desta receita", nunca "erro do contador".

## Stack

- TypeScript 100%, `strict: true` e flags extras (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`…; ver `tsconfig.base.json`).
- Frontend: React, Vite e TanStack Query, com layout responsivo (desktop e celular).
- Backend: Node.js em AWS Lambda, num monólito modular. PostgreSQL (Aurora Serverless v2) com **Kysely** (proposta, ver doc 02). Cognito (MFA adiado para depois do POC, D18), SQS e S3.
- Infra: AWS CDK em TypeScript (`infra/`).
- Validação nas bordas com Zod. Tipos nominais via `.brand<...>()` do Zod: `Cnpj`, `Cnae`, `Competence` (`AAAA-MM`), `Money`, `Rate`, `CompanyId`…

## Estrutura e fronteiras

```
apps/web                 só importa @platform/shared-types
apps/api/src/modules/<m> identity, companies, periods, coverage, reconciliation,
                         alerts, opportunities, collaboration, projections
                         index.ts (API pública) · domain/ · application/ · infrastructure/ · http/
apps/api/src/platform    núcleo técnico (banco, HTTP, registro de módulos)
packages/shared-types    tipos nominais e transversais (sem dependências internas)
packages/rules-catalog   regras como código → shared-types
packages/tax-engine      motor puro → shared-types, rules-catalog
infra                    CDK (sem dependências internas)
```

Verificado por lint (`eslint-plugin-boundaries` e `no-restricted-*`):

- Um módulo só acessa outro por `modules/<m>/index.ts`, e os pacotes só são acessados por `src/index.ts`.
- `domain/` não importa `infrastructure/`, `http/` nem bibliotecas de I/O.
- Em `packages/*/src`: proibido importar `node:*`, `pg`, `kysely`, `@aws-sdk/*` e React, e proibido usar `fetch`, `process`, `console`, `Date.now()`, `new Date()` e `Math.random()`.
- `decimal.js` só é importado em `packages/shared-types/src/primitives/decimal.ts`.

## Código

- **Proibido:** `any`, `@ts-ignore`, `@ts-nocheck` e `as`. Exceção a `as` só com `// eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- <justificativa>`. `as const` é permitido. `@ts-expect-error` só com descrição.
- **Um conceito por arquivo.** Nomes de arquivo em `kebab-case`. Imports relativos com extensão `.js`.
- Código, identificadores e comentários em **inglês**. Comente só a lógica realmente complexa e as decisões de domínio.
- **UI em pt-BR**, com todos os textos no dicionário único `apps/web/src/i18n/pt-br.ts`.
- Datas de negócio são competências (`Competence`) ou strings ISO. O "agora" é sempre recebido como parâmetro no domínio.

## Testes

- `pnpm lint && pnpm typecheck && pnpm test` precisa passar antes de qualquer PR.
- **Motor:** orientado a casos de referência em `packages/tax-engine/test/reference-cases/` (formato em `docs/07-casos-de-referencia.md`).
- **API:** integração com Postgres real via Testcontainers (`pnpm test:integration`, requer Docker; `POSTGRES_TEST_IMAGE` permite usar um espelho). Cobrir isolamento entre empresas e as permissões dos quatro perfis.
- **Web:** testes de componente com Vitest e Testing Library.
- **Infra:** asserções de template CDK.

## Comandos

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm test:integration
pnpm --filter @platform/web dev
pnpm --filter @platform/infra synth
```
