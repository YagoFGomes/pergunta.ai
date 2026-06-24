import { NextRequest } from 'next/server';
import { proxyToBackend } from '../auth-proxy';

export async function GET(request: NextRequest) {
  return proxyToBackend(request, '/api/me/');
}
