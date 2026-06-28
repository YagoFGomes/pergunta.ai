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
- FE-101A Melhorar filtros tenant-aware de formularios
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

### FE-101 - Listar formularios

Status: Implementado em 2026-06-27.

Resumo:

- substituido o placeholder de `/dashboard/surveys/forms` por uma listagem real de formularios conectada ao hook Orval `useSurveysFormsList`
- criada a feature `src/features/surveys/components/forms-table/` com tabela, colunas, opcoes de filtro e acoes por linha
- a listagem usa `ModuleDataTable`, `ModuleDataTableSkeleton`, `ModuleErrorAlert`, `useModuleTableParams` e `getModuleTablePageCount` da fundacao criada em FE-003/FE-005
- adicionados filtros reais por `status` e `framework`, sincronizados com a URL e convertidos para os parametros `status`, `framework`, `page` e `page_size` da API
- adicionados estados de loading, erro e vazio para a rota de formularios
- adicionadas acoes de linha para acessar os shells ja existentes de detalhes do formulario e perguntas
- ajustado `useModuleTableParams` para tipar filtros dinamicos no retorno do hook, evitando casts locais nas features
- apos smoke com backend real, criado `getOrvalResponseData` em `src/features/platform/lib/orval-response.ts` para normalizar respostas que chegam direto do backend (`count/results`) ou via wrapper tipado (`data`)
- nenhum CRUD, publicacao, arquivamento ou edicao de perguntas foi implementado nesta etapa

Validacao:

- `bun run lint` passou; permanecem warnings preexistentes que nao bloqueiam a execucao
- `bun run build` passou com rede liberada para download de fontes do Google usadas por `next/font`
- smoke real da API confirmou que `GET /api/surveys/forms/?page=1&page_size=10` retorna `count`, `next`, `previous` e `results` no corpo raiz

### FE-101A - Melhorar filtros tenant-aware de formularios

Status: Implementado em 2026-06-27.

Motivacao:

- a listagem FE-101 usa filtros funcionais por `status` e `framework`, mas as opcoes de framework ainda estao estaticas em `src/features/surveys/components/forms-table/options.ts`
- como a base e segmentada por tenant, os filtros devem refletir apenas frameworks, status e demais dimensoes disponiveis para o tenant atual

Resumo:

- removidas as opcoes estaticas de framework da listagem de formularios
- criada `buildSurveyFrameworkOptions` em `src/features/surveys/components/forms-table/options.ts` para gerar opcoes de filtro a partir de `SurveyFramework[]`
- a tabela de formularios agora chama `useSurveysFrameworksList({ is_active: 'true' })` e normaliza a resposta com `getOrvalResponseData`
- `getSurveyFormsColumns` passou a receber `frameworkOptions`, mantendo o filtro de status como enum fixo de dominio
- adicionados badges de fallback para carregamento, erro e ausencia de frameworks ativos no tenant
- os filtros continuam sincronizados com a URL e compativeis com `GET /api/surveys/forms/`

Validacao:

- `bun run lint` passou; permanecem warnings preexistentes que nao bloqueiam a execucao
- `bun run build` passou com rede liberada para download de fontes do Google usadas por `next/font`

### Ajuste de qualidade - Corrigir botoes aninhados nos filtros

Status: Implementado em 2026-06-27.

Resumo:

- corrigido erro de hidratacao `In HTML, <button> cannot be a descendant of <button>` nos filtros da tabela
- `DataTableFacetedFilter`, `DataTableDateFilter` e `DataTableSliderFilter` deixaram de renderizar um `button` de limpar dentro do `Button` usado como `PopoverTrigger`
- os icones de limpar agora usam `span` com `onPointerDown`, preservando o clique para limpar filtro sem criar HTML invalido
- a acao acessivel de limpar permanece disponivel dentro do popover pelos comandos `Clear filters`/`Clear`

Validacao:

- `bun run lint` passou; permanecem warnings preexistentes que nao bloqueiam a execucao
- `bun run build` passou com rede liberada para download de fontes do Google usadas por `next/font`

### FE-102 - Criar formulario

Status: Implementado em 2026-06-27.

Resumo:

- substituido o placeholder de `/dashboard/surveys/forms/new` por uma tela real de criacao de formulario
- criado `SurveyFormCreate` em `src/features/surveys/components/survey-form-create.tsx`
- criado schema `surveyFormCreateSchema` em `src/features/surveys/schemas/survey-form.ts` com validacoes de framework, titulo e descricao
- reutilizados `ModuleFormCard`, `ModuleFormSection`, `ModuleFormActions`, `ModuleFormSkeleton` e o sistema `useAppForm`
- o select de framework usa frameworks ativos do tenant via `useSurveysFrameworksList({ is_active: 'true' })`
- criado `buildSurveyFrameworkSelectOptions` para usar `framework.id` no payload de criacao, mantendo `framework.code` apenas para filtros da listagem
- conectado `useSurveysFormsCreate` para enviar `framework`, `title` e `description` para `POST /api/surveys/forms/`
- apos sucesso, a listagem de formularios e invalidada e o usuario e redirecionado para `/dashboard/surveys/forms/{id}/questions`
- adicionados estados de loading, erro e ausencia de frameworks ativos antes de renderizar o formulario

Validacao:

- `bun run lint` passou; permanecem warnings preexistentes que nao bloqueiam a execucao
- `bun run build` passou com rede liberada para download de fontes do Google usadas por `next/font`

### FE-103 - Editar formulario

Status: Implementado em 2026-06-27.

Resumo:

- substituido o placeholder de `/dashboard/surveys/forms/[id]` por uma tela real de edicao de metadados
- o componente `SurveyFormCreate` foi generalizado internamente para suportar modo `create` e `edit`
- criado export `SurveyFormEdit` em `src/features/surveys/components/survey-form-create.tsx`
- a tela de edicao carrega o formulario com `useSurveysFormsRetrieve(id)` e normaliza a resposta com `getOrvalResponseData`
- o submit de edicao usa `useSurveysFormsPartialUpdate` enviando `framework`, `title` e `description` para `PATCH /api/surveys/forms/{id}/`
- apos salvar, a listagem e o detalhe do formulario sao invalidados no TanStack Query e um toast de sucesso e exibido
- a tela exibe status atual, data de criacao e data da ultima atualizacao do formulario
- a acao da tabela foi ajustada de `Detalhes` para `Editar`, apontando para a tela real
- as acoes de publicar e arquivar permanecem para `FE-104` e `FE-105`

Validacao:

- `bun run lint` passou; permanecem warnings preexistentes que nao bloqueiam a execucao
- `bun run build` passou com rede liberada para download de fontes do Google usadas por `next/font`

### FE-106 - Listar e criar perguntas

Status: Implementado em 2026-06-27.

Resumo:

- substituido o placeholder de `/dashboard/surveys/forms/[id]/questions` por uma tela real com listagem e criacao de perguntas
- criada a feature `src/features/surveys/components/questions-table/` com `SurveyFormQuestions` e colunas da tabela
- criada validacao de formulario em `src/features/surveys/schemas/survey-question.ts` com campos `label`, `question_type` e `is_required`
- conectada listagem real via `useSurveysFormsQuestionsList(formId)`
- conectada criacao via `useSurveysFormsQuestionsCreate`, com invalidacao de cache da lista de perguntas e do formulario
- adicionados estados de loading, erro e vazio da lista de perguntas
- mantido escopo desta etapa apenas em listagem + criacao; editar/remover/reordenar e opcoes seguem para FE-107..FE-109

Validacao:

- `get_errors` retornou "No errors found" nos novos arquivos de FE-106 e na rota de perguntas

### FE-107 - Editar e remover perguntas

Status: Implementado em 2026-06-27.

Resumo:

- adicionadas acoes por linha na tabela de perguntas para editar e remover
- `getSurveyQuestionsColumns` passou a aceitar callbacks de acao (`onEdit`, `onDelete`) e estado `disableActions`
- criada edicao em modal (`Dialog`) com formulario tipado para atualizar `label`, `question_type` e `is_required`
- conectada mutacao `useSurveysFormsQuestionsPartialUpdate` para `PATCH /api/surveys/forms/{formId}/questions/{questionId}/`
- criada confirmacao de exclusao com `AlertDialog`
- conectada mutacao `useSurveysFormsQuestionsDestroy` para `DELETE /api/surveys/forms/{formId}/questions/{questionId}/`
- apos editar/remover, a lista de perguntas e o formulario sao invalidados no TanStack Query e a interface e atualizada
- quando o formulario esta arquivado, as acoes de linha ficam desabilitadas

