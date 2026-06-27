# Plano de Implementacao Frontend - pergunta.ai

Status: Proposto
Data: 2026-06-27
Escopo: MVP ponta a ponta (dashboard interno + pagina publica de resposta)

## 1. Objetivo

Implementar o frontend SaaS de pesquisas de satisfacao totalmente integrado ao backend ja exposto via OpenAPI/Orval, cobrindo:

- gestao de formularios (surveys)
- gestao de listas e contatos
- templates de email
- criacao e operacao de campanhas
- resposta publica sem login
- analytics e acompanhamento de entregas

## 2. Base Tecnica Ja Disponivel

- Next.js App Router + TypeScript + TanStack Query + sistema de formularios tipado
- cliente API gerado por Orval (hooks e tipos)
- infraestrutura de navegacao e RBAC no client
- pagina de Kanban pronta para organizar execucao

## 3. Fluxo Funcional do Produto (Inicio ao Fim)

1. Usuario cria/ajusta framework (opcional) e formulario.
2. Usuario adiciona perguntas e opcoes, publica formulario.
3. Usuario cria lista de contatos e importa/cadastra contatos.
4. Usuario cria template de email e testa preview.
5. Usuario cria campanha vinculando formulario + lista + template.
6. Usuario agenda/dispara campanha e acompanha status.
7. Respondente recebe link publico e envia respostas.
8. Time acompanha metricas e logs de entrega no dashboard.
9. Operador pausa/retoma/cancela campanha conforme necessidade.

## 4. Telas a Criar (Mapa de Navegacao)

### 4.1 Surveys

- /dashboard/surveys/forms
  - listagem de formularios
  - filtros por status (draft/published/archived)
  - acao criar, duplicar (futuro), publicar, arquivar
- /dashboard/surveys/forms/new
  - cadastro base de formulario
- /dashboard/surveys/forms/[id]
  - edicao de metadados
  - status e informacoes de uso
- /dashboard/surveys/forms/[id]/questions
  - CRUD de perguntas
  - reorder drag-and-drop
  - CRUD de opcoes para perguntas objetivas
- /dashboard/surveys/frameworks
  - listagem e CRUD de frameworks (NPS/CSAT/CES/CSI/custom)

### 4.2 Contatos

- /dashboard/contacts/lists
  - CRUD listas
  - total de contatos validos/invalidos
- /dashboard/contacts/lists/[id]/contacts
  - CRUD contatos por lista
  - busca, filtros, paginacao
  - importacao em lote (fase posterior)

### 4.3 Templates de Email

- /dashboard/email-templates
  - listagem + CRUD templates
- /dashboard/email-templates/[id]/edit
  - editor de assunto/corpo
  - validacao de placeholders
  - preview com payload exemplo

### 4.4 Campanhas

- /dashboard/campaigns
  - listagem, filtros por status
  - criar campanha
- /dashboard/campaigns/new
  - wizard de criacao:
    1) dados gerais
    2) vincular formulario
    3) vincular lista
    4) vincular template
    5) resumo e confirmar
- /dashboard/campaigns/[id]
  - detalhes e funil de execucao
  - timeline de steps
  - acoes: pausar, retomar, cancelar, agendar
- /dashboard/campaigns/[id]/steps
  - listagem de steps
  - criar/editar step

### 4.5 Analytics e Operacao

- /dashboard/analytics/overview
  - cards principais
  - filtro por periodo, campanha, formulario
- /dashboard/analytics/nps
- /dashboard/analytics/csat
- /dashboard/analytics/ces
- /dashboard/analytics/csi
- /dashboard/analytics/campaigns/[id]
- /dashboard/analytics/forms/[id]
- /dashboard/delivery/logs
  - logs de envio e falhas

### 4.6 Pagina Publica

- /s/[token]
  - render do formulario publico
  - submit de respostas
  - feedback de sucesso/erro

## 5. Fases de Implementacao

## Fase 1 - Fundacao de Produto (1 sprint)

Objetivo: preparar base de integracao e navegacao para modulos de negocio.

Entregas:

- limpar itens de demo da nav e adicionar grupos de negocio
- criar shell das novas rotas com loading/error states
- padronizar camada API por feature (queries/mutations por modulo)
- padrao de tabelas + filtros + paginacao reutilizavel
- padrao de formularios (schema, constants, components)

