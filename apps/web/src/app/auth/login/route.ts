import { NextRequest, NextResponse } from 'next/server';
import {
  mockUsers,
  mockSessions,
  createMockAccessToken,
} from '@/lib/mock-auth-store';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: { code: 'INVALID_CREDENTIALS', message: 'Credenciais inválidas' } },
        { status: 401 }
      );
    }

    const normEmail = String(email).trim().toLowerCase();
    const user = mockUsers.get(normEmail);

    if (!user) {
      return NextResponse.json(
        { error: { code: 'INVALID_CREDENTIALS', message: 'Credenciais inválidas' } },
        { status: 401 }
      );
    }

    const sessionId = crypto.randomUUID();
    mockSessions.set(sessionId, { userId: user.id, createdAt: new Date() });

    const accessToken = await createMockAccessToken(user, sessionId);
    const cookieName = process.env.AUTH_ACCESS_COOKIE_NAME || 'kb_at';

    const response = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        display_name: user.displayName,
        role: user.role,
        must_change_password: user.mustChangePassword,
        email_verified: true,
        has_password: true,
      },
    });

    response.cookies.set(cookieName, accessToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 3600,
    });

    response.cookies.set('kb_rt', sessionId, {
      path: '/auth',
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 7 * 86400,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Falha no login' } },
      { status: 500 }
    );
  }
}