Validacao:

- `get_errors` retornou "No errors found" nos arquivos de perguntas apos a implementacao

### FE-108 - Reordenar perguntas

Status: Implementado em 2026-06-27.

Resumo:

- implementado reorder na propria tabela de perguntas, sem duplicar tabela/lista paralela
- adicionados controles por linha para mover pergunta para cima/baixo
- criada acao explicita de persistencia com botao "Salvar ordem"
- conectada mutacao `useSurveysFormsQuestionsReorderCreate` para `POST /api/surveys/forms/{id}/questions/reorder/`
- payload enviado no formato `{ question_ids: string[] }` conforme contrato `FormQuestionReorder`
- adicionada acao "Descartar alteracoes" para restaurar a ordem atual do backend
- ao salvar, a lista de perguntas e o formulario sao invalidados no TanStack Query
- reorder fica bloqueado quando o formulario esta arquivado
- TODO FE-108A: evoluir para uma experiencia de ordenacao mais fluida (drag-and-drop nativo nas linhas da tabela) sem perder acessibilidade por teclado

Validacao:

- `get_errors` retornou "No errors found" para `survey-question.ts` e `survey-form-questions.tsx`
- corrigido erro de tipagem que bloqueava o pre-push removendo `.default(false)` do schema de `is_required`

### FE-109 - Gerenciar opcoes de perguntas objetivas

Status: Implementado em 2026-06-27.

Resumo:

- adicionada acao de "Gerenciar opcoes" por linha na tabela de perguntas
- a acao e habilitada apenas para perguntas de `SINGLE_CHOICE` e `MULTIPLE_CHOICE`
- implementado modal de opcoes com listagem, criacao, edicao e remocao
- conectadas mutacoes:
  - `useSurveysFormsQuestionsOptionsCreate`
  - `useSurveysFormsQuestionsOptionsPartialUpdate`
  - `useSurveysFormsQuestionsOptionsDestroy`
- conectada consulta `useSurveysFormsQuestionsOptionsList` com invalidacao de cache especifica por pergunta apos mutacoes
- operacoes de opcoes tambem ficam bloqueadas quando o formulario esta arquivado

Validacao:

- `get_errors` retornou "No errors found" nos arquivos de perguntas apos FE-109

### FE-110 - CRUD frameworks

Status: Implementado em 2026-06-27.

Resumo geral:

- a rota `/dashboard/surveys/frameworks` deixou de ser shell e agora usa uma tela funcional conectada aos endpoints de frameworks
- implementada feature dedicada em `src/features/surveys/components/frameworks-table/` com tabela, acoes e dialogs de formulario/confirmacao
- criado schema de validacao em `src/features/surveys/schemas/survey-framework.ts`
- observacao de contrato: a API atual expoe `GET`, `POST` e `PATCH` para frameworks; nao existe endpoint `DELETE`

#### FE-110.1 - Listar frameworks

Status: Concluida.

- criada listagem real via `useSurveysFrameworksList`
- adicionadas colunas de codigo, nome, descricao, origem (seed/custom) e status
- adicionados estados de erro e vazio para a tela

#### FE-110.2 - Criar framework

Status: Concluida.

- implementado dialog de criacao com validacao client-side (codigo, nome, descricao e status)
- conectada mutacao `useSurveysFrameworksCreate` com invalidacao da listagem apos sucesso

#### FE-110.3 - Editar framework

Status: Concluida.

- implementado dialog de edicao com pre-preenchimento dos dados selecionados
- conectada mutacao `useSurveysFrameworksPartialUpdate`
- protecao aplicada para impedir edicao de framework `seed` pelo fluxo de tela

#### FE-110.4 - Ativar/desativar framework

Status: Concluida.

- adicionada acao rapida por linha para alternar `is_active`
- alteracao persiste via `PATCH /api/surveys/frameworks/{id}/`

#### FE-110.5 - Excluir framework

Status: Concluida com adaptacao de contrato.

