# 01 · Análise inicial

> Fonte da verdade do produto: [`00-escopo-stakeholders.md`](00-escopo-stakeholders.md). Este documento interpreta o escopo, registra o recorte do POC e lista o que ainda precisa de resposta. Ele não toma decisões fiscais: valores, fórmulas e interpretações tributárias são sempre **a confirmar** pelos responsáveis tributários (D3).
>
> Convenção: **[DECISÃO PENDENTE]** marca decisões de produto ou arquitetura em aberto. **[A CONFIRMAR]** marca entendimentos tributários preliminares que dependem de validação e fonte oficial.

## 1. Entendimento do problema

Empresas do Simples Nacional (ME e EPP, fora do SIMEI) recebem a guia (DAS) sem visibilidade de como o imposto foi calculado: quais receitas entraram, em qual anexo e faixa, se o Fator R foi aplicado e como mudanças operacionais legítimas alterariam o resultado.

O escopo organiza o produto em três entregas:

1. **Conferência do período:** recalcular a apuração e compará-la com o PGDAS-D apresentado.
2. **Identificação de oportunidades:** cenários legais de menor carga, com condições, custos e validação profissional.
3. **Projeção tributária:** efeitos futuros sobre imposto, caixa e competitividade.

Dois públicos precisam ser atendidos ao mesmo tempo. O **empresário** quer entender o resultado principal. A **contabilidade** precisa reproduzir cada valor a partir dos dados de origem. Por isso a memória de cálculo é um requisito central, não um detalhe de relatório.

### 1.1 Diferencial: ser preditivo (adição aprovada, D1)

A referência de mercado (e-Simples, módulo do e-Auditoria) audita o mês já fechado. O diferencial aprovado é **alertar durante a competência, enquanto ainda dá para agir**.

> **Adição ao escopo original.** O documento dos stakeholders não descreve o alerta intra-mês. Ele foi aprovado como adição (D1) e muda a jornada: além da sequência "cadastrar → histórico → competência → apuração → conferência", a plataforma admite **lançamentos parciais na competência em aberto** e acompanha a situação continuamente.

Exemplo central do briefing (ilustrativo, valores a confirmar): faltam R$ 50 de pró-labore para o Fator R atingir o limite. Sem esse valor, a atividade passa do Anexo III para o Anexo V e a alíquota inicial sobe de forma relevante. O sistema deve avisar antes do fechamento, informando quanto falta, até quando agir e o efeito econômico estimado, já descontados os custos do aumento de pró-labore.

### 1.2 Jornada no POC

| Etapa do escopo (§3)           | No POC                                                                                        |
| ------------------------------ | --------------------------------------------------------------------------------------------- |
| 1. Cadastrar a empresa         | Entrada manual: cadastro, estabelecimentos, CNAEs com descrição da atividade exercida.        |
| 2. Informar o histórico        | Entrada manual de receita e folha/pró-labore por competência.                                 |
| 3. Preencher a competência     | Entrada manual, **inclusive parcial na competência em aberto** (D1).                          |
| 4. Anexar a apuração           | PGDAS-D **digitado manualmente** (D5). Extração e importação ficam para depois.               |
| 5. Revisar os dados            | Confirmação explícita: cada dado é `Missing`, `Informed` ou `Confirmed`.                      |
| 6. Executar a conferência      | Diagnóstico de cobertura, cálculo e comparação com o PGDAS-D digitado.                        |
| 7. Analisar oportunidades      | Fator R e simulação de pró-labore, classificadas como `potential` / `validated` / `realized`. |
| 8. Encaminhar para revisão     | Convite, autorização e fluxo de revisão com a contabilidade.                                  |
| Nova: acompanhar a competência | Alerta preditivo de Fator R, recalculado a cada lançamento.                                   |

## 2. Glossário do domínio

