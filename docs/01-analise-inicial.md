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

| Regra                 | Entendimento estrutural                                                                                                                       | Parâmetros pendentes                                                                                          |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| RBT12                 | Soma das receitas brutas dos 12 meses anteriores à competência, consolidada no CNPJ raiz (todos os estabelecimentos).                         | Tamanho da janela, tratamento de meses `Missing` (bloqueia a conclusão).                                      |
| Início de atividade   | Quando há menos de 12 meses de atividade, aplica-se regra de proporcionalização.                                                              | `PLACEHOLDER_RBT12_START_OF_ACTIVITY`, com exemplos oficiais.                                                 |
| Faixa                 | Faixa do anexo em que o RBT12 se enquadra.                                                                                                    | `PLACEHOLDER_ANNEX_III_BRACKETS`, `PLACEHOLDER_ANNEX_V_BRACKETS`.                                             |
| Alíquota efetiva      | Fórmula do Manual do PGDAS-D.                                                                                                                 | `PLACEHOLDER_EFFECTIVE_RATE_FORMULA` e política de arredondamento.                                            |
| Repartição            | Distribuição da alíquota efetiva por tributo, por faixa.                                                                                      | `PLACEHOLDER_ANNEX_*_DISTRIBUTION`, regra de teto do ISS.                                                     |
| Fator R               | Atividades sujeitas ao Fator R vão para o Anexo III se a razão folha/receita atingir o limite; caso contrário, Anexo V.                       | Limite, comparação (`≥` ou `>`), componentes da folha, janelas, início de atividade, arredondamento da razão. |
| Valor devido          | Receita segregada da competência × alíquota efetiva, repartida por tributo.                                                                   | Arredondamento por tributo e do total.                                                                        |
| Conferência           | Apresentado × calculado, diferença com principal e acréscimos separados, possível causa e providência sugerida.                               | Tolerância de diferença (ver doc 07).                                                                         |
| Multi-estabelecimento | RBT12 e faixa consolidados no CNPJ raiz; receita do mês segregada por estabelecimento quando a regra exigir (por exemplo, ISS por município). | Regras de segregação por município **[A CONFIRMAR]**.                                                         |

### 3.1 Ponto crítico de entendimento sobre o Fator R **[A CONFIRMAR]**

Entendimento preliminar: o Fator R de uma competência usa a folha e a receita dos **12 meses anteriores** a ela. Se isso se confirmar, o pró-labore pago na competência em aberto **M** não altera o anexo de **M**, mas altera o Fator R de **M+1** e das competências seguintes.

Consequência para o alerta (doc 05): durante a competência M, o alerta projeta o enquadramento de M+1 em diante, usando a receita parcial de M e a folha de M. Essa leitura precisa ser validada antes de implementar o alerta, porque define a janela, o prazo para agir e o cenário comparado.

## 4. Lacunas, riscos e perguntas remanescentes

### 4.1 Lacunas no escopo

| #   | Lacuna                                                                            | Impacto                                                                    | Encaminhamento                                                         |
| --- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| L1  | Valores oficiais das tabelas (Anexos III e V, repartição, limites).               | Bloqueia o motor real.                                                     | Responsáveis tributários fornecem valores com fonte (D3).              |
| L2  | Critérios de precisão e arredondamento.                                           | Bloqueia o critério de aceite 1.                                           | Acordar conforme doc 07.                                               |
| L3  | Casos de referência com PGDAS-D real.                                             | Sem gabarito, não há como validar o motor.                                 | Formato definido no doc 07.                                            |
| L4  | Planilha padrão de importação (D6).                                               | Bloqueia MVP e orçamento.                                                  | Registrada como dependência no roadmap.                                |
| L5  | Lista de atividades/CNAEs sujeitos ao Fator R no recorte.                         | Bloqueia o diagnóstico de cobertura.                                       | Stakeholders fornecem a lista e os critérios.                          |
| L6  | Regime de caixa: o escopo cita recebimentos, mas o recorte do POC não o menciona. | Define se o POC aceita empresas optantes pelo regime de caixa.             | **[DECISÃO PENDENTE]**. Proposta: `specialist_review_required` no POC. |
| L7  | Cálculo de multa e juros.                                                         | Define se a plataforma calcula acréscimos ou apenas compara os informados. | **[DECISÃO PENDENTE]**. Proposta: apenas comparar no POC.              |
| L8  | Links das fontes oficiais não vieram na transcrição do escopo.                    | Rastreabilidade das regras.                                                | Stakeholders fornecem os links.                                        |

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

### 4.3 Perguntas para os stakeholders

**Regras tributárias**

1. O Fator R da competência M usa a folha e a receita dos 12 meses anteriores a M (item 3.1)? Em que momento o pró-labore conta: competência da folha ou data de pagamento?
2. Quais componentes entram na folha do Fator R (pró-labore, salários, 13º, férias, FGTS, contribuição patronal)? Há algum que só entra se efetivamente pago?
3. Atingir exatamente o limite enquadra no Anexo III? Com quantas casas decimais a razão é comparada? (Casos de 27,99% e 28,00%.)
4. Como fica o Fator R no início de atividade, quando ainda não há 12 meses de folha?
5. Qual é a regra de arredondamento de cada etapa: alíquota efetiva, valor por tributo, total do DAS?
6. Qual é o tratamento do ISS para estabelecimentos em municípios diferentes no POC?
7. A plataforma deve calcular multa e juros ou apenas comparar os valores informados?
8. Empresas optantes pelo regime de caixa entram no POC?

**Alerta preditivo**

9. Qual é o prazo prático para agir: último dia da competência, data de pagamento da folha ou data de transmissão do PGDAS-D da competência seguinte?
10. Como projetar a receita que ainda falta no mês: só o lançado, um valor esperado informado pelo usuário ou a média histórica?
11. Quais premissas usar para o custo do pró-labore (contribuição do sócio, IRPF, efeito sobre distribuição de lucros)? As regras recentes de tributação de dividendos devem entrar como premissa?

**Produto e operação**

12. Quais perfis exigem MFA? Proposta: Administrador, Consultor tributário e Contabilidade convidada, com Empresário/Gestor opcional.
13. O Consultor tributário também depende de convite e autorização da empresa, como a contabilidade?
14. Qual é a política de retenção e exclusão de documentos e dados (LGPD)?
15. Quem atua como Administrador no POC: a equipe de desenvolvimento ou os stakeholders?
