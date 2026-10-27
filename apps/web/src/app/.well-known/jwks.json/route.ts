import { NextResponse } from 'next/server';
import { MOCK_PUB_JWK } from '@/lib/mock-auth-store';

export async function GET() {
  return NextResponse.json({
    keys: [MOCK_PUB_JWK],
  });
}
