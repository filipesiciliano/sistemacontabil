# CRIVO | Escopo de Produto

**Ferramenta de inteligência tributária: escopo do produto e diretrizes para desenvolvimento**
Versão inicial para discussão | Crivo Soluções Empresariais

> Documento original dos stakeholders, transcrito sem alterações de conteúdo. Discussões, análises e decisões ficam em documentos separados em `docs/`.
>
> **Nota:** "Crivo" (Crivo Soluções Empresariais) é o escritório de contabilidade de um dos stakeholders, autor deste escopo. Não é o nome da plataforma, que ainda não foi definido.

## Proposta central

Plataforma de conferência e planejamento tributário que dá clareza sobre os tributos da empresa, confere a apuração e identifica oportunidades legais de economia, com memória de cálculo e fundamentação.

A linguagem deve ser acessível ao empresário e as informações técnicas devem permitir à contabilidade reproduzir e revisar cada resultado. O produto deve favorecer a colaboração entre empresa e contador.

**Promessa verificável:** identificar a menor carga entre os cenários legalmente aplicáveis que a ferramenta conseguir analisar, considerando os dados fornecidos. A conclusão depende da qualidade das informações e da cobertura tributária implementada.

---

## 1. Definição do produto

**Público inicial:** microempresas e empresas de pequeno porte optantes pelo Simples Nacional, inicialmente fora do SIMEI. Expansão futura para outros regimes.

**Formato recomendado:** plataforma web responsiva, acessível pelo computador e pelo celular.

| Perfil | Necessidade e acesso |
|---|---|
| Empresário ou gestor | Alimentar dados, entender os impostos, consultar resultados e convidar a contabilidade. |
| Contabilidade convidada | Revisar dados, analisar divergências, justificar tratamentos e registrar conclusões. |
| Consultor tributário | Analisar empresas autorizadas, revisar oportunidades e emitir pareceres. |
| Administrador | Gerenciar acessos, configurações e versões das regras tributárias. |

O acesso da contabilidade depende de convite e autorização da empresa.

## 2. Problemas que o produto resolve

O empresário recebe a guia, mas frequentemente não consegue visualizar como o imposto foi calculado, quais receitas e tratamentos foram considerados e como alterações operacionais legítimas afetariam o resultado.

A ferramenta organiza três entregas: **conferência do período**, **identificação de oportunidades** e **projeção tributária**, incluindo os efeitos sobre o caixa e a competitividade.

---

## 3. Jornada principal do usuário

1. **Cadastrar a empresa.** Informar cadastro, atividades efetivamente exercidas e características da operação.
2. **Informar o histórico.** Preencher receitas e, quando necessário, folha e encargos dos períodos exigidos.
3. **Preencher a competência.** Registrar faturamento, recebimentos, segregações e demais informações aplicáveis.
4. **Anexar a apuração recebida.** Incluir declaração ou demonstrativo do PGDAS-D e DAS.
5. **Revisar os dados.** Confirmar informações digitadas ou extraídas dos documentos.
6. **Executar a conferência.** Calcular o valor esperado e comparar com a apuração apresentada.
7. **Analisar oportunidades.** Consultar condições, evidências necessárias e efeitos financeiros.
8. **Encaminhar para revisão.** Compartilhar com a contabilidade e acompanhar a conclusão.

Simulações podem ser realizadas sem a apuração da contabilidade. A conferência comparativa exige dados suficientes dos dois lados.

## 4. Dados necessários

| Grupo | Informações |
|---|---|
| Cadastro | CNPJ, abertura, início de atividade, opção pelo Simples, UF, município e estabelecimentos. |
| Atividades | CNAEs e descrição prática dos serviços ou produtos vendidos. |
| Histórico e período | Receitas mensais por competência e valores do período segregados por atividade e tratamento. |
| Recebimentos | Valores recebidos e controle de valores a receber, quando aplicável ao regime de caixa. |
| Folha | Remunerações, pró-labore e encargos elegíveis, com períodos e pagamentos identificados. |
| Tratamentos específicos | Retenções, substituição tributária, monofásicos, exportações e demais casos habilitados. |
| Apuração e evidências | PGDAS-D, principal e composição do DAS, acréscimos, notas fiscais, relatórios, folha e comprovantes. |

