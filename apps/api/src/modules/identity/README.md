# Módulo `identity`

Usuários, perfis (Empresário/Gestor, Contabilidade convidada, Consultor tributário, Administrador), autenticação via Cognito e contexto de autorização por empresa.

Estrutura interna (criada conforme o módulo ganha código):

- `domain/`: entidades, value objects e regras do módulo. Não importa `infrastructure/` nem `http/`.
- `application/`: casos de uso; orquestra domínio, repositórios e o motor tributário.
- `infrastructure/`: repositórios Kysely, filas SQS, S3.
- `http/`: rotas, validação Zod de entrada e saída.
- `index.ts`: API pública do módulo. Outros módulos importam somente daqui.
