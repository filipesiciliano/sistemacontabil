# 04 · Registro de decisões

> Formato ADR resumido: contexto, decisão e consequências. Decisões novas são acrescentadas ao fim, com o próximo número. Uma decisão nunca é editada para mudar de sentido: ela é **substituída** por outra, que referencia a anterior. Decisões ainda em debate ficam como **[DECISÃO PENDENTE]** em [`02-arquitetura-proposta.md`](02-arquitetura-proposta.md) até serem aprovadas.

| #   | Título                                                                     | Status                                          |
| --- | -------------------------------------------------------------------------- | ----------------------------------------------- |
| D1  | Alerta preditivo intra-mês no POC, começando pelo Fator R                  | Aprovada (adição ao escopo)                     |
| D2  | NCM/CFOP e mercadorias fora do POC e do MVP                                | Aprovada                                        |
| D3  | Stakeholders como responsáveis tributários e fonte dos casos de referência | Aprovada                                        |
| D4  | Recorte do POC                                                             | Aprovada                                        |
| D5  | PGDAS-D digitado manualmente no POC                                        | Aprovada                                        |
| D6  | Planilha padrão de importação como dependência bloqueante                  | Aprovada                                        |
| D7  | Efeito do pró-labore na PF e encargos como estimativa com premissas        | Aprovada                                        |
| D8  | Quatro perfis no POC                                                       | Aprovada                                        |
| D9  | Regras como código, aprovadas via PR                                       | Aprovada                                        |
| D10 | Critério de sucesso do POC: aprovação dos stakeholders                     | Aprovada                                        |
| D11 | Nome da plataforma não definido; identificadores neutros                   | Aprovada                                        |
| D12 | Regras do Fator R respondidas pelos stakeholders                           | Aprovada (fonte oficial pendente)               |
| D13 | Parâmetros do alerta de Fator R                                            | Aprovada                                        |
| D14 | Impacto do pró-labore no IRPF e deduções para compensá-lo                  | Aprovada; fase definida por D23 (MVP)           |
| D15 | Tolerância de centavos na conferência                                      | Provisória                                      |
| D16 | ISS em vários municípios no POC; regime de caixa fora                      | Aprovada                                        |
| D17 | Consultor tributário depende de convite e autorização                      | Aprovada                                        |
| D18 | MFA adiado para depois do POC                                              | Aprovada                                        |
| D19 | Retenção de 12 meses para os arquivos recebidos da empresa                 | Substituída por D24                             |
| D20 | Fontes e regras complementares (início de atividade, regime de caixa, ISS) | Aprovada (fontes informadas pelos stakeholders) |
| D21 | Conferência sempre pelo principal, sem acréscimos                          | Aprovada                                        |
| D22 | Processamento da folha e receita sugerida no alerta                        | Aprovada                                        |
| D23 | Efeito na pessoa física fica para o MVP, sem comparação com dividendos     | Aprovada                                        |
| D24 | Arquivos descartados após o processamento                                  | Aprovada                                        |

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

---

> **Rodada 1 de respostas dos stakeholders (2026-11-04).** As decisões D12 a D19 registram as respostas às perguntas enviadas no grupo. A numeração "W1…W17" refere-se a essas perguntas (ver doc 01, item 4.3). Quando a resposta é uma interpretação tributária, a regra continua em `draft` no catálogo até receber a fonte oficial (D9).

## D12 · Regras do Fator R respondidas pelos stakeholders

**Contexto.** O alerta de Fator R (D1) dependia de cinco pontos de interpretação (W1–W5).

**Decisão.**

- **Competência-alvo (W1):** o Fator R da competência M usa folha e receita dos 12 meses anteriores. O pró-labore da competência em aberto M tem reflexo em **M+1**. Como a folha de M é processada até o início de M+1 (por exemplo, até o 5º dia útil), ainda é possível agir sobre a folha de M depois do fim do mês.
- **Momento (W2):** conta a **competência da folha**, não a data de pagamento.
- **Componentes (W3):** entram todos os itens da **folha processada**: pró-labore, salários, 13º, férias, FGTS e INSS patronal.
- **Limite (W4):** Fator R igual ao limite enquadra no Anexo III (comparação `≥`). A precisão da razão antes da comparação continua em aberto.
- **Início de atividade (W5):** a folha do primeiro mês é anualizada (folha do mês × 12) e o valor é ajustado conforme os meses seguintes acontecem, até haver 12 meses de histórico.

**Consequências.**

- Doc 05 passa a projetar T = M+1 e o prazo vira a data de processamento da folha (D13).
- Catálogo: `simples-nacional.factor-r` continua `draft`. Os parâmetros `comparison`, `windowMonths`, `payrollComponents` e `startOfActivityRule` já têm resposta dos stakeholders, mas ainda precisam da fonte oficial. `ratioRounding` segue sem resposta.
- O POC precisa registrar a folha por competência e por componente, com o estado "processada".

## D13 · Parâmetros do alerta de Fator R

**Contexto.** O alerta precisava de prazo, método de projeção da receita e margem de atenção (W6–W8).