| Termo                                         | Definição usada no projeto                                                                                                                                                                                                                                                                                              | Identificador (existente ou previsto) no código |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| **Competência**                               | Mês a que se referem as receitas e a apuração, no formato `AAAA-MM`. Também chamada de período de apuração (PA).                                                                                                                                                                                                        | `Competence`                                    |
| **Competência em aberto**                     | Competência ainda não encerrada, que recebe lançamentos parciais e é acompanhada pelos alertas (D1).                                                                                                                                                                                                                    | `OpenCompetence`                                |
| **RBT12**                                     | Receita bruta total acumulada nos 12 meses anteriores ao período de apuração. Define a faixa e entra na fórmula da alíquota efetiva. Regras de início de atividade alteram o cálculo **[A CONFIRMAR: `PLACEHOLDER_RBT12_*`]**.                                                                                          | `rbt12`                                         |
| **Início de atividade**                       | Período em que a empresa ainda não tem 12 meses de receita. O RBT12 é obtido por regra própria de proporcionalização **[A CONFIRMAR]**.                                                                                                                                                                                 | `startOfActivity`                               |
| **Fator R**                                   | Razão entre a folha de salários (incluindo pró-labore e encargos elegíveis) e a receita bruta, em janelas de 12 meses. Para atividades sujeitas à regra, define a tributação pelo Anexo III ou pelo Anexo V. Limite, componentes, janelas e critério de comparação estão em `PLACEHOLDER_FACTOR_R_*` **[A CONFIRMAR]**. | `factorR`                                       |
| **Anexo**                                     | Tabela da LC 123/2006 aplicável a um grupo de atividades, com faixas, alíquotas nominais, parcelas a deduzir e repartição por tributo. O POC cobre os Anexos III e V.                                                                                                                                                   | `annex`                                         |
| **Faixa**                                     | Intervalo de RBT12 que determina a alíquota nominal e a parcela a deduzir dentro de um anexo.                                                                                                                                                                                                                           | `bracket`                                       |
| **Alíquota nominal**                          | Alíquota da faixa, antes da parcela a deduzir.                                                                                                                                                                                                                                                                          | `nominalRate`                                   |
| **Parcela a deduzir**                         | Valor fixo da faixa, subtraído na fórmula da alíquota efetiva.                                                                                                                                                                                                                                                          | `deduction`                                     |
| **Alíquota efetiva**                          | Alíquota aplicada à receita do mês. Fórmula estrutural publicada no Manual do PGDAS-D: `(RBT12 × alíquota nominal − parcela a deduzir) ÷ RBT12`. Transcrição exata e arredondamento **[A CONFIRMAR: `PLACEHOLDER_EFFECTIVE_RATE_FORMULA`]**.                                                                            | `effectiveRate`                                 |
| **Repartição**                                | Distribuição da alíquota efetiva entre os tributos do DAS (IRPJ, CSLL, COFINS, PIS/Pasep, CPP, ISS etc.), por faixa e anexo.                                                                                                                                                                                            | `taxDistribution`                               |
| **Segregação**                                | Separação das receitas do mês por atividade, anexo e tratamento (retenção, ST, monofásico, exportação etc.). Cada parcela segregada recebe sua alíquota e repartição.                                                                                                                                                   | `segregation`                                   |
| **Limite e sublimite**                        | Teto de receita para permanência no Simples e sublimite estadual/municipal para recolhimento de ICMS/ISS dentro do DAS. Exceder gera tratamento específico, fora do POC.                                                                                                                                                | `revenueLimits`                                 |
| **PGDAS-D**                                   | Programa Gerador do Documento de Arrecadação do Simples Nacional – Declaratório, em que a apuração mensal é declarada. Seu demonstrativo é a "apuração apresentada" na conferência. No POC, é digitado (D5).                                                                                                            | `declaredAssessment`                            |
| **DAS**                                       | Documento de Arrecadação do Simples Nacional, a guia de pagamento gerada a partir do PGDAS-D.                                                                                                                                                                                                                           | `das`                                           |
| **Principal**                                 | Valor do tributo devido na competência, sem acréscimos.                                                                                                                                                                                                                                                                 | `principal`                                     |
| **Acréscimos**                                | Multa e juros por pagamento em atraso. A conferência sempre os apresenta separados do principal (critério de aceite 5).                                                                                                                                                                                                 | `additions`                                     |
| **Pró-labore**                                | Remuneração do sócio pelo trabalho, que entra na folha do Fator R e gera contribuição previdenciária e IRPF na pessoa física.                                                                                                                                                                                           | `proLabore`                                     |
| **Diagnóstico de cobertura**                  | Verificação, anterior a qualquer cálculo, se a plataforma atende a empresa na competência: `covered`, `partially_covered` ou `specialist_review_required`.                                                                                                                                                              | `CoverageStatus`                                |
| **Memória de cálculo**                        | Sequência de passos (fórmula, entradas, resultado, regra aplicada) que permite reproduzir cada valor.                                                                                                                                                                                                                   | `CalculationMemory`                             |
| **Snapshot de cálculo**                       | Registro imutável com entradas, versões das regras e memória. Mudança de regra nunca reescreve um snapshot.                                                                                                                                                                                                             | `CalculationSnapshot`                           |
| **Estado do dado**                            | `Missing` (não informado), `Informed` (informado, sem confirmação) ou `Confirmed` (confirmado por um responsável). Ausência nunca vale zero.                                                                                                                                                                            | `DataPoint`                                     |
| **Economia potencial / validada / realizada** | Classificação dos benefícios (§5.4): cenário sujeito a validação / aprovado após revisão / efetivamente comprovado.                                                                                                                                                                                                     | `potential` / `validated` / `realized`          |
| **Postergação**                               | Benefício de caixa (pagar depois), apresentado separado da redução definitiva de tributo.                                                                                                                                                                                                                               | `cashDeferral`                                  |

