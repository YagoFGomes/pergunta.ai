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
- FE-306 Editor HTML de templates (v1 reduzido / v2 rich text)

## Epic FE-05 - Campanhas

- FE-401 Listar campanhas - implementado
- FE-402 Wizard criar campanha (5 passos) - implementado
- FE-403 Tela detalhes da campanha - implementado
- FE-404 Listar steps da campanha - implementado
- FE-405 Criar/editar/remover step - implementado
- FE-406 Agendar campanha - implementado
- FE-407 Pausar campanha - implementado
- FE-408 Retomar campanha - implementado
- FE-409 Cancelar campanha - implementado

## Epic FE-06 - Public Survey

- FE-501 Render formulario publico por token - implementado
- FE-502 Validacoes de preenchimento - implementado
- FE-503 Submissao publica de respostas - implementado
- FE-504 Tela de confirmacao de envio - implementado

## Epic FE-07 - Analytics e Operacao

- FE-601 Dashboard overview - implementado
- FE-602 Dashboard NPS - implementado
- FE-603 Dashboard CSAT - implementado
- FE-604 Dashboard CES - implementado
- FE-605 Dashboard CSI - implementado
- FE-606 Analytics por campanha - implementado
- FE-607 Analytics por formulario - implementado
- FE-608 Logs de envio - implementado

## Epic FE-08 - Quality Gate

- FE-701 Empty/loading/error states globais - implementado
- FE-702 Revisão de responsividade - implementado
- FE-703 Revisão de acessibilidade mínima - implementado
- FE-704 Smoke test ponta a ponta - implementado
- FE-705 Checklist de release

## Epic FE-09 - Identidade Visual Premium

- FE-801 Discovery visual e auditoria de layout atual
- FE-802 Definir direcao de arte premium da plataforma
- FE-803 Criar tokens visuais para espacamento, sombra, borda, cor e tipografia
- FE-804 Padronizar componentes base com acabamento premium
- FE-805 Planejar e implementar micro animacoes consistentes
- FE-806 Refinar layouts dos modulos principais
- FE-807 Criar checklist de QA visual e acessibilidade para motion
- FE-808 Rollout incremental da nova identidade por modulo

## 7. Dependencias Criticas

- FE-001 antes de qualquer entrega de modulo
- FE-101..110 antes de FE-402 (campanha depende de formulario)
- FE-201..204 antes de FE-402 (campanha depende de lista)
- FE-301..305 antes de FE-402 (campanha depende de template)
- FE-402/403 antes de FE-606
- FE-501..503 antes de confiabilidade de metricas finais
- FE-701..705 antes do rollout completo de FE-09, para evitar polir telas ainda instaveis

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

### FE-302 - Criar template

Status: Implementado em 2026-06-28.

Resumo:

- adicionada acao "Novo template" na tela `/dashboard/email-templates`
- implementado dialog de criacao dentro de `EmailTemplatesManager`
- conectado `useEmailTemplatesCreate` para `POST /api/email-templates/`
- criado schema `src/features/email-templates/schemas/email-template.ts`
- formulario cobre:
  - nome
  - slug
  - tipo
  - status
  - assunto
  - conteudo HTML
  - conteudo texto
  - variaveis obrigatorias
  - idioma
- `required_variables` e informado como texto separado por virgula/espaco/quebra de linha e enviado para a API como `string[]`
- adicionada validacao client-side para:
  - padrao de slug aceito pelo backend
  - nomes de variaveis validos
  - variaveis duplicadas
  - placeholders `{{ variable }}` usados em assunto/corpo sem declaracao em `required_variables`
- apos sucesso, a listagem de templates e invalidada e o dialog e fechado
- feedback de sucesso/falha usa toast e o normalizador de erros da plataforma

Validacao:

- `bun run lint` passou; permanecem warnings preexistentes que nao bloqueiam a execucao
- `bun run build` passou

### FE-303 - Editar template

Status: Implementado em 2026-06-28.

Resumo:

- substituido o shell de `/dashboard/email-templates/[id]/edit` por uma tela real de edicao
- criada `EmailTemplateEdit` em `src/features/email-templates/components/email-template-edit.tsx`
- conectada consulta `useEmailTemplatesRetrieve(id)` para carregar o template
- conectada mutacao `useEmailTemplatesPartialUpdate` para `PATCH /api/email-templates/{id}/`
- extraido `EmailTemplateFormFields` para reaproveitar os mesmos campos entre criacao e edicao
- adicionado helper `getEmailTemplateFormValues` para transformar `EmailTemplate` em valores de formulario
- a edicao reutiliza as validacoes de slug, variaveis obrigatorias, duplicadas e placeholders nao declarados
- apos salvar, a listagem e o detalhe do template sao invalidados no TanStack Query
- observacao de contrato: templates globais (`tenant = null`) aparecem na listagem, mas o backend permite edicao apenas para superuser

Validacao:

- `bun run lint` passou; permanecem warnings preexistentes que nao bloqueiam a execucao
- `bun run build` passou

### FE-304 - Excluir template

Status: Implementado em 2026-06-28.

Resumo:

- adicionada acao de excluir por linha na tabela de templates
- `getEmailTemplatesColumns` passou a aceitar `onDelete` e `disableActions`
- implementado `AlertDialog` de confirmacao antes da exclusao
- conectada mutacao `useEmailTemplatesDestroy` para `DELETE /api/email-templates/{id}/`
- apos excluir, a listagem de templates e invalidada no TanStack Query
- erros de permissao ou contrato sao exibidos pelo normalizador de erros da plataforma
- observacao de contrato: exclusao de templates globais tambem depende da permissao de superuser no backend

Validacao:

- `bun run lint` passou; permanecem warnings preexistentes que nao bloqueiam a execucao
- `bun run build` passou

### FE-305 - Preview de template

Status: Implementado em 2026-06-28.

Resumo:

- adicionada area de preview na tela `/dashboard/email-templates/[id]/edit`
- criado `EmailTemplatePreview` em `src/features/email-templates/components/email-template-preview.tsx`
- conectado `useEmailTemplatesPreviewCreate` para `POST /api/email-templates/{id}/preview/`
- variaveis obrigatorias sao carregadas de `required_variables` e exibidas como inputs editaveis
- valores de exemplo sao sugeridos automaticamente para variaveis comuns como nome, link, email e empresa
- preview renderiza:
  - assunto final
  - HTML renderizado
  - texto puro renderizado
- erros de preview usam o normalizador de erro da plataforma
- erros com `missing_variables` recebem mensagem especifica listando variaveis pendentes
- adicionados helpers em `src/features/email-templates/schemas/email-template.ts` para extrair variaveis e gerar valores de exemplo
- observacao de contrato: o modelo Orval `EmailTemplatePreview` representa o body da request (`variables`), mas o backend retorna `subject`, `html_content` e `plain_text_content`; por isso o componente usa um tipo local para a resposta renderizada

Validacao:

- `bun run lint` passou; permanecem warnings preexistentes que nao bloqueiam a execucao
- `bun run build` passou

### Ajuste de UX - Alinhamento da edicao de template

Status: Implementado em 2026-06-28.

Resumo:

- a rota `/dashboard/email-templates/[id]/edit` passou a usar `PageContainer`
- adicionados titulo, descricao e acao "Voltar" no mesmo padrao visual da edicao de formularios em `/dashboard/surveys/forms/[id]`
- corrigido o desalinhamento causado pela renderizacao direta do componente de edicao sem o container padrao de pagina
- nenhum contrato de API, schema ou comportamento de mutacao foi alterado

Validacao:

- `bun run lint` passou; permanecem warnings preexistentes que nao bloqueiam a execucao
- `bun run build` passou

### TODO FE-306 - Editor HTML de templates

Status: Backlog em 2026-06-28.

Motivacao:

- o CRUD atual de templates usa `textarea` para `html_content`, suficiente para o MVP tecnico
- para operadores nao tecnicos, editar HTML manualmente aumenta risco de erro visual e retrabalho

Escopo v1 reduzido:

- melhorar o campo `html_content` com ajuda contextual, snippets de placeholders e preview lado a lado
- manter o payload como HTML simples no contrato atual (`html_content`)
- evitar dependencia pesada ate validar fluxo real de criacao de campanhas

Escopo v2:

- substituir o `textarea` por editor rich text/HTML controlado
- avaliar biblioteca dedicada com suporte a HTML, toolbar basica, links, listas e placeholders
- manter sanitizacao compatível com o backend, que hoje permite tags HTML limitadas
- preservar validacao de placeholders `{{ variable }}` e `required_variables`

