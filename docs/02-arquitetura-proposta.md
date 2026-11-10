# 02 · Arquitetura proposta

> Base: escopo §7 e §8, decisões D1–D24 ([`04-registro-de-decisoes.md`](04-registro-de-decisoes.md)) e a stack definida no briefing. Itens marcados **[DECISÃO PENDENTE]** trazem opções e uma recomendação, mas só viram decisão depois do debate.

## 1. Visão geral

Monólito modular (escopo §7) em TypeScript, com o motor tributário isolado como biblioteca pura.

```
               ┌──────────────────────────────┐
  Navegador ──▶│ apps/web (React, Vite,       │  S3 + CloudFront
  (desktop e   │ TanStack Query)              │
   celular)    └──────────────┬───────────────┘
                              │ HTTPS + JWT (Cognito)
                              ▼
               ┌──────────────────────────────┐
               │ API Gateway (HTTP API)       │
               └──────────────┬───────────────┘
                              ▼
   ┌──────────────────────────────────────────────────────────┐
   │ apps/api · Lambda (Node.js) · monólito modular           │
   │  identity · companies · periods · coverage ·             │
   │  reconciliation · alerts · opportunities ·               │
   │  collaboration · projections                             │
   │            │ usa (chamadas puras, sem I/O)               │
   │            ▼                                             │
   │  packages/tax-engine ◀── packages/rules-catalog          │
   │            ▲                     ▲                       │
   │            └── packages/shared-types ──┘                 │
   └───────┬──────────────────┬───────────────────┬───────────┘
           ▼                  ▼                   ▼
   Aurora Serverless v2    SQS (+ DLQ)          S3 (evidências)
   PostgreSQL
```

## 2. Estrutura do monorepo

```
apps/
  web/                  Interface responsiva. Só importa @platform/shared-types.
  api/
    src/entrypoints/    Handlers Lambda (HTTP e, depois, filas).
    src/platform/       Núcleo técnico compartilhado: banco, HTTP, registro de módulos.
    src/modules/<m>/    Um módulo por contexto: index.ts (API pública), domain/,
                        application/, infrastructure/, http/.
packages/
  shared-types/         Tipos nominais (Cnpj, Cnae, Competence, Money, Rate),
                        DataPoint (Missing/Informed/Confirmed), CoverageStatus, Role.
  rules-catalog/        Regras como código, versionadas por vigência (D9).
  tax-engine/           Motor determinístico e puro; casos de referência em test/.
infra/                  AWS CDK em TypeScript. Prefixo de recursos: `platform` (D11).
docs/                   Escopo, análise, arquitetura, matriz, decisões, alertas, roadmap, casos.
```

### 2.1 Fronteiras verificadas por lint

`eslint-plugin-boundaries`, configurado em `eslint.config.js`:

| De                           | Pode importar                                 |
| ---------------------------- | --------------------------------------------- |
| `shared-types`               | nada do monorepo (só `zod` e `decimal.js`)    |
| `rules-catalog`              | `shared-types`                                |
| `tax-engine`                 | `shared-types`, `rules-catalog`               |
| `api` (módulos e plataforma) | `shared-types`, `rules-catalog`, `tax-engine` |
| `web`                        | `shared-types`                                |
| `infra`                      | nada do monorepo                              |

Regras adicionais:

- **Ponto de entrada:** um módulo da API só é acessado por outro através de `modules/<m>/index.ts`; os pacotes, só por `src/index.ts`.
- **Pureza:** em `packages/*/src` é proibido importar `node:*`, `pg`, `kysely`, `@aws-sdk/*`, React e similares, e usar `fetch`, `process`, `console`, `Date.now()`, `new Date()` sem argumentos e `Math.random()`.
- **Camadas:** `modules/*/domain/**` não importa `infrastructure/`, `http/` nem bibliotecas de I/O.
- **Decimal:** `decimal.js` só é importado em `shared-types`; o resto usa o `Decimal` configurado exportado pelo pacote.
- **Tipagem:** `any`, `@ts-ignore` e `as` são proibidos. Uma exceção a `as` exige `eslint-disable-next-line` com justificativa (regra `require-description`). `as const` é permitido.
- Dependências não declaradas entre pacotes falham também no `typecheck`, por causa do isolamento do pnpm.

## 3. Motor tributário e regras como código

### 3.1 Motor (`packages/tax-engine`)

