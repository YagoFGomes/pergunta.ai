import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000').replace(
  /\/$/,
  ''
);

async function readRequestBody(request: NextRequest): Promise<BodyInit | undefined> {
  if (request.method === 'GET' || request.method === 'HEAD') {
    return undefined;
  }

  const bodyText = await request.text();
  return bodyText.length > 0 ? bodyText : undefined;
}

function createForwardHeaders(request: NextRequest): Headers {
  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  const authorization = request.headers.get('authorization');

  if (contentType) {
    headers.set('content-type', contentType);
  }

  if (authorization) {
    headers.set('authorization', authorization);
  }

  return headers;
}

async function proxyToBackend(request: NextRequest, path: string) {
  const response = await fetch(`${BACKEND_BASE_URL}${path}`, {
    method: request.method,
    headers: createForwardHeaders(request),
    body: await readRequestBody(request)
  });

  const contentType = response.headers.get('content-type') ?? '';

  if (response.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  if (contentType.includes('application/json')) {
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  }

  return new NextResponse(await response.text(), {
    status: response.status,
    headers: contentType ? { 'content-type': contentType } : undefined
  });
}

export { proxyToBackend };