Criterios de aceite futuros:

- usuario consegue criar template visualmente sem escrever HTML bruto
- placeholders continuam inseriveis e validaveis
- preview mostra resultado aproximado antes do envio
- HTML gerado respeita as tags aceitas pelo serializer do backend

### FE-401..FE-409 - Campanhas

Status: Implementado em 2026-06-28.

Resumo:

- substituidos os shells de `/dashboard/campaigns`, `/dashboard/campaigns/new`, `/dashboard/campaigns/[id]` e `/dashboard/campaigns/[id]/steps` por telas reais
- criada a feature `src/features/campaigns/` com utilitarios, schemas e componentes dedicados
- FE-401: listagem de campanhas com filtros por busca/status usando `ModuleDataTable`
- FE-402: wizard de criacao em 5 etapas:
  - dados base e formulario
  - publico/canal de entrega
  - template e step inicial
  - agendamento opcional
  - revisao
- o wizard cria a campanha em `POST /api/campaigns/`, cria step inicial em `POST /api/campaigns/{id}/steps/` quando o canal e email e agenda em `POST /api/campaigns/{id}/schedule/` quando data/hora forem preenchidas
- FE-403: tela de detalhe com status, canal, metricas basicas, IDs de relacionamento, links para steps e analytics
- FE-404: listagem dos steps da campanha com ordem, tipo, template, delay e condicao
- FE-405: dialog para criar/editar step e confirmacao para remover step
- FE-406: formulario de agendamento operacional na tela de detalhe
- FE-407: acao de pausar campanha via `POST /api/campaigns/{id}/pause/`
- FE-408: acao de retomar campanha via `POST /api/campaigns/{id}/resume/`
- FE-409: acao de cancelar campanha com confirmacao via `POST /api/campaigns/{id}/cancel/`
- as consultas e mutacoes invalidam as query keys relacionadas no TanStack Query para atualizar listagem, detalhe e steps
- observacao de contrato: o frontend trata respostas paginadas e arrays simples para listagens, pois o backend pode retornar `{ count, results }` mesmo quando o tipo Orval aparece como array

Validacao:

- `bun run lint` passou; permanecem warnings preexistentes que nao bloqueiam a execucao
- `bun run build` passou

Smoke test manual:

- acessar `/dashboard/campaigns` e validar listagem/filtros
- acessar `/dashboard/campaigns/new` e criar campanha com formulario, lista e template ativos
- acessar `/dashboard/campaigns/{id}` e validar detalhe, agendamento, pausa, retomada e cancelamento conforme status permitido pelo backend
- acessar `/dashboard/campaigns/{id}/steps` e validar criar, editar e remover steps

### Ajuste de UX - Selecao de recursos no wizard de campanha

Status: Implementado em 2026-06-28.

Resumo:

- o wizard de `/dashboard/campaigns/new` deixou de buscar apenas formularios, listas e templates ativos
- a selecao agora mostra os recursos do tenant mesmo quando estao em status draft/inativo, evitando selects vazios quando a base tem dados nao ativos
- o texto dos selects passou a exibir status junto do nome do recurso
- ao selecionar um formulario, o wizard mostra um resumo com framework, status, ID e atalho para editar o formulario
- ao selecionar uma lista de contatos, o wizard mostra contato total, status, ID e atalhos para:
  - ver contatos da lista em `/dashboard/contacts/lists/{id}/contacts`
  - gerenciar/editar listas em `/dashboard/contacts/lists`
- ao selecionar um template, o wizard mostra tipo, status, idioma e atalho para editar o template
- a mensagem de pre-requisitos foi ajustada para falar de recursos cadastrados no tenant atual, nao apenas recursos ativos

Validacao:

- `bun run lint` passou; permanecem warnings preexistentes que nao bloqueiam a execucao
- `bun run build` passou

Smoke test manual:

- acessar `/dashboard/campaigns/new`
- confirmar que formularios, listas e templates cadastrados aparecem nos selects mesmo se nao estiverem ativos
- selecionar uma lista e abrir o atalho "Ver contatos"
- voltar ao wizard e seguir a criacao da campanha

### FE-501..FE-504 - Public Survey

Status: Implementado em 2026-06-28.

Plano executado:

- FE-501: substituir shell de `/s/[token]` por uma experiencia publica real
- FE-502: validar respostas obrigatorias no client antes do envio
- FE-503: submeter respostas ao backend pelo token publico
- FE-504: exibir confirmacao final depois do envio