**Decisão.**

- **Prazo para agir (W6):** até o **processamento da folha** da competência em aberto. Como a data varia por empresa (no próprio mês ou no início do mês seguinte), ela passa a ser um dado cadastral da empresa.
- **Projeção da receita do mês (W7):** **estimativa informada pelo usuário**.
- **Margem de atenção (W8):** alerta `thin_margin` enquanto o Fator R projetado estiver entre o limite e **28,10%**.

**Consequências.** Novo dado obrigatório para o alerta: data (ou dia útil) de processamento da folha. Sem ele, o prazo aparece como "a confirmar". Sem estimativa de receita, o alerta projeta só com o lançado e avisa que a projeção pode estar otimista. O valor padrão sugerido para a estimativa ainda está em aberto.

## D14 · Impacto do pró-labore no IRPF e deduções para compensá-lo

**Contexto.** D7 trata o efeito na pessoa física como estimativa com premissas. Os stakeholders destacaram que esse é o ponto que "faz toda diferença" (W9).

**Decisão.** Ao sugerir aumento de pró-labore, a plataforma mostra o **impacto no IRPF do sócio** e **quanto ele precisaria de deduções** (dependentes, plano de saúde, educação etc.) para amortizar esse impacto. Os encargos sobre a folha compõem o custo com pessoal e também entram no cálculo dos 28% (D12).

**Consequências.**

- Tabela do IRPF, limites de dedução e regras de cada dedução viram parâmetros com fonte e vigência no catálogo (hoje `PLACEHOLDER`).
- A dedução necessária é sempre uma estimativa com premissas e nunca substitui a orientação da contabilidade.
- **[DECISÃO PENDENTE]** Se essa estimativa entra já no POC ou no MVP (item 2.6 do roadmap). Também continua em aberto se a tributação recente de dividendos entra na comparação com a retirada como lucro.

## D15 · Tolerância de centavos na conferência (provisória)

**Contexto.** Os stakeholders não souberam informar as regras de arredondamento do PGDAS-D (W10) e preferem tolerar diferenças de centavos (W11), sem conseguir avaliar o impacto.

**Decisão (provisória).** Diferenças de até **R$ 0,01 por tributo** aparecem como "possível diferença de arredondamento", em nível informativo, e não como divergência a esclarecer. A política de arredondamento será **derivada dos casos de referência** (PGDAS-D reais) e do Manual do PGDAS-D, e validada pelos stakeholders.

**Consequências.** Doc 07 (P3–P7) é atualizado. A decisão é revista quando houver casos suficientes: se os casos reproduzirem o centavo exato, a tolerância pode cair para zero.

## D16 · ISS em vários municípios no POC; regime de caixa fora

**Contexto.** W12 e W13.

**Decisão.**

- Estabelecimentos em **municípios diferentes entram no POC**, com segregação do ISS pelo município.
- Empresas no **regime de caixa ficam fora do POC** (`specialist_review_required`). Segundo os stakeholders, o regime de caixa deixa de existir para empresas do Simples a partir do próximo ano **[A CONFIRMAR: fonte oficial]**.

**Consequências.** Matriz de cobertura: C7 passa a `covered` e F8 fica confirmado. O cadastro precisa do município de incidência do ISS de cada receita. As regras de segregação do ISS por município precisam de fonte.

## D17 · Consultor tributário depende de convite e autorização

**Contexto.** W16.

**Decisão.** O Consultor tributário, assim como a Contabilidade convidada, só acessa uma empresa por **convite e autorização da empresa**.

**Consequências.** Um único mecanismo de concessão de acesso (grant) serve aos dois perfis. Testes de isolamento cobrem os dois.

## D18 · MFA adiado para depois do POC

**Contexto.** O briefing previa MFA para perfis privilegiados. Os stakeholders preferem deixar isso para depois (W15).

**Decisão.** O POC não exige MFA. O Cognito é configurado para permitir habilitá-lo depois sem migrar usuários (MFA `OPTIONAL` no pool, desligado na aplicação).

**Consequências.** MFA vai para o endurecimento do MVP (roadmap 2.8). A escolha de quais perfis exigem MFA (doc 02, P4) fica para essa etapa. **Risco aceito:** no POC, perfis com acesso a várias empresas (Contabilidade, Consultor, Administrador) usam só senha. Por isso, o POC deve usar apenas dados anonimizados ou autorizados.

## D19 · Retenção de 12 meses para os arquivos recebidos da empresa

**Contexto.** W17.

**Decisão.** Arquivos recebidos da empresa (PGDAS-D, DAS, comprovantes e demais evidências) são guardados por **12 meses**.

**Consequências.**

- Regra de ciclo de vida no bucket de evidências (infra).
- **[DECISÃO PENDENTE]** O que conta como início dos 12 meses (envio do arquivo, competência ou encerramento da revisão), o que acontece com os snapshots de cálculo que referenciam um arquivo excluído (os snapshots são imutáveis e guardam valores, não o arquivo) e se a empresa pode pedir exclusão antes do prazo (LGPD).