## 3. Regras do recorte (POC)

Nenhuma alíquota, faixa, parcela a deduzir, limite ou repartição é implementada de memória. No catálogo de regras (`packages/rules-catalog`), todos esses valores estão como `PLACEHOLDER_*`, e as regras ficam em `draft` até receberem valor e fonte oficial dos responsáveis tributários.

| Regra                 | Entendimento estrutural                                                                                                                                                                                                         | Parâmetros pendentes                                                     |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| RBT12                 | Soma das receitas brutas dos 12 meses anteriores à competência, consolidada no CNPJ raiz (todos os estabelecimentos).                                                                                                           | Tamanho da janela, tratamento de meses `Missing` (bloqueia a conclusão). |
| Início de atividade   | Quando há menos de 12 meses de atividade, aplica-se regra de proporcionalização.                                                                                                                                                | `PLACEHOLDER_RBT12_START_OF_ACTIVITY`, com exemplos oficiais.            |
| Faixa                 | Faixa do anexo em que o RBT12 se enquadra.                                                                                                                                                                                      | `PLACEHOLDER_ANNEX_III_BRACKETS`, `PLACEHOLDER_ANNEX_V_BRACKETS`.        |
| Alíquota efetiva      | Fórmula do Manual do PGDAS-D.                                                                                                                                                                                                   | `PLACEHOLDER_EFFECTIVE_RATE_FORMULA` e política de arredondamento.       |
| Repartição            | Distribuição da alíquota efetiva por tributo, por faixa.                                                                                                                                                                        | `PLACEHOLDER_ANNEX_*_DISTRIBUTION`, regra de teto do ISS.                |
| Fator R               | Atividades sujeitas ao Fator R vão para o Anexo III se a razão folha/receita atingir o limite (`≥`); caso contrário, Anexo V. Janela: 12 meses anteriores; folha por competência, com todos os itens da folha processada (D12). | Fonte oficial; precisão da razão antes da comparação.                    |
| Valor devido          | Receita segregada da competência × alíquota efetiva, repartida por tributo.                                                                                                                                                     | Arredondamento por tributo e do total.                                   |
| Conferência           | Apresentado × calculado, diferença com principal e acréscimos separados, possível causa e providência sugerida.                                                                                                                 | Tolerância provisória de R$ 0,01 por tributo (D15).                      |
| Multi-estabelecimento | RBT12 e faixa consolidados no CNPJ raiz; receita do mês segregada por estabelecimento e por município de incidência do ISS. Municípios diferentes entram no POC (D16).                                                          | Regras de segregação do ISS por município **[A CONFIRMAR: fonte]**.      |

