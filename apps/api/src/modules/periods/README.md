# Módulo `periods`

Histórico de receita e folha/pró-labore, competência em aberto com lançamentos parciais e confirmação dos dados (Missing / Informed / Confirmed).

Estrutura interna (criada conforme o módulo ganha código):

- `domain/`: entidades, value objects e regras do módulo. Não importa `infrastructure/` nem `http/`.
- `application/`: casos de uso; orquestra domínio, repositórios e o motor tributário.
- `infrastructure/`: repositórios Kysely, filas SQS, S3.
- `http/`: rotas, validação Zod de entrada e saída.
- `index.ts`: API pública do módulo. Outros módulos importam somente daqui.