Resumo:

- criada a feature `src/features/public-survey/`
- criada API client local em `src/features/public-survey/api/public-survey.ts`
- criada experiencia publica em `src/features/public-survey/components/public-survey-response.tsx`
- criada camada de helpers/normalizacao em `src/features/public-survey/schemas/public-survey.ts`
- rota `/s/[token]` agora renderiza `PublicSurveyResponse`
- a tela carrega o formulario publico por token e trata:
  - loading
  - erro de token invalido/expirado/respondido
  - formulario sem perguntas
  - estado de sucesso apos envio
- perguntas sao ordenadas por `order`
- opcoes sao ordenadas por `order`
- tipos renderizados:
  - `TEXT` com textarea
  - `SINGLE_CHOICE` com radio group
  - `MULTIPLE_CHOICE` com checkboxes
  - `SCALE_1_5` com botoes de 1 a 5
  - `SCALE_0_10` com botoes de 0 a 10
- validacao client-side exige respostas para perguntas marcadas como obrigatorias
- indicador de progresso mostra obrigatorias respondidas
- payload de submit segue `PublicSurveySubmit`
- para `MULTIPLE_CHOICE`, o frontend envia uma resposta por opcao marcada, alinhado ao serializer atual que recebe `answer_choice_id`
- observacao tecnica: os endpoints publicos gerados pelo Orval saem como `/public/...`, mas no browser isso nao passa pelo proxy Next; por isso a API local chama `/api/public/surveys/{token}/`, que o proxy encaminha para o backend

Validacao:

- `bun run build` passou
- `bun run lint` passou; permanecem warnings preexistentes que nao bloqueiam a execucao

Smoke test manual:

- acessar `/s/{token}` com token valido de `CampaignRecipient`
- validar carregamento do titulo, descricao e perguntas
- tentar enviar sem preencher obrigatorias e conferir erros por pergunta
- preencher respostas de texto, escolha unica, multipla escolha e escalas
- enviar respostas e confirmar tela final de obrigado
- abrir novamente o mesmo token e validar resposta de link ja respondido/indisponivel retornada pelo backend

### Ajuste - Token publico e perguntas sem opcoes

Status: Implementado em 2026-06-28.

Contexto:

- o token `_YwySjnWUxdjiYqcwvgCsqpjllCUdF8BKCjmOB-tcwI` carregava corretamente no backend em `/public/surveys/{token}/`
- no frontend, a chamada `/api/public/surveys/{token}/` passava pelo catch-all do Next e era encaminhada incorretamente para `/api/public/surveys/{token}/` no Django
- as rotas publicas do Django ficam fora do prefixo `/api`, portanto o proxy precisa encaminhar `/api/public/...` para `/public/...`
- o mesmo token tambem retornava uma pergunta obrigatoria de escolha sem opcoes cadastradas, impossibilitando resposta valida

Resumo:

- `src/app/api/[...path]/route.ts` agora detecta chamadas iniciadas por `public` e remove o prefixo `/api` ao montar a URL do backend
- `src/features/public-survey/api/public-survey.ts` passou a chamar `/api/public/surveys/{token}` e `/api/public/surveys/{token}/submit` sem barra final, evitando redirect 308 do Next
- `src/features/public-survey/schemas/public-survey.ts` passou a identificar perguntas de escolha sem opcoes e retornar mensagem especifica de validacao
- `src/features/public-survey/components/public-survey-response.tsx` passou a exibir aviso visual para perguntas sem opcoes
- quando uma pergunta obrigatoria esta sem opcoes, o envio fica bloqueado e a tela orienta editar o formulario antes de compartilhar o link

Validacao:

- smoke test direto no backend: `GET http://localhost:8000/public/surveys/_YwySjnWUxdjiYqcwvgCsqpjllCUdF8BKCjmOB-tcwI/` retornou `200`
- smoke test pelo proxy Next: `GET http://localhost:3000/api/public/surveys/_YwySjnWUxdjiYqcwvgCsqpjllCUdF8BKCjmOB-tcwI` retornou `200`
- `bun run lint` passou; permanecem warnings preexistentes que nao bloqueiam a execucao
- `bun run build` passou

### TODO FE-801..FE-808 - Identidade Visual Premium

Status: Backlog em 2026-06-28.