### 3.1 Competência-alvo do Fator R (respondido, D12)

Confirmado pelos stakeholders: o Fator R de uma competência usa a folha e a receita dos **12 meses anteriores** a ela, e a folha conta pela **competência**. O pró-labore da competência em aberto **M** não altera o anexo de M, mas altera o de **M+1** e das competências seguintes.

Como a folha de M costuma ser processada até o início de M+1 (por exemplo, até o 5º dia útil), ainda é possível agir sobre a folha de M depois do fim do mês. Por isso, o prazo do alerta é a data de processamento da folha (D13), e não o último dia do mês.

## 4. Lacunas, riscos e perguntas remanescentes

### 4.1 Lacunas no escopo

| #   | Lacuna                                                              | Impacto                                                                    | Encaminhamento                                                            |
| --- | ------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| L1  | Valores oficiais das tabelas (Anexos III e V, repartição, limites). | Bloqueia o motor real.                                                     | Responsáveis tributários fornecem valores com fonte (D3).                 |
| L2  | Critérios de precisão e arredondamento.                             | Bloqueia o critério de aceite 1.                                           | Acordar conforme doc 07.                                                  |
| L3  | Casos de referência com PGDAS-D real.                               | Sem gabarito, não há como validar o motor.                                 | Formato definido no doc 07.                                               |
| L4  | Planilha padrão de importação (D6).                                 | Bloqueia MVP e orçamento.                                                  | Registrada como dependência no roadmap.                                   |
| L5  | Lista de atividades/CNAEs sujeitos ao Fator R no recorte.           | Bloqueia o diagnóstico de cobertura.                                       | Stakeholders fornecem a lista e os critérios.                             |
| L6  | Regime de caixa.                                                    | Definia se o POC aceita optantes pelo regime de caixa.                     | Respondido (D16): fora do POC, `specialist_review_required`.              |
| L7  | Cálculo de multa e juros.                                           | Define se a plataforma calcula acréscimos ou apenas compara os informados. | Pergunta reformulada na rodada 2 (W14). Proposta: apenas comparar no POC. |
| L8  | Links das fontes oficiais não vieram na transcrição do escopo.      | Rastreabilidade das regras.                                                | Stakeholders fornecem os links.                                           |

### 4.2 Riscos

| Risco                                                                                                 | Mitigação                                                                                                                    |
| ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Interpretação tributária errada implementada como código.                                             | Regras em `draft` com `PLACEHOLDER`, aprovação via PR pelos responsáveis (D9), casos de referência como gabarito.            |
| Dado ausente tratado como zero (ex.: mês sem folha informada).                                        | Estados `Missing`/`Informed`/`Confirmed` no tipo, e conclusão bloqueada quando falta dado obrigatório.                       |
| Cálculo "completo" que ignora operação relevante.                                                     | Diagnóstico de cobertura obrigatório antes do cálculo, com matriz (doc 03).                                                  |
| Perda de precisão em dinheiro.                                                                        | `Decimal` em todo o domínio, `numeric` no Postgres, lint proíbe importar `decimal.js` fora do pacote de tipos.               |
| Mudança de regra alterando análises históricas.                                                       | Snapshots imutáveis com versão da regra; tabelas append-only.                                                                |
| Alerta preditivo com baixa confiança (receita do mês ainda incompleta).                               | Projeção com premissas explícitas, cenários e indicação de confiança; nunca apresentado como apuração.                       |
| Recomendação de aumento de pró-labore que não compensa na pessoa física.                              | Custo do aumento (encargos e efeito na PF) como premissas declaradas (D7); a oportunidade só é `potential` até ser validada. |
| Vazamento de dados entre empresas.                                                                    | Isolamento por empresa na API e no banco, testado com Postgres real para os quatro perfis.                                   |
| Mudanças legislativas recentes (IBS/CBS a partir de 2027, tributação de dividendos na pessoa física). | Regras por vigência; efeito na PF tratado como premissa a ser revisada pelos stakeholders.                                   |
| Nome do produto espalhado pelo código.                                                                | D11: escopo `@platform/*`, prefixo `platform`, uma única constante `PRODUCT_NAME`.                                           |

