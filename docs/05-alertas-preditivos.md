# 05 · Alertas preditivos

> **Adição aprovada ao escopo original (D1).** O documento dos stakeholders não prevê alertas durante a competência. Este documento especifica o primeiro alerta (Fator R) e o catálogo de alertas futuros.
>
> Nenhum valor tributário é fixado aqui. Limite do Fator R, componentes da folha, janelas, arredondamento, prazos e premissas de custo vêm do catálogo de regras (`PLACEHOLDER_*`) e precisam ser confirmados pelos responsáveis tributários.

## 1. Princípios

1. **Alerta é projeção, não apuração.** Sempre exibe premissas, data dos dados usados e grau de completude. Nunca é apresentado como valor devido.
2. **Ausência de dado não é zero.** Um alerta com dados faltantes diz o que falta, em vez de supor.
3. **Efeito econômico total.** A redução do DAS, sozinha, não demonstra vantagem (escopo §5.4). O alerta mostra o custo do aumento de pró-labore, com premissas (D7).
4. **Linguagem cooperativa.** O alerta orienta ("ainda dá tempo de…"), não acusa.
5. **Reprodutível.** Cada cálculo de alerta grava um snapshot (entradas, versões das regras, memória), como qualquer cálculo do motor.
6. **Resultado do motor.** O alerta usa o mesmo motor puro. A IA não participa do cálculo.

## 2. Alerta de Fator R

### 2.1 Objetivo

Durante a competência em aberto, avisar quando o Fator R projetado ficar abaixo do limite (ou perto dele), informando:

- o Fator R projetado;
- quanto falta de folha/pró-labore para atingir o limite;
- até quando agir;
- a comparação de cenários (Anexo III × Anexo V);
- o custo estimado do aumento, com encargos e efeito na pessoa física declarados como premissas.

### 2.2 Competência-alvo (confirmada, D12)

Confirmado pelos stakeholders: o Fator R da competência **T** usa a folha e a receita dos 12 meses anteriores a T, e a folha conta pela competência. Portanto:

- durante a competência em aberto **M**, a ação possível (ajustar o pró-labore da competência M) afeta o Fator R de **T = M+1** e entra nas janelas das 11 competências seguintes;
- como a folha de M é processada até o início de M+1, a ação continua possível depois do fim do mês, até o processamento (seção 2.6);
- o alerta projeta T = M+1 como alvo principal e mostra, como informação complementar, o efeito sobre as competências seguintes dentro do horizonte de projeção.

A especificação continua escrita em termos de **janela da regra** (`windowFor(T)`, de `simples-nacional.factor-r`), porque o parâmetro só sai de `PLACEHOLDER` com a fonte oficial.

### 2.3 Gatilhos

| Gatilho                   | Condição                                                                                                           | Ação                                                                                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G1 · Elegibilidade        | A empresa tem ao menos uma atividade sujeita ao Fator R (CNAE com descrição revisada) e uma competência em aberto. | Habilita o acompanhamento.                                                                                                                                 |
| G2 · Novo lançamento      | Lançamento, edição ou confirmação de receita ou folha da competência aberta ou de qualquer mês da janela.          | Recalcula a projeção.                                                                                                                                      |
| G3 · Mudança de premissa  | O usuário altera a projeção de receita do restante do mês ou as premissas de custo.                                | Recalcula.                                                                                                                                                 |
| G4 · Proximidade do prazo | Faltam N dias para o prazo de ação (`PLACEHOLDER_ALERT_REMINDER_DAYS`).                                            | Reavalia e reforça o alerta, se ele continuar aberto. **[DECISÃO PENDENTE]** No POC, só no acesso à tela; o agendamento (EventBridge/SQS) fica para o MVP. |
| G5 · Nova versão de regra | Deploy de nova versão aprovada de regra vigente para T.                                                            | Recalcula; o snapshot anterior é preservado.                                                                                                               |

### 2.4 Níveis do alerta