Motivacao:

- a plataforma ja possui fluxos funcionais importantes, mas varias telas ainda usam uma composicao simples de dashboard
- a proxima evolucao visual deve transformar o produto em uma experiencia mais premium, com identidade propria, sem comprometer clareza operacional
- a melhoria precisa ser transversal: layout, tokens, componentes, motion, estados de feedback e consistencia entre modulos

Principios de direcao:

- manter o produto com cara de ferramenta de trabalho: denso, claro, escaneavel e eficiente
- elevar o acabamento com hierarquia visual, contraste, espacamento, estados refinados e micro interacoes discretas
- evitar decoracao gratuita; motion e visual devem ajudar orientacao, feedback e percepcao de qualidade
- preservar acessibilidade, responsividade e performance

Escopo planejado:

- FE-801 Discovery visual e auditoria:
  - revisar telas atuais de surveys, contatos, templates, campanhas, analytics e resposta publica
  - mapear inconsistencias de alinhamento, densidade, estados, botoes, tabelas, dialogs e headers
  - separar problemas funcionais de problemas puramente visuais
- FE-802 Direcao de arte premium:
  - definir referencias visuais e tom do produto
  - consolidar paleta, uso de superficies, sombras, bordas, icones e linguagem de status
  - definir onde a experiencia deve ser mais operacional e onde pode ser mais expressiva
- FE-803 Tokens visuais:
  - revisar tokens de cor, radius, borda, sombra, focus ring, espacamento e tipografia
  - criar padroes de elevacao e superficies para app shell, paginas, tabelas, formularios e cards
  - documentar variacoes light/dark se aplicavel
- FE-804 Componentes base premium:
  - refinar botoes, inputs, selects, badges, alerts, dialogs, tables, tabs, skeletons e empty states
  - padronizar headers de pagina, barras de acao, cards de metrica e paineis laterais
  - manter APIs de componentes estaveis sempre que possivel
- FE-805 Micro animacoes:
  - planejar transicoes de hover, press, focus, loading, skeleton, dialogs, dropdowns, toasts e troca de etapas
  - usar duracoes curtas e easing consistente
  - respeitar `prefers-reduced-motion`
- FE-806 Refinamento por modulo:
  - aplicar a identidade em surveys, contatos, templates, campanhas, analytics e pagina publica
  - priorizar telas de maior frequencia e maior impacto comercial
  - evitar reescrever CRUDs enquanto o foco for acabamento visual
- FE-807 QA visual e acessibilidade:
  - validar desktop/mobile, contraste, navegação por teclado, focus states e motion reduzido
  - criar checklist reutilizavel para cada modulo
- FE-808 Rollout incremental:
  - aplicar primeiro nos componentes compartilhados
  - depois migrar modulos por lote
  - documentar antes/depois e riscos de regressao visual

Criterios de aceite futuros:

- plataforma possui linguagem visual consistente entre modulos
- componentes compartilhados cobrem os padroes principais sem duplicacao local
- micro animacoes melhoram feedback sem atrasar fluxos operacionais
- todas as telas refinadas continuam responsivas, acessiveis e com estados de loading/erro/vazio
- `bun run lint` e `bun run build` passam apos cada lote de rollout

### FE-601 - Dashboard Overview

Status: Implementado em 2026-06-28.

Resumo:

- substituido o shell de `/dashboard/analytics/overview` por uma tela real em `src/features/analytics/components/analytics-overview.tsx`
- criada a feature `src/features/analytics/` com:
  - client local `api/analytics-overview.ts`
  - schema/helpers `schemas/analytics-overview.ts`
  - componente de dashboard `components/analytics-overview.tsx`
- o overview consome dados reais de:
  - `GET /api/analytics/overview`
  - `GET /api/campaigns/`
  - `GET /api/email-delivery/logs/`
- adicionados cards operacionais para:
  - campanhas
  - respostas
  - taxa de resposta
  - entregas/falhas/pendentes
- adicionados cards de indicadores para NPS, CSAT, CES e CSI com valor mais recente, periodo e atalho para a serie do indicador
- adicionado filtro simples por `period` usando data exata, alinhado ao parametro aceito pelo backend
- adicionados estados de loading, erro e vazio
- adicionados atalhos para campanhas, logs de entrega e formularios
- observacao de contrato: o OpenAPI/Orval ainda gera `analyticsOverviewRetrieve` com `data: void`; por isso a FE-601 usa client local tipado ate o schema do backend descrever o payload do overview