Definicao de pronto:

- todas as rotas principais acessiveis
- sem dados mock nos novos modulos
- erros de API tratados com feedback visual

## Fase 2 - Surveys (1 sprint)

Objetivo: permitir criacao e publicacao de formularios.

Entregas:

- CRUD de formularios
- CRUD de perguntas
- CRUD de opcoes
- reorder de perguntas
- publicar/arquivar formulario
- CRUD de frameworks

Definicao de pronto:

- usuario cria formulario completo e publica sem usar API manual

## Fase 3 - Contatos + Templates (1 sprint)

Objetivo: preparar insumos para campanha.

Entregas:

- CRUD listas de contatos
- CRUD contatos por lista
- CRUD templates
- preview de template

Definicao de pronto:

- usuario consegue montar lista valida e template pronto para envio

## Fase 4 - Campanhas (1 sprint)

Objetivo: fechar workflow principal de envio.

Entregas:

- listagem de campanhas
- wizard de criacao
- detalhes de campanha
- CRUD de steps
- acoes operacionais: schedule/pause/resume/cancel

Definicao de pronto:

- campanha criada no frontend e controlada integralmente pela interface

## Fase 5 - Resposta Publica + Analytics (1 sprint)

Objetivo: fechar ciclo resposta -> insight.

Entregas:

- pagina publica de resposta por token
- submit publico
- dashboards de overview e metricas (NPS/CSAT/CES/CSI)
- analytics por formulario/campanha
- logs de entrega

Definicao de pronto:

- ciclo ponta a ponta funcionando em ambiente de homologacao

## Fase 6 - Hardening e Go-live (1 sprint)

Objetivo: estabilizar e liberar.

Entregas:

- estados de vazio/erro/carga em todas as telas
- observabilidade de erros frontend
- revisao de UX (desktop/mobile)
- documentacao de operacao
- smoke test funcional do fluxo completo

Definicao de pronto:

- release candidate aprovado para producao

## 6. Backlog Kanban Sugerido

Formato de colunas:

- Backlog
- To Do
- In Progress
- Review
- Done

## Epic FE-01 - Platform Foundation

- FE-001 Configurar navegacao final de produto
- FE-002 Criar estrutura de rotas dos modulos (surveys/contacts/templates/campaigns/analytics)
- FE-003 Criar wrappers de tabela padrao com filtros e paginacao
- FE-004 Criar padrao de formulario por feature (schema/constants/components)
- FE-005 Padronizar tratamento de erro e notificacoes

## Epic FE-02 - Surveys

- FE-101 Listar formularios
- FE-102 Criar formulario
- FE-103 Editar formulario
- FE-104 Publicar formulario
- FE-105 Arquivar formulario
- FE-106 Listar e criar perguntas
- FE-107 Editar/remover perguntas
- FE-108 Reordenar perguntas
- FE-109 Gerenciar opcoes de perguntas
- FE-110 CRUD frameworks

## Epic FE-03 - Contatos

- FE-201 CRUD listas de contatos
- FE-202 Listar contatos por lista
- FE-203 Criar/editar/remover contato
- FE-204 Busca e filtros de contatos

## Epic FE-04 - Email Templates

- FE-301 Listar templates
- FE-302 Criar template
- FE-303 Editar template
- FE-304 Excluir template
- FE-305 Preview de template

## Epic FE-05 - Campanhas

- FE-401 Listar campanhas
- FE-402 Wizard criar campanha (5 passos)
- FE-403 Tela detalhes da campanha
- FE-404 Listar steps da campanha
- FE-405 Criar/editar/remover step
- FE-406 Agendar campanha
- FE-407 Pausar campanha
- FE-408 Retomar campanha
- FE-409 Cancelar campanha

## Epic FE-06 - Public Survey

- FE-501 Render formulario publico por token
- FE-502 Validacoes de preenchimento
- FE-503 Submissao publica de respostas
- FE-504 Tela de confirmacao de envio

## Epic FE-07 - Analytics e Operacao

- FE-601 Dashboard overview
- FE-602 Dashboard NPS
- FE-603 Dashboard CSAT
- FE-604 Dashboard CES
- FE-605 Dashboard CSI
- FE-606 Analytics por campanha
- FE-607 Analytics por formulario
- FE-608 Logs de envio