`L` = limite do Fator R (`PLACEHOLDER_FACTOR_R_THRESHOLD`); `A` = limite de atenção, **28,10%** (D13); `FRp` = Fator R projetado. A comparação com `L` é `≥` (D12).

| Nível               | Condição                                      | Comunicação                                                                               |
| ------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `action_available`  | `FRp < L` e prazo não vencido                 | Alerta principal, com quanto falta e até quando.                                          |
| `thin_margin`       | `L ≤ FRp < A`                                 | Atenção: uma receita maior que a estimada pode reverter o enquadramento.                  |
| `comfortable`       | `FRp ≥ A`                                     | Sem alerta; o status aparece no painel.                                                   |
| `insufficient_data` | Algum dado obrigatório `Missing` (seção 2.8)  | Pede os dados que faltam. Não projeta o anexo.                                            |
| `deadline_passed`   | Prazo de ação vencido com `FRp` abaixo de `L` | Informativo: o efeito vale para as competências seguintes; sugere planejar o próximo mês. |

### 2.5 Cálculo da projeção

Notação: `M` = competência aberta, `T` = competência-alvo, `W = windowFor(T)` = meses da janela.

1. **Receita de M projetada:** `R(M) = receita lançada em M + estimativa do restante de M`, com a estimativa **informada pelo usuário** (D13). Sem estimativa, projeta só com o lançado e avisa que o Fator R pode estar superestimado. Qual valor sugerir como padrão (só o lançado ou média dos últimos meses) está em aberto (doc 01, item 4.4). Mostrar sempre a sensibilidade: "se a receita do mês fechar em X, faltarão Y".
2. **Folha de M projetada:** `F(M) = folha já lançada em M + folha prevista e informada para M`, somando todos os itens da folha processada: pró-labore, salários, 13º, férias, FGTS e INSS patronal (D12). Só entra o que o usuário informar.
3. **Bases da janela:** `Folha12 = Σ F(w)` e `Receita12 = Σ R(w)` para `w ∈ W`, consolidadas no CNPJ raiz. Meses fechados usam valores `Informed` ou `Confirmed`. A memória indica o estado de cada mês.
4. **Fator R projetado:** `FRp = Folha12 ÷ Receita12`, com a precisão e o arredondamento da regra (`PLACEHOLDER_FACTOR_R_RATIO_ROUNDING`). Com `Receita12 = 0`, o tratamento é **[A CONFIRMAR]** (e o alerta fica em `insufficient_data` até lá).
5. **Quanto falta na base da folha:** `ΔFolha = max(0, L × Receita12 − Folha12)`. A comparação é `≥` (D12), então atingir exatamente `L` basta.
6. **Conversão para pró-labore bruto:** como os encargos sobre o pró-labore também entram na folha do Fator R (D12), `ΔP = ΔFolha ÷ (1 + e)`, em que `e` é a soma dos encargos que incidem sobre o pró-labore e entram na folha (`PLACEHOLDER_PROLABORE_PAYROLL_CHARGES`). Logo, `ΔP` é menor que `ΔFolha`.
7. **Cenários para T:** com a receita projetada de T (premissa de projeção), calcular RBT12, faixa, alíquota efetiva e DAS estimado em dois cenários:
   - **III:** pró-labore aumentado em `ΔP` (Fator R atinge `L`);
   - **V:** sem aumento.

   Apresentar as alíquotas efetivas (que independem da receita de T) e os DAS estimados (que dependem dela).

