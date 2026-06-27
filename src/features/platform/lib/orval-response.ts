type OrvalDataResponse<TData> = {
  data: TData;
  status?: number;
  headers?: Headers;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

export function getOrvalResponseData<TData>(
  response: OrvalDataResponse<TData> | TData | null | undefined
): TData | undefined {
  if (response === null || response === undefined) return undefined;

  const unknownResponse: unknown = response;

  if (isRecord(unknownResponse) && Object.prototype.hasOwnProperty.call(unknownResponse, 'data')) {
    return unknownResponse.data as TData;
  }

  return response as TData;
}