### Regras de entrada dos dados

- O formulário deve ser adaptativo e solicitar dados conforme as operações identificadas.
- Informação ausente não pode ser interpretada automaticamente como zero.
- O CNAE auxilia a análise, mas não determina sozinho o tratamento tributário.
- Extrato bancário não deve ser convertido automaticamente em faturamento. Transferências, empréstimos, aportes e outras entradas precisam ser distinguidos de receitas.
- Dados extraídos automaticamente devem ser confirmados antes do cálculo definitivo.

---

## 5. Módulos funcionais

### 5.1 Cadastro e diagnóstico de cobertura

Antes do cálculo, verificar se a ferramenta consegue atender à empresa e à competência. A resposta deve ser uma das seguintes:

| Resultado | Comportamento |
|---|---|
| Atendido | Operações e regras contempladas. |
| Atendido parcialmente | Cálculo disponível somente para parte da situação, com limitações identificadas. |
| Revisão especializada necessária | Situação que impede conclusão automática. |

Esse diagnóstico impede que um cálculo apresentado como completo deixe de considerar uma operação relevante.

### 5.2 Motor de cálculo tributário

Executar regras matemáticas e tributárias de forma determinística, com parâmetros versionados. O escopo deve prever:

- Receita acumulada e regras para início de atividade.
- Anexos aplicáveis, faixas, alíquotas e parcelas a deduzir.
- Fator R, quando aplicável, e segregação das receitas.
- Repartição por tributo e tratamentos específicos suportados.
- Verificação de limites e sublimites e memória de cálculo por competência.

O Manual do PGDAS-D apresenta a fórmula da alíquota efetiva e exemplos por atividade. Essa estrutura deve orientar a implementação e os testes, incluindo tratamentos específicos. [1]

> **Decisão técnica:** inteligência artificial poderá auxiliar na leitura de documentos e na explicação dos resultados. O valor do imposto será produzido pelo motor de regras aprovado.

### 5.3 Conferência da apuração

| Item | Comparação |
|---|---|
| Receita mensal | Valores informados e declarados. |
| Histórico | Receitas utilizadas no cálculo acumulado. |
| Atividade | Enquadramento e anexo considerados. |
| Fator R | Bases, período e resultado. |
| Segregação | Distribuição das receitas entre tratamentos. |
| Tributos e DAS | Composição, valores, principal, acréscimos e ajustes identificados. |

O resultado deve apresentar: valor apresentado, valor calculado, diferença, possível causa e providência sugerida.

Uma diferença é inicialmente uma divergência a esclarecer: pode decorrer de dados incompletos, ajustes ou interpretações que precisam de exame. O DAS isolado permite comparar valores, mas pode ser insuficiente para explicar a causa; o demonstrativo detalhado da apuração é importante.

### 5.4 Inteligência de economia tributária

Cada oportunidade deve apresentar situação identificada, dados e documentos de suporte, regra e vigência, cenários atual e alternativo, economia estimada, custos adicionais, condições de implementação e necessidade de validação profissional.

| Frente | Análise |
|---|---|
| Fator R | Projetar enquadramento de atividades sujeitas à regra. |
| Segregação de receitas | Identificar tratamentos potencialmente não aproveitados. |
| Atividades exercidas | Conferir compatibilidade entre operação real e tratamento. |
| Caixa e competência | Comparar efeitos financeiros, respeitando as condições da opção. |
| Histórico | Buscar divergências recorrentes nos períodos cobertos. |
| Crescimento | Projetar efeitos do aumento de receita e mudanças de faixa. |

No planejamento de folha ou pró-labore, considerar o efeito econômico total, incluindo encargos e impactos na pessoa física quando pertinentes. A redução do DAS, sozinha, não demonstra vantagem.