8. **Custo estimado do aumento** (premissas, D7 e D14):
   - **custo com pessoal:** `ΔP` mais os encargos que incidem sobre ele (os mesmos que entram nos 28%, D12), sem duplicar o que já está dentro do DAS;
   - **contribuição previdenciária do sócio** sobre `ΔP` (`PLACEHOLDER_PROLABORE_PARTNER_CONTRIBUTION`);
   - **impacto no IRPF do sócio:** IRPF incremental sobre `ΔP` (`PLACEHOLDER_IRPF_TABLE`), comparado com a alternativa de retirar o mesmo valor como lucro (`PLACEHOLDER_PROFIT_DISTRIBUTION_TREATMENT`; se a nova tributação de dividendos entra está em aberto);
   - **deduções para amortizar o IRPF (D14):** quanto o sócio precisaria ter de deduções (dependentes, plano de saúde, educação etc.) para compensar o IRPF incremental, respeitando os limites de cada dedução (`PLACEHOLDER_IRPF_DEDUCTION_RULES`). É uma estimativa para orientar a conversa com a contabilidade, não uma recomendação de despesa;
   - o valor `ΔP` em si não é custo: ele é renda do sócio. O custo é o que incide sobre ele em relação à alternativa.
9. **Efeito líquido estimado:** `(DAS_V − DAS_III) − custo estimado do aumento`, por competência afetada. A economia **não** é multiplicada por 12: cada competência dentro do horizonte é recalculada com suas próprias premissas.
10. **Classificação:** o efeito vira oportunidade `potential` (módulo `opportunities`). Só passa a `validated` após revisão da contabilidade e a `realized` após comprovação (PGDAS-D da competência T conferido).

Todos os passos geram `CalculationStep` na memória, com fórmula, entradas, resultado, regra e arredondamento.

### 2.6 Prazo para agir (D13)

O prazo é o **processamento da folha** da competência em aberto M. Ele varia por empresa: algumas processam dentro do próprio mês, outras no início do mês seguinte (por exemplo, até o 5º dia útil).

- O cadastro da empresa ganha o dado "processamento da folha", com a data ou a regra (por exemplo, "5º dia útil do mês seguinte"). Se ele é fixo ou muda todo mês está em aberto (doc 01, item 4.4).
- O alerta exibe o prazo como data e como contagem regressiva ("faltam 6 dias").
- Sem esse dado, o alerta mostra "prazo a confirmar com a contabilidade", em vez de inventar uma data.

### 2.7 Texto (linguagem cooperativa)

Exemplos para o dicionário pt-BR. Os valores entre chaves vêm do cálculo, e os textos finais serão revisados pelos stakeholders.

**`action_available`**

> **Ainda dá tempo de manter a atividade no Anexo III em {competênciaAlvo}.**
> Com os lançamentos até {dataDados}, o Fator R projetado é de {FRp}. Para atingir {L}, faltam cerca de **{ΔP} de pró-labore** em {competênciaAberta}, até **{prazo}**.
> Cenários estimados para {competênciaAlvo}: Anexo III {DAS_III} × Anexo V {DAS_V}.
> Impacto estimado no seu IRPF: {impactoIRPF}. Deduções (dependentes, saúde, educação) que compensariam esse impacto: cerca de {deducoesNecessarias}.
> Custo estimado do aumento, considerando as premissas: {custo}. Efeito líquido estimado: {efeito}.
> [Ver premissas e memória de cálculo] · [Simular outro valor] · [Compartilhar com a contabilidade]

**`thin_margin`**

> **O Fator R projetado está acima do limite, mas com pouca margem.** Se a receita de {competênciaAberta} passar de {receitaLimite}, a atividade pode ser tributada pelo Anexo V em {competênciaAlvo}. Vale acompanhar os próximos lançamentos.

**`insufficient_data`**

> **Para projetar o Fator R, precisamos de mais algumas informações:** folha de {mesesFaltantes}. Assim que esses dados forem informados, a projeção é atualizada automaticamente.

**`deadline_passed`**

> O prazo considerado para {competênciaAberta} terminou. Que tal planejar o pró-labore das próximas competências? [Abrir simulação]

**Quando o efeito líquido é negativo**

> Com as premissas atuais, aumentar o pró-labore custaria mais do que a redução estimada do DAS. Vale revisar as premissas com a contabilidade.

Vocabulário proibido nos textos: "erro", "falha do contador", "multa garantida", "você deve". Use "revisar", "confirmar", "vale verificar", "estimado".