- Funções puras: recebem entradas já validadas, regras selecionadas e o "agora" como parâmetro. Não leem banco, relógio nem ambiente.
- A ordem é sempre esta: **diagnóstico de cobertura → validação de dados obrigatórios → cálculo → memória**.
- O resultado inclui `CoverageDiagnosis`, `CalculationMemory` (passos com fórmula, entradas, resultado, `ruleRef` e arredondamento) e o valor calculado. A API encapsula tudo num `CalculationSnapshot`.
- IA nunca produz valor de imposto (escopo §5.2). Ela pode, no futuro, extrair documentos (sempre com confirmação) e explicar resultados.

### 3.2 Catálogo de regras (`packages/rules-catalog`), conforme D9

Cada `RuleDefinition` contém `id`, `version`, `officialSource`, `validity` (`from`/`to` em competências), `scope`, `owner`, `referenceCaseIds`, `approval` e `parameters`. Valores ainda sem fonte são `Placeholder` (chave `PLACEHOLDER_*`).

Fluxo de publicação:

1. A alteração de regra é um PR que **adiciona uma nova versão**. Versões publicadas nunca são editadas.
2. O PR traz a fonte oficial, os parâmetros e os casos de referência que exercitam a regra.
3. O CI roda `validateCatalog`: uma regra `approved` não pode ter placeholder, precisa de aprovadores, data e casos, e não pode ter vigência sobreposta com outra versão aprovada do mesmo `id`.
4. Os responsáveis tributários aprovam o PR, e o status `approved` (com `approvedBy`, `approvedAt` e `pullRequest`) é registrado na própria regra.
5. O merge e o deploy publicam a regra. A seleção é feita por `selectRuleVersion(versions, competence)`, que só escolhe versões aprovadas e vigentes.

**[DECISÃO PENDENTE] Proteção do fluxo de aprovação.** Opções: (a) CODEOWNERS em `packages/rules-catalog/**` e `packages/tax-engine/test/reference-cases/**` exigindo revisão dos stakeholders; (b) apenas convenção. Recomendação: (a). Requer que os stakeholders tenham contas no GitHub.

### 3.3 IBS/CBS (estrutura por vigência)

O modelo de regra já é selecionado por vigência e escopo. IBS/CBS entram futuramente como novas regras e novos tributos na repartição, com cobertura explícita (`partially_covered` até serem implementados). A decisão da empresa sobre o regime de IBS/CBS deve ser modelada como dado cadastral com vigência.

## 4. Dados

### 4.1 PostgreSQL (Aurora Serverless v2)

- Dinheiro e alíquotas em `numeric` (sem precisão fixa no banco; o arredondamento é responsabilidade do domínio). O driver `pg` devolve `numeric` como string, e o repositório converte para `Decimal`. Isso está configurado explicitamente em `create-database.ts`.
- Todas as tabelas de negócio têm `company_id`. Estabelecimentos referenciam a empresa (CNPJ raiz).
- **Snapshots imutáveis:** `calculation_snapshots` é append-only (sem `UPDATE`/`DELETE` para o papel da aplicação, reforçado por trigger). Guarda as entradas em `jsonb`, as versões das regras, a memória e a versão do motor.
- Dados informados guardam o estado (`missing`/`informed`/`confirmed`), a origem, quem confirmou e quando.
- Trilha de auditoria das alterações (escopo §8).

### 4.2 Drizzle × Kysely: proposta Kysely

| Critério                                                   | Kysely                                                | Drizzle                              |
| ---------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------ |
| Modelo                                                     | Query builder tipado, SQL explícito                   | ORM leve, schema como código         |
| `numeric`                                                  | String por padrão, conversão explícita no repositório | String por padrão (`mode: 'string'`) |
| Migrações                                                  | Escritas à mão (SQL/TS), revisáveis linha a linha     | Geradas por diff (drizzle-kit)       |
| Recursos Postgres (RLS, triggers append-only, `SET LOCAL`) | Naturais, por ser SQL                                 | Exigem SQL manual fora do schema     |
| Tamanho e cold start em Lambda                             | Pequeno, sem geração de código                        | Pequeno                              |
| Curva de aprendizado                                       | Quem sabe SQL lê o código                             | Requer conhecer a API do ORM         |

**Proposta: Kysely.** O domínio depende de garantias que vivem no banco (append-only, isolamento por empresa, possível RLS). Migrações escritas e revisadas à mão são mais auditáveis do que migrações geradas, e o SQL explícito facilita a contabilidade técnica reproduzir consultas. O custo é escrever as migrações manualmente e manter os tipos das tabelas (`DatabaseSchema`) em sincronia. Isso pode ser mitigado com `kysely-codegen` a partir do banco de teste. Kysely já está no esqueleto; trocar agora é barato, caso o debate prefira Drizzle.

### 4.3 [DECISÃO PENDENTE] Isolamento entre empresas