### 4.3 Rodada 1: respostas recebidas (2026-11-04)

As perguntas foram enviadas no grupo dos stakeholders numeradas de W1 a W17.

| #   | Pergunta                                                    | Resposta                                                                                                                              | Registro                 |
| --- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| W1  | O Fator R de M usa os 12 meses anteriores (reflexo em M+1)? | Sim. Com a folha processada até o 5º dia útil seguinte, dá para agir sobre a folha do mês corrente.                                   | D12                      |
| W2  | O pró-labore conta pela competência ou pelo pagamento?      | Competência da folha.                                                                                                                 | D12                      |
| W3  | Quais itens entram na folha?                                | Todos (pró-labore, salários, 13º, férias, FGTS, INSS patronal); conta o processamento da folha.                                       | D12                      |
| W4  | 28,00% enquadra no Anexo III? Com quantas casas?            | Sim. Precisão: não sabem.                                                                                                             | D12 · precisão em aberto |
| W5  | Fator R no início de atividade?                             | O primeiro mês de folha determina: folha do mês × 12, ajustada nos meses seguintes.                                                   | D12 · fonte pendente     |
| W6  | Prazo prático para agir?                                    | Até o processamento da folha (no próprio mês ou no início do seguinte).                                                               | D13                      |
| W7  | Como projetar a receita do mês?                             | Estimativa.                                                                                                                           | D13                      |
| W8  | Alerta de pouca margem? Qual?                               | Sim, 28,10%.                                                                                                                          | D13                      |
| W9  | Premissas de custo do pró-labore?                           | Todos os encargos compõem o custo com pessoal e entram nos 28%. Mostrar o impacto no IRPF e as deduções necessárias para amortizá-lo. | D14                      |
| W10 | Arredondamento do PGDAS-D?                                  | Não sabem.                                                                                                                            | D15 · derivar dos casos  |
| W11 | Diferença de centavos é divergência?                        | Tolerada, sem conseguir avaliar o impacto.                                                                                            | D15 (provisória)         |
| W12 | ISS em municípios diferentes entra no POC?                  | Sim.                                                                                                                                  | D16                      |
| W13 | Regime de caixa fora do POC?                                | Concordam; segundo eles, acaba para o Simples a partir do próximo ano.                                                                | D16 · fonte pendente     |
| W14 | Multa e juros: calcular ou comparar?                        | Não entenderam a pergunta.                                                                                                            | Reformulada na rodada 2  |
| W15 | Quais perfis com MFA?                                       | Deixar para depois.                                                                                                                   | D18                      |
| W16 | Consultor depende de convite e autorização?                 | Sim.                                                                                                                                  | D17                      |
| W17 | Retenção de documentos?                                     | 12 meses para os arquivos recebidos da empresa.                                                                                       | D19 · alcance pendente   |

### 4.4 Rodada 2: perguntas enviadas

**Regras tributárias**

1. (W4) Com quantas casas decimais o Fator R é comparado com 28%? Por exemplo, 27,995% vira 28,00%? Se não souberem, os casos de 27,99% e 28,00% devem responder.
2. (W5) Qual é a fonte oficial da anualização da folha no início de atividade? Ela vale da mesma forma para a receita (RBT12 proporcional)?
3. (W14, reformulada) Quando o DAS é pago depois do vencimento, ele vem com multa e juros. A plataforma deve só **comparar** esses valores com os que a empresa informou ou deve **calcular** quanto seriam? Proposta: só comparar no POC.
4. (W13) Qual é a fonte oficial do fim do regime de caixa para o Simples?
5. (W12) Qual é a regra de segregação do ISS entre municípios (por local do estabelecimento ou por local da prestação)?