### 2.8 Dados faltantes

| Dado                                          | Se `Missing`                | Comportamento                                                                                                                                    |
| --------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Folha de algum mês da janela                  | Não calcula `FRp`           | `insufficient_data`, listando os meses. Oferece "simular com um valor hipotético", que gera uma **simulação** marcada como tal, nunca um alerta. |
| Receita de algum mês fechado da janela        | Não calcula `Receita12`     | `insufficient_data`.                                                                                                                             |
| Receita lançada em M                          | Projeção só com a premissa  | Permitido, com aviso "nenhuma receita lançada ainda em {M}".                                                                                     |
| Estimativa do restante de M                   | Projeta só com o lançado    | Aviso: "sem a estimativa de receita do mês, o Fator R pode estar acima do real". Pede a estimativa.                                              |
| Atividade sujeita ao Fator R não confirmada   | Alerta com ressalva         | "Confirme se a atividade {descrição} está sujeita ao Fator R."                                                                                   |
| Data de início de atividade                   | Não calcula                 | `insufficient_data`; o início de atividade muda as janelas.                                                                                      |
| Premissas de custo (encargos, IRPF, deduções) | Calcula `ΔP` e os cenários  | Efeito líquido e deduções necessárias "não estimados", com o motivo.                                                                             |
| Processamento da folha da empresa             | Calcula tudo, menos o prazo | "Prazo a confirmar com a contabilidade."                                                                                                         |
| Deduções que o sócio já tem                   | Calcula o IRPF sem deduções | Mostra as deduções necessárias a partir de zero e pede as existentes.                                                                            |
| Regras não aprovadas para T                   | Não gera alerta em produção | Em ambiente de POC/homologação: alerta com selo "regras em validação".                                                                           |

### 2.9 Ciclo de vida e registro

- Estados: `open` → `acknowledged` (visto) → `resolved` (o `FRp` atingiu o limite após novos lançamentos) | `expired` (prazo vencido) | `dismissed` (com motivo informado).
- Um alerta ativo por empresa, por competência-alvo e por tipo. Recalcular atualiza o alerta e gera um novo snapshot, mantendo o histórico.
- Visível para o Empresário/Gestor e, quando autorizados, para a Contabilidade convidada e o Consultor tributário. Pode ser encaminhado para o fluxo de revisão (módulo `collaboration`).
- Notificação no POC: somente na interface. E-mail e push: **[DECISÃO PENDENTE]** para o MVP.

### 2.10 Parâmetros

**Respondidos pelos stakeholders (D12, D13), aguardando fonte oficial:** comparação `≥` (`PLACEHOLDER_FACTOR_R_COMPARISON`), janela de 12 meses anteriores (`PLACEHOLDER_FACTOR_R_WINDOW`), componentes da folha processada (`PLACEHOLDER_FACTOR_R_PAYROLL_COMPONENTS`), anualização no início de atividade (`PLACEHOLDER_FACTOR_R_START_OF_ACTIVITY`). Limite de atenção de 28,10% e prazo pelo processamento da folha são decisões de produto (D13) e não dependem de fonte.

**Ainda a receber:** `PLACEHOLDER_FACTOR_R_THRESHOLD` (fonte), `PLACEHOLDER_FACTOR_R_RATIO_ROUNDING`, `PLACEHOLDER_PROLABORE_PAYROLL_CHARGES`, `PLACEHOLDER_PROLABORE_PARTNER_CONTRIBUTION`, `PLACEHOLDER_IRPF_TABLE`, `PLACEHOLDER_IRPF_DEDUCTION_RULES`, `PLACEHOLDER_PROFIT_DISTRIBUTION_TREATMENT`, `PLACEHOLDER_ALERT_REMINDER_DAYS`.

## 3. Catálogo de alertas futuros

Cada alerta segue os mesmos princípios: projeção com premissas, dados faltantes explícitos, linguagem cooperativa, snapshot e regra versionada.

