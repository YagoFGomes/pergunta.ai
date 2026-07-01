# FE-704 - Smoke test ponta a ponta

Este smoke valida o fluxo principal do pergunta.ai usando o app Next como entrada:

- pagina de login acessivel
- login via `/api/login/`
- usuario atual via `/api/me/`
- paginas protegidas principais com cookie de auth
- criacao de formulario, pergunta obrigatoria e publicacao
- criacao de lista, contato e template de email
- preview do template
- criacao de campanha, step inicial e agendamento
- leitura de detalhe da campanha, analytics e logs de entrega
- opcionalmente, leitura e submit de uma pesquisa publica por token

## Pre-requisitos

1. Backend Django rodando e acessivel pelo `NEXT_PUBLIC_API_URL` de `.env.local`.
2. App Next rodando, por padrao em `http://localhost:3000`.
3. Usuario existente com tenant ativo.

## Execucao

Bash/zsh:

```bash
SMOKE_EMAIL="user@example.com" SMOKE_PASSWORD="senha" npm run smoke:e2e
```

PowerShell:

```powershell
$env:SMOKE_EMAIL = "user@example.com"
$env:SMOKE_PASSWORD = "senha"
npm.cmd run smoke:e2e
```

Com Bun:

```bash
SMOKE_EMAIL="user@example.com" SMOKE_PASSWORD="senha" bun run smoke:e2e
```

Variaveis opcionais:

- `SMOKE_BASE_URL`: URL do app Next. Default: `http://localhost:3000`.
- `SMOKE_SKIP_PAGES=true`: pula a validacao das paginas protegidas.
- `SMOKE_PUBLIC_SURVEY_TOKEN`: token existente de `CampaignRecipient` para validar `/api/public/surveys/{token}`.
- `SMOKE_SUBMIT_PUBLIC_SURVEY=true`: envia respostas para o token publico informado.

## Observacoes

O script cria dados reais no tenant autenticado, todos prefixados com `FE704`.

O submit publico e opt-in porque o token de pesquisa publica normalmente e de uso unico. Use `SMOKE_SUBMIT_PUBLIC_SURVEY=true` apenas com um token descartavel.

Se `SMOKE_PUBLIC_SURVEY_TOKEN` nao for informado, o smoke ainda cobre o fluxo autenticado completo e deixa a etapa publica marcada como pulada.