#### Classificação dos benefícios

| Classificação | Critério |
|---|---|
| Economia potencial | Cenário sujeito a validação. |
| Economia validada | Oportunidade aprovada após revisão. |
| Economia realizada | Benefício efetivamente comprovado. |

Postergação de pagamento deve aparecer como benefício de caixa, separada da redução definitiva de tributos.

### 5.5 Projeção de caixa e competitividade

Simular faturamento futuro, distribuição das receitas por atividade, evolução da folha, impostos mensais, alíquota efetiva e efeito tributário sobre margem e preço.

Toda projeção deve explicitar premissas e horizonte. A economia mensal não deve ser multiplicada por doze como se fosse constante sem recalcular os períodos futuros.

### 5.6 Colaboração com a contabilidade

**Fluxo de acompanhamento:** identificada → em revisão → aguardando documentos → concluída. Registrar responsável, data, comentários e evidências.

**Conclusões possíveis:** apuração mantida com justificativa; dados da ferramenta corrigidos; ajuste da apuração recomendado; oportunidade aprovada; análise inconclusiva.

A linguagem deve estimular cooperação. Exemplo: "revisar o tratamento desta receita".

### 5.7 Painel e relatórios

O painel deve mostrar competência, cobertura e pendências dos dados, tributo calculado e apresentado, divergências, oportunidades em revisão, economia validada e realizada e projeção de desembolso.

Os relatórios exportáveis devem incluir resumo executivo, memória de cálculo, premissas, fontes normativas, limitações e histórico de revisão.

> **Diretriz de experiência:** o empresário deve conseguir compreender o resultado principal e abrir o detalhamento quando necessário. A contabilidade deve conseguir localizar os dados de origem e reproduzir a análise.

---

## 6. Recorte recomendado para o MVP

Começar por **prestadores de serviços com operações nacionais e tratamentos delimitados**, contemplando **Anexo III** e atividades sujeitas ao **Fator R**.

Esse recorte valida a experiência do empresário, a conferência e uma frente relevante de planejamento antes de incorporar a complexidade das operações com mercadorias.

| Entra no MVP | Evolução posterior |
|---|---|
| Cadastro e diagnóstico de cobertura | Consulta cadastral integrada. |
| Entrada manual e planilha padrão | Integrações com sistemas fiscais e contábeis. |
| Histórico de receita e folha | Importação automatizada de documentos fiscais. |
| Cálculo dos cenários de serviços habilitados | Comércio, indústria e demais tratamentos. |
| Fator R e simulações relacionadas | Catálogo ampliado de oportunidades. |
| Comparação com dados do PGDAS-D | Extração automática de múltiplos modelos. |
| Memória de cálculo e relatório | Revisão histórica em escala. |
| Convite à contabilidade | Gestão avançada de carteira. |
| Projeção tributária básica | Comparação entre regimes. |

### Fora do MVP

Transmissão de declarações, emissão oficial de DAS, retificação automática, pedidos de restituição ou compensação, cálculo completo de folha e atendimento irrestrito a todas as operações do Simples.

Anexo IV, exportações, retenções e situações especiais precisam ter cobertura expressamente definida. Quando não implementados, devem gerar bloqueio ou análise parcial.

### Delimitação antes do orçamento

A matriz de cobertura deve identificar cada operação atendida, os dados exigidos, as regras implementadas, o comportamento em caso de exceção e o responsável pela validação. Os formatos de importação também precisam ser definidos antes de fechar prazo e custo.

---

## 7. Arquitetura proposta

Recomenda-se um **monólito modular**, com separação entre os seguintes componentes:

| Componente | Responsabilidade |
|---|---|
| Interface web | Cadastro, preenchimento, conferência e simulação. |
| API da aplicação | Usuários, empresas, permissões e fluxos. |
| Motor tributário | Cálculos e aplicação das regras. |
| Catálogo normativo | Fontes, parâmetros, vigências e versões. |
| Processamento de documentos | Importação, extração e validação. |
| Banco relacional | Dados estruturados e histórico. |
| Armazenamento de arquivos | Documentos e evidências. |
| Processamento assíncrono | Importações e relatórios demorados. |

