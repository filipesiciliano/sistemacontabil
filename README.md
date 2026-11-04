# Plataforma de inteligência tributária (nome a definir)

Conferência, oportunidades e projeção tributária para empresas do Simples Nacional, com **alertas preditivos durante a competência**.

> O nome do produto ainda não foi definido (D11). Os pacotes usam `@platform/*`, e o nome exibido vem de uma única constante (`PRODUCT_NAME`).

## Documentação

| Documento                                                            | Conteúdo                                                            |
| -------------------------------------------------------------------- | ------------------------------------------------------------------- |
| [`docs/00-escopo-stakeholders.md`](docs/00-escopo-stakeholders.md)   | Escopo original dos stakeholders (fonte da verdade, não editar)     |
| [`docs/01-analise-inicial.md`](docs/01-analise-inicial.md)           | Problema, glossário, regras do recorte, lacunas, riscos e perguntas |
| [`docs/02-arquitetura-proposta.md`](docs/02-arquitetura-proposta.md) | Arquitetura, trade-offs e decisões pendentes                        |
| [`docs/03-matriz-cobertura.md`](docs/03-matriz-cobertura.md)         | Matriz de cobertura v0.1                                            |
| [`docs/04-registro-de-decisoes.md`](docs/04-registro-de-decisoes.md) | Decisões D1–D19 (ADR resumido)                                      |
| [`docs/05-alertas-preditivos.md`](docs/05-alertas-preditivos.md)     | Alerta de Fator R e catálogo de alertas futuros                     |
| [`docs/06-roadmap.md`](docs/06-roadmap.md)                           | POC → MVP → evolução, com dependências                              |
| [`docs/07-casos-de-referencia.md`](docs/07-casos-de-referencia.md)   | Formato dos casos, critérios de precisão e cenários                 |
| [`CLAUDE.md`](CLAUDE.md)                                             | Convenções e princípios de desenvolvimento                          |

## Começando

Requisitos: Node.js 22+ e pnpm 10+.

```bash
pnpm install
```

```bash
pnpm lint && pnpm typecheck && pnpm test
```

Testes de integração da API (exigem Docker):

```bash
pnpm test:integration
```
