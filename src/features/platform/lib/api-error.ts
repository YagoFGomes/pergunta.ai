export type ApiErrorBody = {
  detail?: unknown;
  message?: unknown;
  error?: unknown;
  errors?: unknown;
  non_field_errors?: unknown;
  [key: string]: unknown;
};

type AppApiErrorInput = {
  status: number;
  statusText: string;
  url?: string;
  body?: unknown;
  message?: string;
};

const DEFAULT_API_ERROR_MESSAGE = 'Nao foi possivel concluir a acao.';

export class AppApiError extends Error {
  status: number;
  statusText: string;
  url?: string;
  body?: unknown;

  constructor({ status, statusText, url, body, message }: AppApiErrorInput) {
    super(message ?? `API error: ${status} ${statusText}`);
    this.name = 'AppApiError';
    this.status = status;
    this.statusText = statusText;
    this.url = url;
    this.body = body;
  }
}

export function isAppApiError(error: unknown): error is AppApiError {
  return error instanceof AppApiError;
}

function normalizeErrorPart(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const trimmedValue = value.trim();
    return trimmedValue.length > 0 ? trimmedValue : undefined;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    const messages = value.map(normalizeErrorPart).filter(Boolean);
    return messages.length > 0 ? messages.join(' ') : undefined;
  }

  if (value && typeof value === 'object') {
    return extractApiErrorMessage(value as ApiErrorBody);
  }

  return undefined;
}

export function extractApiErrorMessage(body: unknown): string | undefined {
  if (!body) return undefined;

  if (typeof body !== 'object') {
    return normalizeErrorPart(body);
  }

  const errorBody = body as ApiErrorBody;
  const preferredMessage =
    normalizeErrorPart(errorBody.detail) ??
    normalizeErrorPart(errorBody.message) ??
    normalizeErrorPart(errorBody.error) ??
    normalizeErrorPart(errorBody.non_field_errors) ??
    normalizeErrorPart(errorBody.errors);

  if (preferredMessage) return preferredMessage;

  const fieldMessages = Object.entries(errorBody)
    .map(([field, value]) => {
      const message = normalizeErrorPart(value);
      return message ? `${field}: ${message}` : undefined;
    })
    .filter(Boolean);

  return fieldMessages.length > 0 ? fieldMessages.join(' ') : undefined;
}

async function readApiErrorBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? '';

  try {
    if (contentType.includes('application/json')) {
      return await response.json();
    }

    const text = await response.text();
    return text.trim().length > 0 ? text : undefined;
  } catch {
    return undefined;
  }
}

export async function createApiErrorFromResponse(
  response: Response,
  url?: string
): Promise<AppApiError> {
  const body = await readApiErrorBody(response);
  const message =
    extractApiErrorMessage(body) ?? `API error: ${response.status} ${response.statusText}`;

  return new AppApiError({
    status: response.status,
    statusText: response.statusText,
    url: url ?? response.url,
    body,
    message
  });
}

export function getErrorMessage(
  error: unknown,
  fallbackMessage = DEFAULT_API_ERROR_MESSAGE
): string {
  if (isAppApiError(error)) {
    return error.message || fallbackMessage;
  }

  if (error instanceof Error) {
    return error.message || fallbackMessage;
  }

  return normalizeErrorPart(error) ?? fallbackMessage;
}