## Epic FE-08 - Quality Gate

- FE-701 Empty/loading/error states globais
- FE-702 Revisao de responsividade
- FE-703 Revisao de acessibilidade minima
- FE-704 Smoke test ponta a ponta
- FE-705 Checklist de release

## 7. Dependencias Criticas

- FE-001 antes de qualquer entrega de modulo
- FE-101..110 antes de FE-402 (campanha depende de formulario)
- FE-201..204 antes de FE-402 (campanha depende de lista)
- FE-301..305 antes de FE-402 (campanha depende de template)
- FE-402/403 antes de FE-606
- FE-501..503 antes de confiabilidade de metricas finais

## 8. Criterios de Aceite Globais

- cada tela com loading, erro e vazio
- todas mutacoes com feedback de sucesso/falha
- filtros e paginacao sincronizados com URL quando aplicavel
- comportamento mobile funcional nas telas principais
- validacoes client-side alinhadas ao schema da API

## 9. Riscos e Mitigacao

- Divergencia entre schema backend e UX esperada:
  - Mitigar com revisao semanal dos contratos OpenAPI e regeneracao Orval.
- Complexidade do wizard de campanha:
  - Mitigar com release incremental (primeiro MVP linear, depois refinamentos).
- Regressao de navegacao por excesso de itens:
  - Mitigar com grupos claros e RBAC desde inicio.

## 10. Rito de Execucao no Kanban

- Planejamento semanal:
  - mover cards da proxima fase para To Do
  - quebrar cards grandes em subtarefas de no maximo 2 dias
- Daily:
  - no maximo 1 card In Progress por dev
- Review:
  - validar criterio de aceite + demo funcional
- Done:
  - somente apos validacao de UX e regra de negocio da tela

## 11. Mapeamento de Endpoints (Referencia)

- Surveys/forms/questions/options: src/lib/api/generated/endpoints.ts
- Frameworks: src/lib/api/generated/endpoints.ts
- Contacts lists/contacts: src/lib/api/generated/endpoints.ts
- Email templates + preview: src/lib/api/generated/endpoints.ts
- Campaigns + steps + actions (schedule/pause/resume/cancel): src/lib/api/generated/endpoints.ts
- Analytics (overview, NPS, CSAT, CES, CSI, por campanha/formulario): src/lib/api/generated/endpoints.ts

Observacao: os hooks gerados por Orval devem ser a unica fonte de chamada HTTP dos modulos de negocio.

## 12. Registro de Implementacao

### FE-002 - Estrutura de rotas dos modulos

Status: Implementado em 2026-06-27.

Resumo:

- criados shells dinamicos para detalhes de formulario, perguntas, contatos da lista, edicao de template, detalhes/steps de campanha e analytics por campanha/formulario
- adicionados componentes reutilizaveis de estado em `src/features/platform/components/module-loading.tsx` e `src/features/platform/components/module-error.tsx`
- adicionados `loading.tsx` e `error.tsx` para os segmentos `surveys`, `contacts`, `email-templates`, `campaigns`, `analytics`, `delivery` e `/s/[token]`
- nenhuma alteracao em navegacao, Kanban, contratos de API, Orval ou modelos gerados

Rotas entregues:

- `/dashboard/surveys/forms/[id]`
- `/dashboard/surveys/forms/[id]/questions`
- `/dashboard/contacts/lists/[id]/contacts`
- `/dashboard/email-templates/[id]/edit`
- `/dashboard/campaigns/[id]`
- `/dashboard/campaigns/[id]/steps`
- `/dashboard/analytics/campaigns/[id]`
- `/dashboard/analytics/forms/[id]`

Validacao:

- `bun run build` passou com rede liberada para download de fontes do Google usadas por `next/font`
- `bun run lint` foi executado, mas permanece bloqueado por erro preexistente em `src/components/ui/input-group.tsx:64`; os arquivos do FE-002 nao apareceram no output do lint

### FE-003 - Wrappers de tabela padrao com filtros e paginacao

Status: Implementado em 2026-06-27.

Resumo:

- criada a base visual reutilizavel `ModuleDataTable` em `src/features/platform/components/module-data-table.tsx`, combinando `DataTable` e `DataTableToolbar` com defaults de layout para modulos de negocio
- criado `ModuleDataTableSkeleton` em `src/features/platform/components/module-data-table-skeleton.tsx`, usando `DataTableSkeleton` com defaults de colunas, linhas, filtros, view options e paginacao
- criado `useModuleTableParams` em `src/features/platform/hooks/use-module-table-params.ts`, padronizando leitura de `page`, `perPage`, `sort` e filtros simples via `nuqs`
- criados utilitarios em `src/features/platform/lib/module-table.ts` para ids de colunas, calculo seguro de `pageCount`, serializacao de sort e compactacao de filtros de API
- nenhum modulo de negocio foi conectado ainda; a base sera consumida nas proximas tasks de listagem real

Validacao:

- `bun run build` passou com rede liberada para download de fontes do Google usadas por `next/font`
- `bun run lint` passou apos o ajuste de qualidade registrado abaixo; permanecem warnings preexistentes que nao bloqueiam a execucao

### Ajuste de qualidade - Desbloqueio do lint

Status: Implementado em 2026-06-27.

Resumo:

- corrigido o erro `jsx-a11y(no-noninteractive-element-interactions)` em `src/components/ui/input-group.tsx`
- o `InputGroupAddon` deixou de usar `onClick`/`onKeyDown` em um `div` nao interativo e passou a usar `onPointerDown` somente para manter o foco do input ao clicar no addon
- nenhuma API publica de componente foi alterada

Validacao:

- `bun run lint` passou; permanecem warnings preexistentes que nao bloqueiam a execucao

### FE-004 - Padrao de formulario por feature

Status: Implementado em 2026-06-27.

Resumo:

- criado `ModuleFormCard` em `src/features/platform/components/module-form-card.tsx` para padronizar o container visual de formularios de modulo
- criado `ModuleFormSection` em `src/features/platform/components/module-form-section.tsx` para agrupar campos com titulo, descricao, separador e grid responsivo
- criado `ModuleFormActions` em `src/features/platform/components/module-form-actions.tsx` para padronizar cancelar/salvar, estado pendente e submit externo via `formId`
- criado `ModuleFormSkeleton` em `src/features/platform/components/module-form-skeleton.tsx` para loading state de formularios
- criadas constantes em `src/features/platform/constants/module-form.ts` para labels de acao e grid padrao
- criados tipos/utilitarios em `src/features/platform/lib/module-form.ts` para `ModuleFormMode`, handlers de submit, defaults e config schema/defaultValues
- nenhum formulario de negocio foi conectado ainda; a base sera usada em `FE-102`, `FE-201`, `FE-302` e tarefas similares

Validacao:

- `bun run lint` passou; permanecem warnings preexistentes que nao bloqueiam a execucao
- `bun run build` passou com rede liberada para download de fontes do Google usadas por `next/font`

### FE-005 - Tratamento de erro e notificacoes

Status: Implementado em 2026-06-27.

Resumo:

- criado `AppApiError` em `src/features/platform/lib/api-error.ts` para preservar `status`, `statusText`, `url`, corpo da resposta e mensagem normalizada
- criado parser de erro de API para respostas JSON/texto, cobrindo formatos comuns como `detail`, `message`, `error`, `errors`, `non_field_errors` e erros por campo
- criado `getErrorMessage` como helper unico para transformar erros desconhecidos em mensagens exibiveis
- criado `ModuleErrorAlert` em `src/features/platform/components/module-error-alert.tsx` para alertas de erro reutilizaveis nos modulos
- atualizado `ModuleError` para usar o alerta e o normalizador compartilhados
- criado `src/features/platform/lib/notifications.ts` com wrappers `notifySuccess`, `notifyError` e `createMutationFeedback` para futuras mutacoes de modulo
- atualizado `src/lib/api/orval-fetcher.ts` para lancar `AppApiError` nas chamadas geradas por Orval
- atualizado `src/lib/api-client.ts` para usar o mesmo erro padrao nas chamadas legadas/demo
- nenhum contrato HTTP, modelo gerado por Orval ou comportamento de navegacao foi alterado

Validacao:

- `bun run lint` passou; permanecem warnings preexistentes que nao bloqueiam a execucao
- `bun run build` passou com rede liberada para download de fontes do Google usadas por `next/font`