| #   | Alerta                                        | Objetivo                                                                                                                                   | Dados necessários                                                                                           | Dependências                                                                                                                                             | Fase     |
| --- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| A1  | **Mudança de faixa iminente**                 | Avisar que o RBT12 da próxima competência mudará de faixa, com o efeito na alíquota efetiva                                                | Histórico de receita, receita parcial do mês                                                                | Tabelas de faixas aprovadas                                                                                                                              | MVP      |
| A2  | **Aproximação de limite ou sublimite**        | Avisar antes de exceder o limite do Simples ou o sublimite estadual/municipal                                                              | Receita acumulada no ano e no RBT12, UF e município                                                         | `revenue-limits` aprovada, regras de sublimite por UF                                                                                                    | MVP      |
| A3  | **Pró-labore ausente**                        | Lembrar de informar a folha/pró-labore da competência antes que falte dado para o Fator R                                                  | Histórico de folha                                                                                          | Alerta de Fator R                                                                                                                                        | MVP      |
| A4  | **Receita sem segregação**                    | Sinalizar receita lançada sem atividade ou tratamento definidos                                                                            | Lançamentos do mês                                                                                          | Modelo de segregação                                                                                                                                     | MVP      |
| A5  | **Divergência recorrente**                    | Detectar o mesmo tipo de divergência em várias competências conferidas (escopo §5.4, "Histórico")                                          | Conferências anteriores                                                                                     | Conferência; volume de competências conferidas                                                                                                           | MVP      |
| A6  | **Retenção de ISS não considerada**           | Indicar receita com retenção de ISS que pode estar sendo tributada integralmente no DAS                                                    | Marcação de retenção; no futuro, NFS-e                                                                      | Cobertura de retenções (hoje `specialist_review_required`); regra aprovada                                                                               | Evolução |
| A7  | **Exportação de serviços não segregada**      | Indicar receita de exportação tributada como receita interna                                                                               | Marcação de exportação; tomador no exterior                                                                 | Cobertura de exportação; regra aprovada                                                                                                                  | Evolução |
| A8  | **Código de serviço (LC 116) × CNAE × anexo** | Verificar a coerência entre o serviço faturado, o CNAE e o anexo aplicado (equivalente a NCM/CFOP para serviços, D2)                       | Itens da NFS-e (código de serviço, município de incidência), CNAEs e descrição da atividade, anexo aplicado | Importação de NFS-e (nacional ou municipal); tabela de correlação código LC 116 → anexo/Fator R validada pelos stakeholders; regras de ISS por município | Evolução |
| A9  | **NCM/CFOP em operações com mercadorias**     | Detectar produtos monofásicos ou com ST tributados integralmente e CFOP incoerente com a operação (D2)                                     | Itens da NF-e (NCM, CFOP, CST/CSOSN, UF de origem e destino), cadastro de produtos                          | Cobertura de mercadorias (Anexos I e II); tabelas de NCM monofásicos e de ST por UF, versionadas por vigência; importação de XML de NF-e                 | Evolução |
| A10 | **Caixa × competência**                       | Comparar o efeito de reconhecimento por caixa ou competência na projeção (escopo §5.4), respeitando as condições da opção                  | Recebimentos e valores a receber                                                                            | Cobertura de regime de caixa (hoje `specialist_review_required`)                                                                                         | Evolução |
| A11 | **Janela de opções anuais**                   | Lembrar de decisões com prazo, como a opção relativa a IBS/CBS a partir de 2027                                                            | Cadastro e opções vigentes                                                                                  | Estrutura IBS/CBS por vigência; orientações oficiais                                                                                                     | Evolução |
| A12 | **Variação atípica de receita**               | Sinalizar lançamento muito fora do padrão, que pode ser erro de digitação ou entrada que não é receita (transferência, empréstimo, aporte) | Histórico de receita                                                                                        | Nenhuma além do histórico                                                                                                                                | MVP      |
