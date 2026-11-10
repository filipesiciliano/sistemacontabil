# 07 · Casos de referência

> Os casos de referência são o **gabarito do motor** (D3; escopo §9, critério de aceite 1). Eles são fornecidos pelos responsáveis tributários (os dois stakeholders), anonimizados e autorizados.

## 1. Como enviar um caso

1. Copie `packages/tax-engine/test/reference-cases/_template.json` para `RC-<número>.json` (por exemplo, `RC-001.json`). Se preferir, envie uma planilha ou um documento com os mesmos campos, e a equipe de desenvolvimento faz a transcrição para revisão de vocês.
2. Preencha as **entradas**, o **PGDAS-D apresentado** e o **resultado esperado** (seção 2).
3. Anexe o demonstrativo do PGDAS-D e o DAS **anonimizados** (sem CNPJ, nome, endereço ou dados de sócios). Os arquivos ficam fora do repositório, em local combinado.
4. O caso entra por PR com `approval.status = "draft"`. Depois da conferência dos stakeholders, passa a `"approved"`, com `approvedBy` e `approvedAt`.
5. O teste `reference-cases.test.ts` valida o formato. Quando o motor existir, todo caso `approved` precisa ser reproduzido dentro dos critérios da seção 3.

### 1.1 Checklist de anonimização

- [ ] Nenhum CNPJ, CPF, razão social, nome fantasia, nome de sócio ou endereço.
- [ ] Município e UF mantidos apenas se forem relevantes para a regra (ISS, sublimite).
- [ ] Valores reais podem ser mantidos (são necessários para o gabarito), desde que não identifiquem a empresa.
- [ ] Autorização do cliente para uso anonimizado registrada pelo escritório.

## 2. Formato

Todos os valores monetários e alíquotas são **strings decimais com ponto** (`"12345.67"`). Alíquotas são **frações** (`"0.1234"` para 12,34%). Um dado não disponível é `"missing"`, nunca `"0"`. Zero só significa zero.

### 2.1 Identificação

| Campo        | Descrição                                                               |
| ------------ | ----------------------------------------------------------------------- |
| `caseId`     | `RC-<número>`, igual ao nome do arquivo.                                |
| `title`      | Descrição curta do caso.                                                |
| `scenarios`  | Um ou mais cenários da lista mínima (seção 4).                          |
| `anonymized` | Sempre `true`.                                                          |
| `providedBy` | Identificador do stakeholder que enviou (por exemplo, `stakeholder-a`). |
| `approval`   | `status` (`draft`/`approved`), `approvedBy`, `approvedAt`.              |
| `competence` | Competência apurada (`AAAA-MM`).                                        |

### 2.2 Entradas

| Campo                        | Descrição                                                                                                                                                                                  |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `company.activityStart`      | Data de início de atividade (`AAAA-MM-DD`).                                                                                                                                                |
| `company.simplesOptionStart` | Data de início da opção pelo Simples.                                                                                                                                                      |
| `company.establishments[]`   | `establishmentId` (fictício), `isHeadquarters`, `uf`, `municipality`.                                                                                                                      |
| `company.activities[]`       | `cnae`, `description` (atividade efetivamente exercida), `subjectToFactorR`.                                                                                                               |
| `revenueHistory[]`           | Receita de cada competência anterior: `competence`, `establishmentId`, `cnae`, `treatment` (`standard` no recorte), `amount`. Cobrir todos os meses necessários ao RBT12.                  |
| `payrollHistory[]`           | Folha de cada competência da janela do Fator R: `proLabore`, `salaries`, `otherComponents` (por exemplo, `{"fgts": "..."}`). Informar exatamente como o escritório considerou na apuração. |
| `currentPeriodRevenue[]`     | Receita da competência apurada, segregada como no PGDAS-D.                                                                                                                                 |

### 2.3 PGDAS-D apresentado (`declared`)

Transcrição do demonstrativo: `rbt12`, `factorR` (ou `"missing"` se não aplicável), `annex`, `effectiveRate`, `taxes` (valor por tributo: `IRPJ`, `CSLL`, `COFINS`, `PIS_PASEP`, `CPP`, `ISS`), `principal`, `additions` (`fine`, `interest`) e `total`.

### 2.4 Resultado esperado (`expected`)

O que o motor deve produzir, segundo o responsável tributário. A comparação é sempre pelo principal (D21): `differenceToDeclared.additions` é só informativo.

Campos: `coverage`, `rbt12`, `factorR`, `annex`, `bracket`, `effectiveRate`, `taxes`, `principal`, `differenceToDeclared` (`principal` e `additions`) e `notes` (explicação, especialmente para divergências conhecidas: causa e providência esperadas).

## 3. Critérios de precisão e arredondamento **[A ACORDAR]**