- como nao existe `DELETE /api/surveys/frameworks/{id}/`, a UX de exclusao foi implementada como desativacao confirmada
- a acao "Excluir" abre confirmacao e executa `PATCH` com `is_active: false`
- documentado explicitamente para evitar divergencia entre expectativa de CRUD e contrato real da API

Validacao:

- `get_errors` retornou "No errors found" para:
  - `src/app/dashboard/surveys/frameworks/page.tsx`
  - `src/features/surveys/components/frameworks-table/columns.tsx`
  - `src/features/surveys/components/frameworks-table/survey-frameworks-manager.tsx`
  - `src/features/surveys/schemas/survey-framework.ts`

### FE-104 e FE-105 - Publicar e Arquivar formulario

Status: Implementado em 2026-06-27.

Resumo:

- adicionadas acoes de Publicar (`POST /api/surveys/forms/{id}/publish/`) e Arquivar (`POST /api/surveys/forms/{id}/archive/`) em dois pontos da UI
- `cell-action.tsx` recebeu novos itens condicionais no dropdown: "Publicar" exibido apenas para status `DRAFT`; "Arquivar" exibido apenas para status `ACTIVE`; separador visual antes das acoes de estado
- `survey-form-create.tsx` recebeu botoes "Publicar" e "Arquivar" ao lado do alerta de status atual na tela de edicao, exibidos conforme o estado do formulario
- ambos os pontos disparam um `AlertDialog` de confirmacao antes de executar a mutacao
- apos sucesso, a listagem e o detalhe do formulario sao invalidados no TanStack Query e um toast de feedback e exibido
- backend ignora o corpo da requisicao nessas rotas; `data` e enviado como `as never` para compatibilidade com o tipo gerado pelo Orval
- transicoes suportadas: `DRAFT` -> `ACTIVE` (publicar) e `ACTIVE` -> `ARCHIVED` (arquivar)

Validacao:

- `get_errors` retornou "No errors found" em ambos os arquivos

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

### FE-201 - CRUD listas de contatos

Status: Implementado em 2026-06-27.

Resumo:

- substituido o shell de `/dashboard/contacts/lists` por tela real de gerenciamento de listas
- criada feature `src/features/contacts/components/lists-table/` com tabela e acoes por linha
- implementadas operacoes de CRUD:
  - listagem via `useContactsListsList`
  - criacao via `useContactsListsCreate`
  - edicao via `useContactsListsPartialUpdate`
  - exclusao via `useContactsListsDestroy`
- adicionada validacao de formulario em `src/features/contacts/schemas/contact-list.ts`
- listagem exibe nome, descricao, quantidade de contatos, status e data de criacao
- adicionada acao de atalho para abrir rota de contatos da lista (`/dashboard/contacts/lists/{id}/contacts`)

Validacao:

- `get_errors` retornou "No errors found" para:
  - `src/app/dashboard/contacts/lists/page.tsx`
  - `src/features/contacts/components/lists-table/contact-lists-manager.tsx`
  - `src/features/contacts/components/lists-table/columns.tsx`
  - `src/features/contacts/schemas/contact-list.ts`

### FE-202 - Listar contatos por lista

Status: Implementado em 2026-06-27.

Resumo:

- substituido o shell de `/dashboard/contacts/lists/[id]/contacts` por tela real de listagem
- criada feature `src/features/contacts/components/contacts-table/` com manager e colunas
- consulta de metadados da lista via `useContactsListsRetrieve`
- consulta de contatos por lista via `useContactsListsContactsList`
- listagem exibe contato (nome + email), telefone, status e data de criacao
- adicionados estados de loading, erro e vazio
- escopo mantido apenas em listagem; criacao/edicao/exclusao de contatos seguem para FE-203

Validacao:

- `get_errors` retornou "No errors found" para:
  - `src/app/dashboard/contacts/lists/[id]/contacts/page.tsx`
  - `src/features/contacts/components/contacts-table/contact-list-contacts-manager.tsx`
  - `src/features/contacts/components/contacts-table/columns.tsx`

### Ajuste de qualidade - Chaves duplicadas na navegacao

Status: Implementado em 2026-06-27.

Resumo:

