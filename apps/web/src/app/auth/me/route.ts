import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, createRemoteJWKSet, type JWTVerifyGetKey } from 'jose';
import { mockUsers, MOCK_PUB_JWK } from '@/lib/mock-auth-store';

let localJwks: JWTVerifyGetKey | undefined;

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401 });
    }

    if (!localJwks) {
      const issuer = process.env.AUTH_ISSUER || 'http://localhost:3000';
      localJwks = createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`));
    }

    const { payload } = await jwtVerify(token, localJwks, {
      issuer: process.env.AUTH_ISSUER || 'http://localhost:3000',
      audience: process.env.AUTH_AUDIENCE || 'knowledge-api',
    });

    const userId = payload.sub;
    let foundUser = null;
    for (const u of mockUsers.values()) {
      if (u.id === userId) {
        foundUser = u;
        break;
      }
    }

    if (!foundUser) {
      return NextResponse.json({ error: { code: 'NOT_FOUND' } }, { status: 404 });
    }

    return NextResponse.json({
      id: foundUser.id,
      email: foundUser.email,
      username: foundUser.username,
      display_name: foundUser.displayName,
      role: foundUser.role,
      must_change_password: foundUser.mustChangePassword,
      email_verified: true,
      has_password: true,
    });
  } catch (error) {
    return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401 });
  }
}
