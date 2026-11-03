# 04 · Registro de decisões

> Formato ADR resumido: contexto, decisão e consequências. Decisões novas são acrescentadas ao fim, com o próximo número. Uma decisão nunca é editada para mudar de sentido: ela é **substituída** por outra, que referencia a anterior. Decisões ainda em debate ficam como **[DECISÃO PENDENTE]** em [`02-arquitetura-proposta.md`](02-arquitetura-proposta.md) até serem aprovadas.

| #   | Título                                                                     | Status                      |
| --- | -------------------------------------------------------------------------- | --------------------------- |
| D1  | Alerta preditivo intra-mês no POC, começando pelo Fator R                  | Aprovada (adição ao escopo) |
| D2  | NCM/CFOP e mercadorias fora do POC e do MVP                                | Aprovada                    |
| D3  | Stakeholders como responsáveis tributários e fonte dos casos de referência | Aprovada                    |
| D4  | Recorte do POC                                                             | Aprovada                    |
| D5  | PGDAS-D digitado manualmente no POC                                        | Aprovada                    |
| D6  | Planilha padrão de importação como dependência bloqueante                  | Aprovada                    |
| D7  | Efeito do pró-labore na PF e encargos como estimativa com premissas        | Aprovada                    |
| D8  | Quatro perfis no POC                                                       | Aprovada                    |
| D9  | Regras como código, aprovadas via PR                                       | Aprovada                    |
| D10 | Critério de sucesso do POC: aprovação dos stakeholders                     | Aprovada                    |
| D11 | Nome da plataforma não definido; identificadores neutros                   | Aprovada                    |

---

## D1 · Alerta preditivo intra-mês no POC, começando pelo Fator R

**Contexto.** As ferramentas de mercado (por exemplo, o e-Simples, módulo do e-Auditoria) auditam o mês fechado, quando já não dá para agir. O escopo original (`00-escopo-stakeholders.md`) descreve conferência pós-apuração e projeção, mas **não** descreve alerta durante a competência. O caso mais claro de ação possível dentro do mês é o Fator R: um pequeno valor de folha ou pró-labore pode definir entre os Anexos III e V.

**Decisão.** O POC inclui alerta preditivo intra-mês, começando pelo Fator R. A jornada passa a admitir lançamentos parciais na competência em aberto, com acompanhamento contínuo, além da conferência pós-apuração. **É uma adição aprovada ao escopo original.**

**Consequências.**

- O modelo de dados tem competência em aberto, lançamentos parciais e recálculo a cada lançamento (módulo `alerts`, com o módulo `periods`).
- O alerta é uma projeção com premissas explícitas, nunca uma apuração (doc 05).
- O entendimento sobre as janelas do Fator R (doc 01, item 3.1) precisa ser confirmado antes da implementação.
- Abre caminho para o catálogo de alertas futuros (doc 05).

## D2 · Validação de NCM/CFOP e operações com mercadorias fora do POC e do MVP

**Contexto.** Operações com mercadorias trazem ST, monofásicos e coerência NCM/CFOP, de complexidade muito maior. O escopo recomenda começar por serviços (§6).

**Decisão.** A validação de NCM/CFOP e as operações com mercadorias ficam fora do POC e do MVP. Entram no roadmap como frente preditiva futura, documentada desde já. Para serviços, o equivalente futuro é a coerência entre o código de serviço (LC 116), o CNAE e o anexo.

**Consequências.**

- Receitas de mercadorias geram `partially_covered` ou `specialist_review_required` (doc 03, F4 a F6).
- Doc 05 especifica os alertas futuros de NCM/CFOP e de código de serviço × CNAE × anexo, com dados e dependências.
- Doc 06 posiciona essas frentes na fase de evolução.

## D3 · Responsáveis tributários e casos de referência

**Contexto.** O escopo exige regras com responsável e aprovação (§8) e casos de referência aprovados pelo responsável tributário (§9).

**Decisão.** Os responsáveis tributários são os dois stakeholders (contadores). Eles fornecem casos de referência anonimizados com PGDAS-D real, que são o gabarito do motor.

**Consequências.**

- Toda regra tem `owner` igual aos responsáveis tributários e só é `approved` com a aprovação deles.
- Formato dos casos e critérios de precisão: doc 07. Fixtures em `packages/tax-engine/test/reference-cases/`.
- O avanço do motor depende do recebimento dos casos.

## D4 · Recorte do POC

**Contexto.** O escopo recomenda um MVP de serviços (Anexo III e Fator R). O POC precisa validar a experiência e o motor com o menor recorte útil.

**Decisão.** O POC inclui: motor para os Anexos III e V com Fator R (RBT12 e início de atividade, faixas e parcela a deduzir, alíquota efetiva, repartição, memória de cálculo); diagnóstico de cobertura; entrada manual (cadastro e estabelecimentos, CNAEs com descrição, histórico de receita e folha, competência em aberto com lançamentos parciais); alerta preditivo de Fator R; simulação de pró-labore; conferência contra PGDAS-D digitado; oportunidades `potential`/`validated`/`realized`; convite, autorização e fluxo de revisão com a contabilidade; quatro perfis com isolamento entre empresas; e projeção básica com premissas e horizonte, recalculando cada competência futura.