| Opção                                                                               | Prós                     | Contras                                                     |
| ----------------------------------------------------------------------------------- | ------------------------ | ----------------------------------------------------------- |
| A. Filtro por `company_id` na aplicação, com autorização centralizada em `identity` | Simples, fácil de testar | Um esquecimento vaza dados                                  |
| B. Row-Level Security no Postgres com `SET LOCAL app.company_ids` por transação     | Defesa no banco          | Exige transação por requisição e cuidado com pool/RDS Proxy |
| C. A + B                                                                            | Defesa em profundidade   | Mais complexidade                                           |

Recomendação: **C** para as tabelas de negócio, com testes de integração (Testcontainers) que tentam acessar dados de outra empresa com cada um dos quatro perfis.

### 4.4 [DECISÃO PENDENTE] Conexão Lambda → Aurora

Opções: RDS Proxy com `pg`, ou RDS Data API (sem pool, mas com dialeto/driver próprio no Kysely). Recomendação: RDS Proxy com `pg`, mantendo o mesmo driver dos testes com Testcontainers. Também falta definir a versão major do PostgreSQL, que precisa ser a mesma no Aurora e nos testes (o esqueleto usa a 16).

## 5. [DECISÃO PENDENTE] Módulos × funções Lambda

| Opção                                | Descrição                                                                   | Prós                                                      | Contras                                                                                 |
| ------------------------------------ | --------------------------------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| A. Um handler por módulo             | 9 Lambdas HTTP, rotas do API Gateway por prefixo                            | Permissões IAM e escala por módulo; deploy isolado        | Mais cold starts; código compartilhado duplicado em vários bundles; mais infraestrutura |
| B. Um handler com roteamento interno | Uma Lambda HTTP com roteador; módulos registrados em `module-registry.ts`   | Simples; menos cold starts; condiz com o monólito modular | IAM mais amplo; bundle maior; um erro de inicialização derruba tudo                     |
| C. Híbrido                           | Uma Lambda HTTP (B) mais uma Lambda por fila SQS (consumidores assíncronos) | Simplicidade no HTTP e isolamento no processamento pesado | Duas formas de entrada para manter                                                      |

Recomendação: **C**. O código já está organizado para permitir migrar um módulo para uma Lambda própria sem refatoração, porque cada módulo expõe uma API pública e declara suas dependências (`dependsOn`).

## 6. Identidade e autorização

- Cognito User Pool, com o JWT validado no API Gateway. O papel do usuário (`Role`) é global. O acesso a cada empresa é uma **concessão** (grant) guardada no banco, criada por convite e autorizada pela empresa.
- **MFA adiado para depois do POC (D18).** O pool do Cognito nasce com MFA `OPTIONAL` e a aplicação não o exige no POC, para que ele possa ser ligado no MVP sem migrar usuários. Quais perfis o exigirão (P4) fica para essa etapa.
- **[DECISÃO PENDENTE] Matriz de permissões** dos quatro perfis. Proposta inicial:

| Ação                               | Empresário/Gestor | Contabilidade convidada | Consultor tributário   | Administrador                                                     |
| ---------------------------------- | ----------------- | ----------------------- | ---------------------- | ----------------------------------------------------------------- |
| Cadastrar/editar dados da empresa  | ✔                 | ✔ (se autorizada)       | —                      | —                                                                 |
| Confirmar dados                    | ✔                 | ✔ (se autorizada)       | —                      | —                                                                 |
| Ver conferência e alertas          | ✔                 | ✔ (se autorizada)       | ✔ (se autorizado, D17) | —                                                                 |
| Convidar e revogar contabilidade   | ✔                 | —                       | —                      | —                                                                 |
| Registrar revisão e conclusão      | —                 | ✔                       | ✔ (parecer)            | —                                                                 |
| Validar oportunidade               | —                 | ✔                       | ✔                      | —                                                                 |
| Gerenciar usuários e configurações | —                 | —                       | —                      | ✔                                                                 |
| Ver dados de empresas              | só as próprias    | só as autorizadas       | só as autorizadas      | **[DECISÃO PENDENTE]** (proposta: nenhum, salvo suporte auditado) |

As versões das regras são publicadas por PR e deploy (D9). O Administrador as consulta, mas não as edita pela interface.

## 7. Processamento assíncrono e arquivos