Validacao:

- `bun run lint` passou; permanecem warnings preexistentes que nao bloqueiam a execucao
- `bun run build` passou

Smoke test manual:

- acessar `/dashboard/analytics/overview`
- validar cards de campanhas, respostas, taxa de resposta e entregas
- validar cards de NPS, CSAT, CES e CSI
- aplicar um periodo no filtro e confirmar atualizacao dos dados
- abrir os atalhos de metricas, campanhas, logs e formularios
- simular backend indisponivel ou token invalido e confirmar estado de erro com acao "Tentar novamente"

### FE-606, FE-607 e FE-608 - Analytics Detalhado e Logs de Envio

Status: Implementado em 2026-06-28.

Resumo:

- substituidos os shells de:
  - `/dashboard/analytics/campaigns/[id]`
  - `/dashboard/analytics/forms/[id]`
  - `/dashboard/delivery/logs`
- criado client local `src/features/analytics/api/analytics-detail.ts` para consumir:
  - `GET /api/analytics/campaigns/{campaignId}`
  - `GET /api/analytics/forms/{formId}`
- criado schema/helper `src/features/analytics/schemas/analytics-detail.ts`
- criado componente compartilhado `src/features/analytics/components/analytics-detail.tsx`
- analytics por campanha e formulario agora exibem:
  - cabecalho com recurso atual
  - total de registros de metricas
  - total filtrado
  - quantidade de indicadores disponiveis
  - cards de NPS, CSAT, CES e CSI
  - filtro local por periodo
  - tabela de historico de metricas
  - atalhos para campanha/formulario e logs quando aplicavel
- criada feature de delivery em `src/features/delivery/`
- criado client local `src/features/delivery/api/delivery-logs.ts` para `POST /api/email-delivery/logs/{id}/retry`
- criado schema/helper `src/features/delivery/schemas/delivery-log.ts`
- criada tela `src/features/delivery/components/delivery-logs-manager.tsx`
- logs de envio agora exibem:
  - resumo de total, pendentes, enviados, falhas e bounces
  - filtro por status
  - filtro por ID de campanha
  - suporte a abrir filtrado via `/dashboard/delivery/logs?campaign={id}`
  - tabela com destinatario, assunto, erro, tentativas e data
  - acao de retry habilitada apenas para logs `FAILED`

Observacoes de contrato:

- os endpoints de analytics detalhado ainda aparecem no Orval como `data: void`, entao foram criados clients locais tipados ate o OpenAPI descrever esses payloads
- o endpoint de retry no backend ignora corpo da requisicao; por isso a UI usa um client local sem body em vez do hook gerado pelo Orval, que exige `EmailSendLog`

Validacao:

- `bun run lint` passou; permanecem warnings preexistentes que nao bloqueiam a execucao
- `bun run build` passou

Smoke test manual:

- acessar `/dashboard/analytics/campaigns/{id}` com campanha existente
- validar cards de NPS, CSAT, CES e CSI e tabela de historico
- aplicar filtro por periodo e limpar filtro
- abrir o atalho "Logs de entrega" e confirmar `/dashboard/delivery/logs?campaign={id}`
- acessar `/dashboard/analytics/forms/{id}` com formulario existente
- validar historico e atalho para o formulario
- acessar `/dashboard/delivery/logs`
- filtrar por status e por campanha
- em um log `FAILED`, clicar em `Retry` e confirmar toast de sucesso ou mensagem de erro do backend

### FE-602..FE-605 - Dashboards por Indicador

Status: Implementado em 2026-06-28.

Resumo:

- substituidos os shells de:
  - `/dashboard/analytics/nps`
  - `/dashboard/analytics/csat`
  - `/dashboard/analytics/ces`
  - `/dashboard/analytics/csi`
- criado client local `src/features/analytics/api/analytics-metric.ts` para consumir:
  - `GET /api/analytics/nps`
  - `GET /api/analytics/csat`
  - `GET /api/analytics/ces`
  - `GET /api/analytics/csi`
