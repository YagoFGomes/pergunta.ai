/**
 * Generic backend proxy — catches all /api/* requests that don't have
 * a specific Next.js route handler and forwards them to the Django backend.
 *
 * This avoids CORS issues: the browser always calls the same origin (Next.js)
 * and the Node.js server communicates with Django server-to-server.
 *
 * Specific mock routes (e.g. /api/users, /api/products) still take precedence
 * over this catch-all because Next.js resolves exact routes before catch-alls.
 */
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000').replace(
  /\/$/,
  ''
);

const FORWARDED_REQUEST_HEADERS = ['content-type', 'authorization', 'accept'];
const FORWARDED_RESPONSE_HEADERS = ['content-type'];

async function proxyToBackend(request: NextRequest, pathSegments: string[]): Promise<NextResponse> {
  const targetUrl = `${BACKEND_BASE_URL}/api/${pathSegments.join('/')}/${request.nextUrl.search}`;

  const forwardHeaders = new Headers();
  for (const header of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(header);
    if (value) forwardHeaders.set(header, value);
  }

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
  const body = hasBody ? await request.text() : undefined;

  let backendResponse: Response;

  try {
    backendResponse = await fetch(targetUrl, {
      method: request.method,
      headers: forwardHeaders,
      body
    });
  } catch {
    return NextResponse.json(
      { detail: 'Backend is not reachable. Make sure the Django server is running.' },
      { status: 502 }
    );
  }

  if (backendResponse.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const responseBody = await backendResponse.text();
  const responseHeaders = new Headers();
  for (const header of FORWARDED_RESPONSE_HEADERS) {
    const value = backendResponse.headers.get(header);
    if (value) responseHeaders.set(header, value);
  }

  return new NextResponse(responseBody, {
    status: backendResponse.status,
    headers: responseHeaders
  });
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  return proxyToBackend(request, (await params).path);
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  return proxyToBackend(request, (await params).path);
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  return proxyToBackend(request, (await params).path);
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  return proxyToBackend(request, (await params).path);
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  return proxyToBackend(request, (await params).path);
}