---

> **Rodada 2 de respostas dos stakeholders (2026-11-10).** Perguntas numeradas R2-1 a R2-11 (doc 01, item 4.5).

## D20 · Fontes e regras complementares

**Contexto.** A rodada 1 deixou fontes e detalhes em aberto (R2-2, R2-4, R2-5).

**Decisão.**

- **Início de atividade (R2-2):** a fonte é a LC 123/2006 e seus desdobramentos. A regra é a da receita (RBT12 proporcional no início de atividade), e a folha do Fator R **acompanha a mesma lógica** (complementa D12).
- **Fim do regime de caixa (R2-4):** fonte informada pelos stakeholders, art. 517 da LC 214/2025 (complementa D16).
- **ISS em vários municípios (R2-5):** o ISS é devido ao **município do estabelecimento**, com as exceções do art. 3º da LC 116/2003 (complementa D16).

**Consequências.**

- As fontes entram nas regras do catálogo, que continuam `draft` até a transcrição do texto oficial e a conferência dos stakeholders.
- **[DECISÃO PENDENTE]** Tratamento das exceções do art. 3º da LC 116/2003 no POC. Proposta: o cadastro pergunta se algum serviço prestado se enquadra nessas exceções. Se sim, a parcela do ISS dessa receita fica `partially_covered` (tributos federais calculados, ISS sinalizado para revisão).

## D21 · Conferência sempre pelo principal, sem acréscimos

**Contexto.** R2-3, reformulação da pergunta sobre multa e juros.

**Decisão.** A comparação entre apurado e calculado é feita **sempre pelo valor principal**, sem encargos de atraso. A plataforma não calcula multa nem juros.

**Consequências.** A conferência continua exibindo os acréscimos informados separados do principal (critério de aceite 5 do escopo), mas eles não entram na diferença nem geram divergência. Matriz: C12 passa a "exibição informativa". O campo `differenceToDeclared.additions` dos casos de referência passa a ser informativo.

## D22 · Processamento da folha e receita sugerida no alerta

**Contexto.** R2-6 e R2-7 detalham D13.

**Decisão.**

- **Processamento da folha (R2-6):** cada empresa adota uma de duas modalidades, que se mantém recorrente depois de definida:
  - **dentro do mês:** a empresa paga os funcionários no próprio mês, e a folha é processada até o último dia da competência;
  - **5º dia útil:** a folha é processada até o 5º dia útil do mês seguinte.
- **Receita sugerida (R2-7):** sem estimativa informada pelo usuário, a sugestão padrão para o restante do mês usa a **média mensal dos 12 meses lançados** **[interpretação a confirmar: a resposta foi "utilizar o que foi lançado como média para os 12 meses"]**.

**Consequências.**

- O cadastro da empresa ganha a modalidade de processamento da folha. O prazo do alerta deriva dela.
- O cálculo do 5º dia útil exige um calendário de dias úteis (feriados nacionais e, possivelmente, estaduais e municipais) **[A CONFIRMAR: quais feriados considerar]**. O calendário entra como dado versionado, não calculado de memória.

## D23 · Efeito na pessoa física fica para o MVP, sem comparação com dividendos

**Contexto.** R2-8 e R2-9. D14 havia definido mostrar o impacto no IRPF e as deduções necessárias, com a fase em aberto.

**Decisão.**

- O impacto do pró-labore no IRPF e as deduções necessárias para compensá-lo (D14) ficam para o **MVP**.
- A comparação com a retirada como lucro **não considera** a tributação de dividendos, porque o perfil de empresário buscado neste momento não alcança o limite dessa tributação. Isso é exibido como premissa.

**Consequências.**

- No POC, o custo do aumento de pró-labore mostra o **custo com pessoal** (pró-labore e encargos, D12). O efeito na pessoa física aparece como "não estimado nesta versão".
- **Atenção:** o briefing do POC (D4 e D7) previa o efeito na pessoa física como estimativa com premissas já no POC. Esta decisão adia esse ponto e precisa da confirmação do responsável pelo produto.

## D24 · Arquivos descartados após o processamento

**Contexto.** R2-10. Substitui D19 (retenção de 12 meses).

**Decisão.** Os arquivos recebidos da empresa são necessários só até serem **processados** pela plataforma. Depois disso, guarda-se apenas a **memória das informações extraídas** (dados confirmados e snapshots de cálculo).

**Consequências.**

- Bucket de evidências com exclusão após o processamento, e não retenção longa.
- **[DECISÃO PENDENTE]** O que conta como "processado": dados extraídos e **confirmados** pelo usuário (proposta), conferência concluída ou fluxo de revisão encerrado.
- **Risco:** o escopo (§5.6) prevê registrar evidências no fluxo de revisão com a contabilidade. Se o arquivo for apagado antes da revisão, a contabilidade perde o documento de origem. Proposta: apagar só depois da conclusão da revisão, quando houver uma em andamento.
- No POC, o PGDAS-D é digitado (D5). Os arquivos se limitam a evidências anexadas na revisão.
