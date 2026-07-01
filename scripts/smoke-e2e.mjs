#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import process from 'node:process';

const DEFAULT_BASE_URL = 'http://localhost:3000';
const SMOKE_PREFIX = 'FE704';
const DASHBOARD_PATHS = [
  '/dashboard/surveys/forms',
  '/dashboard/contacts/lists',
  '/dashboard/email-templates',
  '/dashboard/campaigns',
  '/dashboard/analytics/overview',
  '/dashboard/delivery/logs'
];

class SmokeError extends Error {
  constructor(message, details) {
    super(message);
    this.name = 'SmokeError';
    this.details = details;
  }
}

function loadDotEnv(path = '.env.local') {
  if (!existsSync(path)) return;

  const lines = readFileSync(path, 'utf8').split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;

    const [key, ...parts] = trimmed.split('=');
    const value = parts.join('=').trim().replace(/^['"]|['"]$/g, '');

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function readEnv(...keys) {
  for (const key of keys) {
    const value = process.env[key];
    if (value && value.trim()) return value.trim();
  }

  return undefined;
}

function isEnabled(value) {
  return ['1', 'true', 'yes', 'sim'].includes(String(value ?? '').toLowerCase());
}

function normalizeBaseUrl(value) {
  return (value || DEFAULT_BASE_URL).replace(/\/$/, '');
}

function slugPart() {
  return Date.now().toString(36);
}

function toData(payload) {
  if (payload && typeof payload === 'object' && Object.hasOwn(payload, 'data')) {
    return payload.data;
  }

  return payload;
}

function toItems(payload) {
  const data = toData(payload);
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && Array.isArray(data.results)) return data.results;
  return [];
}

function assertRecord(value, label) {
  const data = toData(value);

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new SmokeError(`${label} did not return an object.`, { data });
  }

  return data;
}

function assertId(value, label) {
  const record = assertRecord(value, label);

  if (!record.id || typeof record.id !== 'string') {
    throw new SmokeError(`${label} did not return an id.`, { record });
  }

  return record;
}

function getErrorMessage(error) {
  if (error instanceof SmokeError) {
    const details = error.details ? `\n${JSON.stringify(error.details, null, 2)}` : '';
    return `${error.message}${details}`;
  }

  if (error instanceof Error) return error.message;
  return String(error);
}

function buildQuestionAnswer(question) {
  if (question.question_type === 'TEXT') {
    return {
      question_id: question.id,
      answer_text: 'Resposta smoke FE-704'
    };
  }

  if (question.question_type === 'SCALE_1_5' || question.question_type === 'SCALE_0_10') {
    const rating = question.question_type === 'SCALE_1_5' ? 5 : 10;
    return {
      question_id: question.id,
      answer_rating: rating,
      answer_number: rating
    };
  }

  const option = Array.isArray(question.options) ? question.options[0] : undefined;
  if (!option?.id) {
    throw new SmokeError('Public choice question has no options to answer.', { question });
  }

  return {
    question_id: question.id,
    answer_choice_id: option.id
  };
}

class SmokeClient {
  constructor(config) {
    this.config = config;
    this.accessToken = '';
    this.refreshToken = '';
  }

  headers(options = {}) {
    const headers = {
      Accept: options.accept ?? 'application/json',
      ...options.headers
    };

    if (options.json !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    if (options.auth !== false && this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    if (options.cookieAuth) {
      headers.Cookie = [
        `pergunta_access_token=${encodeURIComponent(this.accessToken)}`,
        `pergunta_refresh_token=${encodeURIComponent(this.refreshToken)}`
      ].join('; ');
    }

    return headers;
  }

  async request(path, options = {}) {
    const response = await fetch(`${this.config.baseUrl}${path}`, {
      method: options.method ?? 'GET',
      headers: this.headers(options),
      body: options.json === undefined ? undefined : JSON.stringify(options.json),
      redirect: options.redirect ?? 'follow'
    });

    const text = await response.text();
    const contentType = response.headers.get('content-type') ?? '';
    const payload = contentType.includes('application/json') && text ? JSON.parse(text) : text;
    const expected = options.expected ?? [200];

    if (!expected.includes(response.status)) {
      throw new SmokeError(`${options.label ?? path} failed with HTTP ${response.status}.`, {
        method: options.method ?? 'GET',
        path,
        expected,
        payload
      });
    }

    return {
      payload,
      response,
      text
    };
  }

  async login() {
    const { payload } = await this.request('/api/login/', {
      method: 'POST',
      auth: false,
      json: {
        email: this.config.email,
        password: this.config.password
      },
      label: 'login'
    });
    const tokenPair = toData(payload);

    if (!tokenPair?.access || !tokenPair?.refresh) {
      throw new SmokeError('Login did not return access/refresh tokens.', { payload });
    }

    this.accessToken = tokenPair.access;
    this.refreshToken = tokenPair.refresh;
  }

  async page(path) {
    return this.request(path, {
      accept: 'text/html',
      cookieAuth: true,
      expected: [200],
      redirect: 'manual',
      label: `page ${path}`
    });
  }

  async get(path, label) {
    const { payload } = await this.request(path, { label });
    return toData(payload);
  }

  async post(path, json, label, expected = [200, 201]) {
    const { payload } = await this.request(path, {
      method: 'POST',
      json,
      expected,
      label
    });
    return toData(payload);
  }
}

function step(name) {
  process.stdout.write(`\n[FE-704] ${name}\n`);
}

function ok(message) {
  process.stdout.write(`  OK ${message}\n`);
}

function note(message) {
  process.stdout.write(`  NOTE ${message}\n`);
}

async function resolveFramework(client) {
  const frameworksPayload = await client.get(
    '/api/surveys/frameworks/?is_active=true',
    'list active frameworks'
  );
  const existingFramework = toItems(frameworksPayload).find((framework) => framework?.id);

  if (existingFramework) {
    ok(`using framework ${existingFramework.code ?? existingFramework.id}`);
    return existingFramework;
  }

  const suffix = slugPart().toUpperCase();
  const framework = await client.post(
    '/api/surveys/frameworks/',
    {
      code: `SMK${suffix}`.slice(0, 20),
      name: `Smoke FE-704 ${suffix}`,
      description: 'Framework criado pelo smoke FE-704.',
      is_active: true
    },
    'create smoke framework'
  );

  ok(`created framework ${framework.code}`);
  return assertId(framework, 'created framework');
}

async function createSmokeData(client) {
  const suffix = slugPart();
  const framework = await resolveFramework(client);

  const form = assertId(
    await client.post(
      '/api/surveys/forms/',
      {
        framework: framework.id,
        title: `${SMOKE_PREFIX} Survey ${suffix}`,
        description: 'Formulario criado pelo smoke ponta a ponta.'
      },
      'create survey form'
    ),
    'created survey form'
  );
  ok(`created survey form ${form.id}`);

  const question = assertId(
    await client.post(
      `/api/surveys/forms/${form.id}/questions/`,
      {
        label: 'Qual a chance de recomendar o pergunta.ai?',
        question_type: 'SCALE_0_10',
        is_required: true
      },
      'create survey question'
    ),
    'created survey question'
  );
  ok(`created question ${question.id}`);

  const publishedForm = assertId(
    await client.post(`/api/surveys/forms/${form.id}/publish/`, form, 'publish survey form'),
    'published survey form'
  );
  ok(`published survey form with status ${publishedForm.status ?? 'unknown'}`);

  const contactList = assertId(
    await client.post(
      '/api/contacts/lists/',
      {
        name: `${SMOKE_PREFIX} Lista ${suffix}`,
        description: 'Lista criada pelo smoke FE-704.',
        status: 'ACTIVE'
      },
      'create contact list'
    ),
    'created contact list'
  );
  ok(`created contact list ${contactList.id}`);

  const contact = assertId(
    await client.post(
      `/api/contacts/lists/${contactList.id}/contacts/`,
      {
        name: 'Smoke Respondente',
        email: `smoke-${suffix}@example.com`,
        phone: '+5511999999999',
        custom_fields: {
          source: 'FE-704'
        },
        consent: true,
        status: 'ACTIVE'
      },
      'create contact'
    ),
    'created contact'
  );
  ok(`created contact ${contact.email}`);

  const template = assertId(
    await client.post(
      '/api/email-templates/',
      {
        name: `${SMOKE_PREFIX} Template ${suffix}`,
        slug: `fe704-smoke-${suffix}`,
        template_type: 'WELCOME',
        subject: 'Pesquisa {{ contact_name }}',
        html_content:
          '<p>Ola {{ contact_name }}, responda a pesquisa em <a href="{{ survey_link }}">survey_link</a>.</p>',
        plain_text_content: 'Ola {{ contact_name }}, responda em {{ survey_link }}.',
        required_variables: ['contact_name', 'survey_link'],
        is_default: false,
        language: 'pt-BR',
        status: 'ACTIVE'
      },
      'create email template'
    ),
    'created email template'
  );
  ok(`created email template ${template.id}`);

  await client.post(
    `/api/email-templates/${template.id}/preview/`,
    {
      variables: {
        contact_name: 'Smoke Respondente',
        survey_link: 'https://pergunta.ai/s/smoke'
      }
    },
    'preview email template',
    [200]
  );
  ok('rendered email template preview');

  const campaign = assertId(
    await client.post(
      '/api/campaigns/',
      {
        name: `${SMOKE_PREFIX} Campanha ${suffix}`,
        description: 'Campanha criada pelo smoke FE-704.',
        form: form.id,
        delivery_channel: 'EMAIL',
        email_list: contactList.id,
        webhook_url: '',
        timezone: 'America/Sao_Paulo'
      },
      'create campaign'
    ),
    'created campaign'
  );
  ok(`created campaign ${campaign.id}`);

  const campaignStep = assertId(
    await client.post(
      `/api/campaigns/${campaign.id}/steps/`,
      {
        step_type: 'INITIAL',
        order: 1,
        email_template: template.id,
        delay_days: 0,
        delay_hours: 0,
        send_condition: 'ALWAYS'
      },
      'create campaign step'
    ),
    'created campaign step'
  );
  ok(`created campaign step ${campaignStep.id}`);

  const today = new Date().toISOString().slice(0, 10);
  const scheduledCampaign = assertRecord(
    await client.post(
      `/api/campaigns/${campaign.id}/schedule/`,
      {
        start_date: today,
        start_time: '09:00',
        timezone: 'America/Sao_Paulo'
      },
      'schedule campaign'
    ),
    'scheduled campaign'
  );
  ok(`scheduled campaign with status ${scheduledCampaign.status ?? 'unknown'}`);

  await client.get(`/api/campaigns/${campaign.id}/`, 'retrieve campaign');
  await client.get(`/api/campaigns/${campaign.id}/steps/`, 'list campaign steps');
  await client.get(`/api/analytics/campaigns/${campaign.id}/`, 'campaign analytics');
  await client.get(`/api/analytics/forms/${form.id}/`, 'form analytics');
  await client.get(`/api/email-delivery/logs/?campaign=${campaign.id}`, 'campaign delivery logs');
  ok('validated campaign detail, analytics and delivery log endpoints');

  return {
    campaign,
    contact,
    contactList,
    form,
    question,
    template
  };
}

async function smokePublicSurvey(client) {
  const token = client.config.publicSurveyToken;

  if (!token) {
    note('SMOKE_PUBLIC_SURVEY_TOKEN not provided; public survey GET/submit skipped.');
    return;
  }

  const publicForm = assertRecord(
    await client.get(`/api/public/surveys/${token}`, 'retrieve public survey'),
    'public survey'
  );
  const questions = Array.isArray(publicForm.questions) ? publicForm.questions : [];

  if (questions.length === 0) {
    throw new SmokeError('Public survey token returned no questions.', { publicForm });
  }

  ok(`loaded public survey ${publicForm.title ?? token} with ${questions.length} questions`);

  if (!client.config.submitPublicSurvey) {
    note('SMOKE_SUBMIT_PUBLIC_SURVEY=true not set; public submit skipped to preserve token.');
    return;
  }

  const payload = {
    answers: questions.filter((question) => question.is_required).map(buildQuestionAnswer)
  };

  if (payload.answers.length === 0) {
    payload.answers = [buildQuestionAnswer(questions[0])];
  }

  await client.post(`/api/public/surveys/${token}/submit`, payload, 'submit public survey', [200]);
  ok('submitted public survey response');
}

function printHelp() {
  process.stdout.write(`
FE-704 smoke ponta a ponta

Usage:
  npm run smoke:e2e

Required:
  SMOKE_EMAIL             Login email for an existing pergunta.ai user.
  SMOKE_PASSWORD          Login password.

Optional:
  SMOKE_BASE_URL          Next app URL. Default: ${DEFAULT_BASE_URL}
  SMOKE_PUBLIC_SURVEY_TOKEN
                          Existing one-time CampaignRecipient token for /s/[token].
  SMOKE_SUBMIT_PUBLIC_SURVEY=true
                          Also submit answers for SMOKE_PUBLIC_SURVEY_TOKEN.
  SMOKE_SKIP_PAGES=true   Skip protected dashboard page checks.
`);
}

async function main() {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    printHelp();
    return;
  }

  loadDotEnv();

  const config = {
    baseUrl: normalizeBaseUrl(readEnv('SMOKE_BASE_URL', 'FE_SMOKE_BASE_URL')),
    email: readEnv('SMOKE_EMAIL', 'FE_SMOKE_EMAIL'),
    password: readEnv('SMOKE_PASSWORD', 'FE_SMOKE_PASSWORD'),
    publicSurveyToken: readEnv('SMOKE_PUBLIC_SURVEY_TOKEN', 'FE_SMOKE_PUBLIC_SURVEY_TOKEN'),
    submitPublicSurvey: isEnabled(
      readEnv('SMOKE_SUBMIT_PUBLIC_SURVEY', 'FE_SMOKE_SUBMIT_PUBLIC_SURVEY')
    ),
    skipPages: isEnabled(readEnv('SMOKE_SKIP_PAGES', 'FE_SMOKE_SKIP_PAGES'))
  };

  if (!config.email || !config.password) {
    throw new SmokeError('Missing SMOKE_EMAIL/SMOKE_PASSWORD.');
  }

  const client = new SmokeClient(config);

  step(`target ${config.baseUrl}`);
  await client.request('/auth/sign-in', {
    accept: 'text/html',
    auth: false,
    expected: [200],
    label: 'sign-in page'
  });
  ok('sign-in page is reachable');

  step('authenticate');
  await client.login();
  ok(`authenticated ${config.email}`);

  const currentUser = assertRecord(await client.get('/api/me/', 'current user'), 'current user');
  ok(`loaded current user ${currentUser.email ?? currentUser.id}`);

  if (!config.skipPages) {
    step('protected dashboard pages');
    for (const path of DASHBOARD_PATHS) {
      await client.page(path);
      ok(`${path} returned 200`);
    }
  }

  step('business workflow');
  const created = await createSmokeData(client);

  step('public survey');
  await smokePublicSurvey(client);

  step('summary');
  ok(`form: ${created.form.id}`);
  ok(`question: ${created.question.id}`);
  ok(`contact list: ${created.contactList.id}`);
  ok(`contact: ${created.contact.id}`);
  ok(`template: ${created.template.id}`);
  ok(`campaign: ${created.campaign.id}`);
}

main().catch((error) => {
  process.stderr.write(`\n[FE-704] FAILED\n${getErrorMessage(error)}\n`);
  process.exitCode = 1;
});