Ficam fora (como próximas etapas): importação por planilha, extração de documentos, relatórios exportáveis, NCM/CFOP, mercadorias, IBS/CBS (somente a estrutura por vigência), integrações e folha completa.

**Consequências.** A matriz de cobertura (doc 03) e o roadmap (doc 06) refletem esse recorte. Os relatórios exportáveis, previstos no MVP do escopo (§6), ficam fora do POC.

## D5 · PGDAS-D digitado manualmente no POC

**Contexto.** A extração automática de documentos tem custo e risco. A conferência só precisa dos valores declarados.

**Decisão.** No POC, o PGDAS-D é digitado manualmente. A extração automática (IA com confirmação do usuário) e a importação ficam como próximas etapas documentadas.

**Consequências.** A interface de digitação deve espelhar os campos do demonstrativo. Os dados digitados nascem `Informed` e precisam ser confirmados. A IA, quando vier, só extrai, nunca calcula imposto.

## D6 · Planilha padrão de importação como dependência bloqueante

**Contexto.** Existe uma planilha padrão de importação, mas ela ainda não foi disponibilizada. O escopo (§6 e §10) diz que os formatos de importação precisam ser definidos antes de fechar prazo e custo.

**Decisão.** A importação por planilha fica fora do POC e é registrada como **dependência bloqueante** para o MVP e para o orçamento.

**Consequências.** O roadmap (doc 06) marca a importação como bloqueada até o recebimento do modelo. O orçamento do MVP não é fechado antes disso.

## D7 · Efeito do pró-labore na pessoa física e encargos como estimativa

**Contexto.** O escopo exige considerar o efeito econômico total do planejamento de folha e pró-labore (§5.4), mas o cálculo completo de folha está fora do MVP.

**Decisão.** O efeito do pró-labore na pessoa física e os encargos entram como **estimativa com premissas explícitas**. O cálculo completo fica documentado para o futuro.

**Consequências.** Toda oportunidade e todo alerta que envolva pró-labore exibe as premissas usadas (alíquotas e tabelas como parâmetros com fonte, ainda `PLACEHOLDER`). A oportunidade nasce `potential`. O cálculo completo entra no roadmap.

## D8 · Quatro perfis no POC

**Contexto.** O escopo define quatro perfis (§1) e exige isolamento entre empresas (§8).

**Decisão.** Os quatro perfis entram no POC: Empresário/Gestor, Contabilidade convidada, Consultor tributário e Administrador.

**Consequências.** Testes de integração cobrem as permissões dos quatro perfis e o isolamento entre empresas. A matriz de permissões e o MFA dos perfis privilegiados estão em debate (doc 02, P4 e P5).

## D9 · Regras como código

**Contexto.** O escopo exige que cada regra tenha identificação, fonte oficial, vigência, abrangência, responsável, testes e aprovação para publicação, e que alterações não modifiquem análises históricas (§8).

**Decisão.** As regras ficam versionadas no repositório, são revisadas via PR e publicadas por deploy. A aprovação de publicação acontece no fluxo de PR, com um status de aprovação registrado na própria regra.

**Consequências.**

- Pacote `@platform/rules-catalog` com `RuleDefinition` e validação de governança no CI (`validateCatalog`).
- Novas versões são acrescentadas, nunca editadas. A seleção é feita pela vigência da competência.
- Não há editor de regras na interface. O perfil Administrador consulta as versões.
- Os stakeholders precisam participar da revisão de PRs (proposta de CODEOWNERS no doc 02).

## D10 · Critério de sucesso do POC

**Contexto.** É preciso um critério objetivo para encerrar o POC.

**Decisão.** O critério de sucesso do POC é a **aprovação dos stakeholders**. O prazo será definido numa próxima etapa, a partir do roadmap proposto.

**Consequências.** O roadmap (doc 06) não tem datas. A reprodução dos casos de referência é a principal evidência para a aprovação.

## D11 · Nome da plataforma não definido

**Contexto.** A plataforma ainda não tem nome. O documento de escopo traz a marca "Crivo", que é o nome do escritório de contabilidade de um dos stakeholders, e não o nome do produto.

**Decisão.** Nenhum nome de produto entra em código, pacotes, infraestrutura ou documentação. Os pacotes usam o escopo neutro `@platform/*`, os recursos AWS usam o prefixo `platform`, e o nome exibido na interface vem de uma única constante `PRODUCT_NAME` no dicionário pt-BR, marcada como `PLACEHOLDER`. Renomear deve exigir a troca de um único valor.

**Consequências.** `apps/web/src/i18n/product-name.ts` é o único lugar com o nome exibido (inclusive o título da página, definido em `main.tsx`). Um teste de componente garante que o cabeçalho usa a constante. `infra/src/naming/resource-name.ts` centraliza o prefixo `platform`.