> Rodada 1: os stakeholders não souberam informar a regra de arredondamento do PGDAS-D. Por isso, os casos de referência com PGDAS-D real passam a ser também a fonte para **descobrir** a política de arredondamento (D15). Quanto mais casos, com centavos reais, melhor.

O critério de aceite 1 exige critérios documentados. Proposta para o debate. Nenhum item está decidido.

| #   | Etapa                     | Pergunta                                                             | Proposta inicial                                                                                                                                                         |
| --- | ------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P1  | Cálculo intermediário     | Precisão interna                                                     | `Decimal` com 50 dígitos significativos, sem arredondar etapas intermediárias, salvo quando a regra oficial mandar.                                                      |
| P2  | RBT12                     | Arredonda?                                                           | Soma exata dos valores informados (centavos).                                                                                                                            |
| P3  | Alíquota efetiva          | Casas decimais e modo (arredondar ou truncar) aplicados pelo PGDAS-D | Os stakeholders não souberam informar (D15). Derivar dos casos reais e do Manual do PGDAS-D, depois validar com eles.                                                    |
| P4  | Fator R                   | Precisão da razão antes da comparação com o limite                   | **Fonte oficial (D25):** duas casas decimais, sem arredondamento (desde 04/2018). 27,99% → 0,27 → Anexo V; 28,00% → 0,28 → Anexo III.                                    |
| P5  | Valor por tributo         | Cada tributo arredondado separadamente? Modo?                        | Os exemplos 4 e 5 do Manual do PGDAS-D batem com **meio para cima, 2 casas, por tributo**, com a alíquota efetiva em precisão total. Confirmar com os casos reais (D15). |
| P6  | Total do DAS              | Soma dos tributos arredondados ou arredondamento do total?           | Nos exemplos do manual, o total é a soma dos tributos arredondados. Confirmar com os casos reais (D15).                                                                  |
| P7  | Tolerância da conferência | Diferença aceita sem apontar divergência                             | **Provisório (D15):** até R$ 0,01 por tributo aparece como "possível diferença de arredondamento", em nível informativo. Revisar quando houver casos suficientes.        |
| P8  | Aceite do motor           | Quando um caso conta como reproduzido                                | Todos os campos de `expected` iguais, após aplicar a política acordada; nenhuma tolerância adicional.                                                                    |

Mecanismo já implementado: `applyRounding(value, { decimalPlaces, mode })` com os modos `half_up`, `half_even` e `truncate`, testado em `packages/shared-types/test/rounding-policy.test.ts`. A política de cada etapa será registrada como parâmetro das regras, com fonte.

## 4. Lista mínima de cenários

| Cenário (`scenarios`)   | O que o caso precisa demonstrar                                                          | Observações                                                                |
| ----------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `no_divergence`         | Apuração correta: calculado = apresentado.                                               | Pelo menos um caso para o Anexo III sem Fator R e um com Fator R.          |
| `known_divergence`      | Diferença previamente conhecida, com causa e providência descritas em `notes`.           | Separar a diferença de principal e a de acréscimos (critério de aceite 5). |
| `start_of_activity`     | Empresa com menos de 12 meses de atividade: RBT12 proporcionalizado e Fator R no início. | Idealmente dois casos: primeiro mês e um mês intermediário.                |
| `bracket_change`        | Competência em que o RBT12 muda de faixa em relação à anterior.                          | Incluir as duas competências consecutivas, se possível.                    |
| `month_without_revenue` | Competência com receita zero informada (e não ausente).                                  | Deve mostrar o efeito no RBT12 das competências seguintes.                 |
| `factor_r_27_99`        | Fator R logo abaixo do limite (27,99%) → Anexo V.                                        | Mesma empresa do próximo cenário, de preferência.                          |
| `factor_r_28_00`        | Fator R exatamente no limite (28,00%) → anexo conforme a regra.                          | Define o critério de comparação e de precisão (P4).                        |

Cenários desejáveis para depois: vários estabelecimentos no mesmo município e em municípios diferentes; atividade do Anexo IV junto com o Anexo III (para validar `partially_covered`); receita com retenção de ISS (para validar `specialist_review_required`); mês com folha ausente (para validar o bloqueio da conclusão); casos para o alerta de Fator R com a competência em aberto e o resultado real da competência seguinte.

## 5. Uso no desenvolvimento

- Fixtures em `packages/tax-engine/test/reference-cases/`, validadas por `ReferenceCaseSchema` (`packages/tax-engine/src/reference-case/reference-case.schema.ts`).
- Toda regra `approved` no catálogo precisa listar em `referenceCaseIds` os casos que a exercitam (verificado por `validateCatalog`).
- Mudanças no formato exigem atualizar o schema, o template e este documento no mesmo PR.