- criado helper `src/features/analytics/schemas/analytics-metric.ts`
- criado componente compartilhado `src/features/analytics/components/analytics-metric-dashboard.tsx`
- cada dashboard agora exibe:
  - score atual
  - media simples dos registros filtrados
  - variacao entre os dois periodos mais recentes
  - quantidade de formularios e campanhas no recorte
  - filtro por periodo
  - filtro por ID de formulario
  - filtro por ID de campanha
  - linha de tendencia compacta dos ultimos registros
  - tabela de historico com atalhos para analytics por formulario e por campanha
  - estados de loading, erro e vazio
- o FE-07 ficou fechado com overview, dashboards por indicador, analytics detalhado por campanha/formulario e logs de envio implementados

Observacoes de contrato:

- os endpoints de lista por indicador ja estao descritos pelo Orval com `MetricResult[]`
- foi usado client local para manter URLs sem barra final e padronizar os quatro dashboards em um unico componente
- distribuicoes avancadas, como promotores/neutros/detratores, dependem de payloads agregados futuros; o MVP atual trabalha com `MetricResult`

Validacao:

- `bun run lint` passou; permanecem warnings preexistentes que nao bloqueiam a execucao
- `bun run build` passou

Smoke test manual:

- acessar `/dashboard/analytics/nps`
- acessar `/dashboard/analytics/csat`
- acessar `/dashboard/analytics/ces`
- acessar `/dashboard/analytics/csi`
- validar cards de score atual, media, variacao e escopo
- aplicar filtros por periodo, formulario e campanha
- validar linha de tendencia e tabela de historico
- abrir atalhos para analytics por formulario e por campanha

### FE-701 - Empty/loading/error states globais

Status: Implementado em 2026-06-28.

Resumo:

- revisada a copy dos estados globais de loading, erro e vazio nos módulos principais
- corrigidos textos em português, acentuação e mensagens de erro nos componentes compartilhados de plataforma
- atualizado `ModuleErrorAlert` para exibir "Erro ao carregar módulo" e fallback com acentuação correta
- revisados estados do dashboard overview e slots paralelos para mensagens em português
- normalizados textos de estados em analytics, delivery, surveys, contacts, campaigns, email templates e pesquisa pública
- removidos falsos positivos técnicos da revisão de copy, preservando imports e identificadores como `scroll-area`, `chat-area`, `area-graph` e chaves de ícones
- preservados contratos de API e arquivos gerados do Orval sem alterações funcionais

Validação:

- `git diff --check` sem erros de whitespace
- `bun run lint` passou; permanecem warnings preexistentes que não bloqueiam a execução
- `bun run build` passou

Smoke test manual:

- acessar páginas de listagem vazias em surveys, contacts, campaigns e email templates
- validar loading/error dos segmentos `/dashboard/surveys`, `/dashboard/contacts`, `/dashboard/campaigns`, `/dashboard/email-templates`, `/dashboard/analytics`, `/dashboard/delivery` e `/s/[token]`
- abrir `/dashboard/overview` e confirmar mensagens de erro em português caso algum slot falhe
- abrir dashboards de analytics e delivery sem dados e confirmar estados vazios com copy acentuada
- testar `/s/{token}` com token inválido e confirmar mensagem de erro pública em português

### FE-702 - Revisão de responsividade

Status: Implementado em 2026-06-28.

Resumo:

- revisados componentes compartilhados que afetam mobile, tablet e desktop
- `PageContainer` e `Heading` agora quebram header, descrição e ações sem estourar largura em telas pequenas
- cards base ganharam contenção de texto e espaçamento horizontal responsivo
- `DataTable`, `ModuleDataTable` e skeletons passaram a ter largura mínima segura, scroll horizontal e altura mínima menor em mobile
- toolbar, filtros, popovers e paginação de tabela agora empilham/quebram linha em mobile e mantêm controles escaneáveis em tablet/desktop
- `DialogContent` e `AlertDialogContent` ganharam `max-height`, scroll interno e padding responsivo para telas baixas
- ações de forms e footers de dialogs usam botões em largura cheia no mobile e voltam ao layout inline em telas maiores
- `InputGroup` recebeu `min-w-0`, contenção de overflow e ícones/botões com shrink controlado
- wizard de campanha recebeu ajuste de stepper, ações e previews para IDs longos/listas/templates em mobile
- gerenciador de perguntas recebeu ajustes em badges, botões de toolbar e listas de opções dentro de dialogs
- shell de módulo recebeu contenção de texto e correção de acentuação em copy visível

Validação:

- `git diff --check` sem erros de whitespace
- `bun run lint` passou; permanecem warnings preexistentes que não bloqueiam a execução
- `bun run build` passou

Smoke test manual:

- mobile 360x800: validar listagens em `/dashboard/surveys/forms`, `/dashboard/contacts/lists`, `/dashboard/campaigns`, `/dashboard/email-templates` e `/dashboard/delivery/logs`
- tablet 768x1024: validar toolbar de filtros, paginação, view options e cards de analytics
- desktop 1440x900: validar que tabelas continuam densas e não perdem alinhamento
- abrir dialogs de criar/editar/remover em contatos, surveys, campanhas e perguntas
- no wizard `/dashboard/campaigns/new`, navegar por todas as etapas e confirmar que botões, selects, previews e IDs longos não estouram o layout
- em `/dashboard/surveys/forms/{id}/questions`, abrir o modal de opções e validar scroll em telas baixas

### FE-703 - Revisão de Acessibilidade Mínima

Status: Implementado em 2026-06-29.

Resumo:

- revisados controles compartilhados de tabela para nomes acessíveis em filtros, seleção de colunas, cabeçalhos ordenáveis e paginação
- traduzidos rótulos acessíveis de paginação, filtros, estado vazio da tabela e menu de colunas
- `DialogContent` agora expõe o botão de fechar como `aria-label="Fechar"` com texto `sr-only` em português
- `ModuleLoading` ganhou `role="status"` e `aria-live="polite"` para anunciar carregamento de módulo
- `ModuleErrorAlert` ganhou `role="alert"` e fallback com acentuação correta
- adicionados nomes acessíveis em botões de ícone sem label no trigger da sidebar, handle do Kanban e remoção de membro no exemplo de formulário avançado
- `NotificationCenter` passou a anunciar a quantidade de notificações novas no botão
- wizard de campanha passou a associar `Label` aos campos via `htmlFor`/`id` e descrições via `aria-describedby`
- mantidos os ajustes sem alterar contratos de API ou fluxos funcionais

Validação:

- `git diff --check` sem erros de whitespace
- `bun run lint` passou; permanecem warnings preexistentes que não bloqueiam a execução
- `bun run build` passou

Smoke test manual:

- navegar por teclado em `/dashboard/campaigns/new`, passando por etapas, campos, selects e botões
- abrir e fechar dialogs em contatos, templates, campanhas e perguntas usando teclado
- validar que botões de ícone têm nome acessível em ações de tabela e toolbar
- abrir filtros de tabela por teclado e confirmar nomes de filtro, limpar filtro e seleção de colunas
- validar paginação de tabela com leitor de tela ou inspector de acessibilidade
- abrir `/dashboard/surveys/forms/{id}/questions` e confirmar labels de ações como mover, editar, remover e gerenciar opções

### FE-704 - Smoke test ponta a ponta

Status: Implementado em 2026-06-29.

Resumo:

- criado `scripts/smoke-e2e.mjs` para validar o fluxo principal pelo app Next e proxy `/api`
- adicionado script `smoke:e2e` em `package.json`
- criada documentacao de operacao em `docs/smoke-e2e.md`
- o smoke autentica um usuario existente, valida paginas protegidas com cookies e executa o workflow de negocio:
  - cria formulario, pergunta obrigatoria e publica o formulario
  - cria lista de contatos e contato ativo
  - cria template de email e valida preview
  - cria campanha, step inicial e agenda a campanha
  - valida detalhes de campanha, analytics por campanha/formulario e logs de entrega
- a etapa publica aceita `SMOKE_PUBLIC_SURVEY_TOKEN` para validar `/api/public/surveys/{token}`
- o submit publico exige `SMOKE_SUBMIT_PUBLIC_SURVEY=true` para evitar consumo acidental de token unico

Validacao:

- `node --check scripts/smoke-e2e.mjs`
- `npm run smoke:e2e -- --help`

Execucao em ambiente integrado:

- iniciar backend Django configurado em `.env.local`
- iniciar app Next em `SMOKE_BASE_URL` ou `http://localhost:3000`
- executar `SMOKE_EMAIL="..." SMOKE_PASSWORD="..." npm run smoke:e2e`
- opcionalmente informar `SMOKE_PUBLIC_SURVEY_TOKEN` e `SMOKE_SUBMIT_PUBLIC_SURVEY=true` com token descartavel para cobrir submissao publica
