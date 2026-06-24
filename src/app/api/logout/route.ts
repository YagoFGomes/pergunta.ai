import { NextRequest } from 'next/server';
import { proxyToBackend } from '../auth-proxy';

export async function POST(request: NextRequest) {
  return proxyToBackend(request, '/api/logout/');
}
