import { NextRequest, NextResponse } from 'next/server';
import {
  mockUsers,
  mockSessions,
  createMockAccessToken,
} from '@/lib/mock-auth-store';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('kb_rt')?.value;

    if (!refreshToken || !mockSessions.has(refreshToken)) {
      return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401 });
    }

    const session = mockSessions.get(refreshToken)!;
    let foundUser = null;
    for (const u of mockUsers.values()) {
      if (u.id === session.userId) {
        foundUser = u;
        break;
      }
    }

    if (!foundUser) {
      return NextResponse.json({ error: { code: 'NOT_FOUND' } }, { status: 404 });
    }

    // Rotaciona o refresh token
    mockSessions.delete(refreshToken);
    const newSessionId = crypto.randomUUID();
    mockSessions.set(newSessionId, { userId: foundUser.id, createdAt: new Date() });

    const accessToken = await createMockAccessToken(foundUser, newSessionId);
    const cookieName = process.env.AUTH_ACCESS_COOKIE_NAME || 'kb_at';

    const response = NextResponse.json({ ok: true });
    response.cookies.set(cookieName, accessToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 3600,
    });

    response.cookies.set('kb_rt', newSessionId, {
      path: '/auth',
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 7 * 86400,
    });

    return response;
  } catch {
    return NextResponse.json({ error: { code: 'SERVER_ERROR' } }, { status: 500 });
  }
}