- corrigido warning React de chaves duplicadas (`Encountered two children with the same key`) na navegacao
- `src/components/layout/app-sidebar.tsx` passou a usar keys baseadas em `url + title + index`
- `src/components/kbar/index.tsx` passou a gerar ids unicos de action via `title + url`
- mitigado risco de colisoes quando itens compartilham o mesmo titulo em secoes diferentes

Validacao:

- `get_errors` retornou "No errors found" para os arquivos alterados

### FE-203 - Criar/editar/remover contato

Status: Implementado em 2026-06-27.

Resumo:

- expandida a tela `/dashboard/contacts/lists/[id]/contacts` para suportar CRUD de contatos
- adicionadas acoes por linha (editar/excluir) na tabela de contatos
- implementado dialog de formulario para criacao e edicao de contato
- implementado `AlertDialog` de confirmacao para exclusao
- conectadas mutacoes:
  - `useContactsListsContactsCreate`
  - `useContactsListsContactsPartialUpdate`
  - `useContactsListsContactsDestroy`
- invalidados caches de lista de contatos, detalhe da lista e listagem de listas apos mutacoes
- criado schema `src/features/contacts/schemas/contact.ts` para validacoes de nome, email, telefone e status

Validacao:

- `get_errors` retornou "No errors found" para:
  - `src/features/contacts/components/contacts-table/contact-list-contacts-manager.tsx`
  - `src/features/contacts/components/contacts-table/columns.tsx`
  - `src/features/contacts/schemas/contact.ts`

### Ajuste de qualidade - Build frontend desbloqueado

Status: Implementado em 2026-06-27.

Resumo:

- corrigida falha de build em `contact-lists-manager.tsx` causada por `STATUS_OPTIONS` tipado como `readonly`
- `FormSelectField` agora aceita `options` somente-leitura, preservando constantes `as const` usadas pelos modulos
- `FormSelectField` tambem passou a expor `disabled`, alinhando o select aos demais campos de formulario e permitindo bloquear o campo durante mutacoes
- alteracao centralizada em `src/components/forms/fields/select-field.tsx`, sem mudar contratos de API ou comportamento de modulo

Validacao:

- `bun run build` passou
- `bun run lint` passou; permanecem warnings preexistentes que nao bloqueiam a execucao

### FE-204 - Busca e filtros de contatos

Status: Implementado em 2026-06-27.

Resumo:

- adicionada busca por email na tabela de contatos da lista
- adicionado filtro por status (`ACTIVE`, `UNSUBSCRIBED`, `BOUNCED`) usando a toolbar padrao de tabelas
- filtros ficam sincronizados na URL como `email` e `status`
- `ContactListContactsManager` agora envia os filtros para `useContactsListsContactsList(listId, params)`
- adicionada indicacao visual de atualizacao enquanto a consulta refaz fetch
- mantido empty state apenas quando a lista realmente nao possui contatos; resultados vazios filtrados ficam na tabela filtrada
- observacao de contrato: `GET /api/contacts/lists/{listId}/contacts/` expoe `email` e `status`, mas ainda nao expoe `page`/`page_size`; por isso a paginacao backend fica para uma evolucao de contrato

Validacao:

- `bun run lint` passou; permanecem warnings preexistentes que nao bloqueiam a execucao
- `bun run build` passou

### FE-301 - Listar templates de email

Status: Implementado em 2026-06-28.

Resumo:

- substituido o shell de `/dashboard/email-templates` por uma tela real de listagem de templates
- criada a feature `src/features/email-templates/components/templates-table/`
- conectada listagem real via `useEmailTemplatesList`
- adicionadas colunas de template, tipo, idioma, variaveis obrigatorias, status, ultima atualizacao e acao de editar
- adicionados filtros sincronizados com a URL:
  - `search`
  - `status`
  - `template_type`
- adicionados estados de loading, erro, vazio e indicacao de atualizacao durante refetch
- a acao de editar aponta para o shell ja existente `/dashboard/email-templates/{id}/edit`
- observacao de contrato: `GET /api/email-templates/` expoe `search`, `status` e `template_type`, mas ainda nao expoe `page`/`page_size`; por isso a paginacao backend fica para uma evolucao de contrato
- CRUD de criacao/edicao/exclusao e preview permanecem para `FE-302`..`FE-305`

Validacao:

- `bun run lint` passou; permanecem warnings preexistentes que nao bloqueiam a execucao
- `bun run build` passou