**Alerta e pró-labore**

6. (W6) A data de processamento da folha é fixa por empresa (por exemplo, "5º dia útil") ou muda todo mês?
7. (W7) Sem estimativa de receita informada, qual valor sugerir: só o lançado ou a média dos últimos meses?
8. (W9) A comparação com a retirada como lucro deve considerar a nova tributação de dividendos?
9. (W9) O impacto no IRPF e as deduções necessárias entram já no POC ou ficam para o MVP?

**Operação**

10. (W17) Os 12 meses contam do envio do arquivo, da competência ou do fim da revisão? A empresa pode pedir a exclusão antes?
11. Quem atua como Administrador no POC: a equipe de desenvolvimento ou os stakeholders?

### 4.5 Rodada 2: respostas recebidas (2026-11-10)

| #     | Pergunta                                           | Resposta                                                                                                     | Registro                        |
| ----- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------- |
| R2-1  | Casas decimais do Fator R                          | Não sabem.                                                                                                   | Derivar dos casos (D15)         |
| R2-2  | Fonte do início de atividade                       | LC 123/2006 e desdobramentos. A regra é a da receita, e a folha acompanha.                                   | D20                             |
| R2-3  | Multa e juros: comparar ou calcular?               | Nenhum dos dois: a comparação é sempre pelo principal, sem encargos de atraso.                               | D21                             |
| R2-4  | Fonte do fim do regime de caixa                    | Art. 517 da LC 214/2025.                                                                                     | D20                             |
| R2-5  | ISS: município do estabelecimento ou da prestação? | Do estabelecimento, com as exceções do art. 3º da LC 116/2003.                                               | D20                             |
| R2-6  | Processamento da folha fixo ou variável?           | Recorrente por cliente: até o último dia do mês ou até o 5º dia útil seguinte.                               | D22                             |
| R2-7  | Receita sugerida sem estimativa                    | "Utilizar o que foi lançado como média para os 12 meses."                                                    | D22 (interpretação a confirmar) |
| R2-8  | Considerar tributação de dividendos?               | Não neste momento: o perfil buscado não alcança o limite.                                                    | D23                             |
| R2-9  | IRPF e deduções no POC?                            | Vem depois.                                                                                                  | D23                             |
| R2-10 | Início dos 12 meses de guarda                      | Depois de processados, os arquivos não são mais necessários; guardar só a memória das informações extraídas. | D24 (substitui D19)             |
| R2-11 | Quem é o Administrador no POC?                     | Sem resposta.                                                                                                | Pendente                        |

### 4.6 Perguntas remanescentes

1. (R2-1) Precisão do Fator R: será descoberta pelos casos reais de 27,99% e 28,00%.
2. (R2-7) Confirmar a interpretação: sem estimativa do usuário, sugerir para o restante do mês a média mensal da receita dos últimos 12 meses?
3. (D20) As exceções do art. 3º da LC 116/2003 entram no POC ou ficam sinalizadas como revisão?
4. (D22) Para o 5º dia útil, quais feriados considerar: só os nacionais ou também os estaduais e municipais?
5. (D24) O que conta como "processado": dados confirmados, conferência concluída ou revisão encerrada?
6. (R2-11) Quem atua como Administrador no POC?
7. **Para o responsável pelo produto:** D23 adia para o MVP o efeito na pessoa física, que o briefing do POC (D4, D7) incluía. Confirma?

**Insumos ainda não recebidos** (bloqueiam o motor)

- Tabelas dos Anexos III e V (faixas, alíquotas nominais, parcelas a deduzir e repartição), com fonte oficial.
- Lista de CNAEs/atividades sujeitos ao Fator R no recorte.
- Casos de referência com PGDAS-D real, na lista mínima do doc 07.
- Links das fontes oficiais citadas no escopo.
