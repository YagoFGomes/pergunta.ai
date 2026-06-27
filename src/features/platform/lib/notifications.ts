'use client';

import { toast } from 'sonner';

import { getErrorMessage } from '@/features/platform/lib/api-error';

const DEFAULT_SUCCESS_MESSAGE = 'Operacao concluida.';
const DEFAULT_ERROR_MESSAGE = 'Nao foi possivel concluir a acao.';

export type ModuleMutationFeedbackMessages = {
  success?: string;
  error?: string;
};

export function notifySuccess(message = DEFAULT_SUCCESS_MESSAGE, description?: string) {
  toast.success(message, description ? { description } : undefined);
}

export function notifyError(error: unknown, fallbackMessage = DEFAULT_ERROR_MESSAGE) {
  toast.error(getErrorMessage(error, fallbackMessage));
}

export function createMutationFeedback(messages: ModuleMutationFeedbackMessages = {}) {
  return {
    onSuccess: () => notifySuccess(messages.success),
    onError: (error: unknown) => notifyError(error, messages.error)
  };
}