Valores monetários devem utilizar precisão decimal. Cada cálculo precisa guardar uma fotografia dos dados de entrada e a versão das regras utilizada.

O modelo deve permitir vários estabelecimentos e consolidar dados quando exigido, evitando tratar cada filial como empresa independente em todos os cálculos.

## 8. Governança tributária e segurança

A manutenção das regras é parte permanente do produto. Cada regra deverá conter identificação, fonte oficial, vigência, abrangência, responsável, testes e aprovação para publicação. Alterações futuras não poderão modificar silenciosamente análises históricas.

- Separação dos dados de cada empresa e permissões por perfil.
- Autenticação reforçada para acessos privilegiados.
- Criptografia, backups e testes de restauração.
- Registro de alterações e política de retenção e exclusão de documentos.
- Tratamento de dados pessoais compatível com a LGPD.

A arquitetura deve comportar a evolução de IBS e CBS, com regras por vigência e cobertura explícita. A Receita publicou orientações para empresas do Simples que optem pelo regime regular desses tributos. [2]

---

## 9. Critérios de aceite

1. Reproduzir os casos de referência aprovados pelo responsável tributário, segundo critérios documentados de precisão e arredondamento.
2. Explicar cada valor por memória de cálculo.
3. Impedir conclusão definitiva quando faltar dado obrigatório.
4. Identificar operações fora da cobertura.
5. Separar principal e acréscimos na comparação.
6. Preservar versões anteriores após alterações.
7. Impedir acesso entre empresas sem autorização.
8. Permitir revisão e conclusão pela contabilidade.
9. Diferenciar oportunidade estimada de economia comprovada.
10. Passar por testes de início de atividade, mudanças de faixa, meses sem receita, limites do Fator R e inconsistências de importação.

O piloto deverá utilizar casos anonimizados e autorizados, incluindo situações sem divergências e casos com diferenças previamente conhecidas.

## 10. Etapas de desenvolvimento

| Etapa | Entrega |
|---|---|
| Descoberta | Público inicial, operações atendidas e critérios de cobertura. |
| Especificação tributária | Regras, dados, fórmulas e casos de referência. |
| Protótipo navegável | Jornada validada com empresários e contadores. |
| Motor de cálculo | Cálculo independente da interface, com testes. |
| Plataforma MVP | Cadastro, importação, conferência, oportunidades e relatórios. |
| Piloto controlado | Validação dos resultados e da experiência. |
| Lançamento | Operação, suporte e atualização normativa. |

Orçamento e cronograma devem ser fechados após definir a matriz de cobertura tributária e os formatos de importação, que concentram grande parte da complexidade.

---

## Referências

As referências abaixo correspondem às fontes consultadas na elaboração do escopo. Antes da implementação, a equipe tributária deverá confirmar as versões vigentes para cada competência atendida.

1. **Manual do PGDAS-D e DEFIS**, Receita Federal do Brasil. Referência para estrutura de apuração, alíquota efetiva, repartição de tributos e exemplos por atividade.
2. **Simples Nacional 2027 e IBS e CBS**, Receita Federal do Brasil. Orientações sobre as decisões relativas ao Simples Nacional e à opção pelo regime regular de IBS e CBS.

**Material oficial complementar:** Perguntas e Respostas do Simples Nacional.

> Os links das fontes não vieram no texto extraído do PDF e devem ser adicionados.

## Diretriz para a execução

Este documento define o escopo inicial para apresentação e discussão com a equipe de desenvolvimento. A implementação depende do detalhamento da matriz de cobertura, do catálogo de regras e dos casos de referência.

**Diferencial do produto:** entregar uma análise que o empresário compreenda e a contabilidade consiga reproduzir: o que foi calculado, por que existe uma diferença e quais ações podem gerar benefício econômico comprovável.