- **SQS (com DLQ):** recálculo de alertas a cada lançamento, se o síncrono não bastar; projeções longas; no futuro, importação e extração. Mensagens idempotentes, com `companyId` e `competence`.
- **S3:** evidências (PGDAS-D, DAS, comprovantes), com criptografia, bloqueio de acesso público e versionamento (`infra/src/stacks/evidence-storage-stack.ts`). Com versionamento, apagar um arquivo mantém a versão anterior, então o bucket precisa expirar as versões antigas para a exclusão ser efetiva (a implementar com D24). Os arquivos recebidos da empresa são **apagados depois de processados**; ficam só os dados extraídos e confirmados e os snapshots (D24, que substitui D19). Implementação: exclusão disparada pelo evento de processamento, com uma regra de ciclo de vida curta no bucket como rede de segurança. **[DECISÃO PENDENTE]** O que conta como "processado" e chave KMS própria (CMK) em vez de SSE-S3.

## 8. Frontend

- React, Vite e TanStack Query. Layout responsivo, mobile-first.
- Todo texto vem de `apps/web/src/i18n/pt-br.ts`. O nome exibido vem de `PRODUCT_NAME` (`product-name.ts`, marcado como `PLACEHOLDER`, D11).
- Linguagem cooperativa: "revisar o tratamento desta receita", nunca "erro do contador".
- **[DECISÃO PENDENTE] Contratos da API.** Opções: (a) um pacote `@platform/api-contracts` com schemas Zod compartilhados entre API e web; (b) OpenAPI gerado a partir dos schemas Zod, com cliente gerado. Recomendação: (a) no POC, porque é mais simples e tem tipagem ponta a ponta. A regra de fronteira do `web` passaria a permitir `api-contracts`.
- **[DECISÃO PENDENTE] Roteamento e componentes de UI** (TanStack Router ou React Router; biblioteca de componentes ou CSS próprio).
- Hospedagem: S3 e CloudFront.

## 9. Infraestrutura (CDK)

- Recursos com prefixo `platform-<stage>-` (`infra/src/naming/resource-name.ts`). Nenhum nome de produto (D11).
- Stacks previstas: `network`, `data` (Aurora, RDS Proxy), `auth` (Cognito), `api` (API Gateway e Lambdas), `async` (SQS), `evidence-storage` (já existe), `web` (S3 e CloudFront), `observability`.
- **[DECISÃO PENDENTE]** Contas AWS por ambiente (dev/staging/prod), região (proposta: `sa-east-1`, por residência de dados e LGPD), pipeline de CI/CD (GitHub Actions com OIDC), backups e testes de restauração (escopo §8).
- **[DECISÃO PENDENTE]** Observabilidade: logs estruturados (por exemplo, AWS Lambda Powertools), métricas e alarmes. Nunca registrar dados pessoais nem valores fiscais identificáveis em log.

## 10. Testes

| Camada           | Estratégia                                                                                                                | Comando                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| Motor            | Orientado a casos de referência (`packages/tax-engine/test/reference-cases/*.json`, validados por `ReferenceCaseSchema`). | `pnpm test`             |
| Catálogo         | Integridade de governança (`validateCatalog`), seleção por vigência.                                                      | `pnpm test`             |
| API (unitário)   | Handlers e registro de módulos.                                                                                           | `pnpm test`             |
| API (integração) | Postgres real com Testcontainers, isolamento entre empresas e permissões dos quatro perfis. Requer Docker.                | `pnpm test:integration` |
| Web              | Componentes com Vitest e Testing Library (jsdom).                                                                         | `pnpm test`             |
| Infra            | Asserções de template CDK.                                                                                                | `pnpm test`             |

Se o Docker Hub estiver inacessível, use `POSTGRES_TEST_IMAGE` para apontar para um espelho.

## 11. Resumo das decisões pendentes

| #   | Tema                                     | Recomendação                                                                                                         |
| --- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| P1  | Módulos × Lambdas                        | C (HTTP único e workers por fila)                                                                                    |
| P2  | Isolamento entre empresas                | Aplicação e RLS                                                                                                      |
| P3  | Conexão Lambda → Aurora                  | RDS Proxy com `pg`                                                                                                   |
| P4  | MFA por perfil                           | Adiado para o MVP (D18)                                                                                              |
| P5  | Matriz de permissões                     | Proposta na seção 6                                                                                                  |
| P6  | Contratos API ↔ web                      | Pacote `@platform/api-contracts` com Zod                                                                             |
| P7  | Proteção do fluxo de aprovação de regras | CODEOWNERS                                                                                                           |
| P8  | Arquivos e CMK                           | Descartar após o processamento, guardando só os dados extraídos (D24); o que conta como "processado" e CMK em aberto |
| P9  | Contas, região, CI/CD, observabilidade   | `sa-east-1`, GitHub Actions com OIDC                                                                                 |
| P10 | Versão do PostgreSQL                     | Igual no Aurora e nos testes                                                                                         |
| P11 | Roteamento e UI do web                   | A definir                                                                                                            |
