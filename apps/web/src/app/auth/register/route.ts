import { NextRequest, NextResponse } from 'next/server';
import {
  mockUsers,
  mockSessions,
  createMockAccessToken,
  type MockUserRecord,
} from '@/lib/mock-auth-store';
import { isDisposableEmail, sanitizeInput } from '@/features/auth/security';

// Rate Limiting local simples por IP: máximo 5 tentativas de cadastro por IP a cada 10 minutos
const ipRateLimits = new Map<string, { count: number; expiresAt: number }>();

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    // 1. Rate Limiting Check
    const now = Date.now();
    const limitInfo = ipRateLimits.get(ip);
    if (limitInfo && limitInfo.expiresAt > now) {
      if (limitInfo.count >= 5) {
        const retryAfter = Math.ceil((limitInfo.expiresAt - now) / 1000);
        return NextResponse.json(
          { error: { code: 'RATE_LIMITED', message: 'Muitos cadastros em sequência. Aguarde alguns minutos.' } },
          { status: 429, headers: { 'Retry-After': String(retryAfter) } }
        );
      }
      limitInfo.count++;
    } else {
      ipRateLimits.set(ip, { count: 1, expiresAt: now + 10 * 60 * 1000 });
    }

    const body = await request.json();

    // 2. Honeypot Anti-Bot Check
    // Se o campo fantasma website_url foi preenchido, é um bot!
    if (body.website_url) {
      console.warn('[Security] Bot detectado via honeypot. Descartando silenciosamente:', ip);
      // Resposta 200 simulada para não alertar o bot de que foi detectado
      return NextResponse.json({ ok: true, user: { id: 'dummy', email: 'bot@blocked.local' } });
    }

    const email = body.email;
    const password = body.password;
    const username = body.username;
    const displayName = sanitizeInput(body.display_name ?? body.displayName);
    const acceptTerms = body.accept_terms ?? body.acceptTerms;
    const organization = sanitizeInput(body.organization);
    const professionalArea = sanitizeInput(body.professional_area ?? body.professionalArea);

    if (!email || !password || !username || !displayName) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Dados incompletos' } },
        { status: 400 }
      );
    }

    // 3. Verificação de e-mail descartável/temporário
    if (isDisposableEmail(email)) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', details: [{ field: 'email', message: 'Domínio de email temporário não permitido.' }] } },
        { status: 400 }
      );
    }

    if (!acceptTerms) {
      return NextResponse.json(
        { error: { code: 'TERMS_REQUIRED', message: 'Aceite dos termos é obrigatório' } },
        { status: 400 }
      );
    }

    const normEmail = String(email).trim().toLowerCase();
    const normUser = String(username).trim().toLowerCase();

    if (mockUsers.has(normEmail)) {
      return NextResponse.json(
        { error: { code: 'CONFLICT', details: [{ field: 'email' }] } },
        { status: 409 }
      );
    }

    if (mockUsers.has(normUser)) {
      return NextResponse.json(
        { error: { code: 'CONFLICT', details: [{ field: 'username' }] } },
        { status: 409 }
      );
    }

    const userId = crypto.randomUUID();
    const newUser: MockUserRecord = {
      id: userId,
      email: normEmail,
      username: normUser,
      displayName: displayName,
      role: 'user',
      mustChangePassword: false,
      organization: organization || null,
      professionalArea: professionalArea || null,
      createdAt: new Date().toISOString(),
    };

    mockUsers.set(normEmail, newUser);
    mockUsers.set(normUser, newUser);

    const sessionId = crypto.randomUUID();
    mockSessions.set(sessionId, { userId, createdAt: new Date() });

    const accessToken = await createMockAccessToken(newUser, sessionId);
    const cookieName = process.env.AUTH_ACCESS_COOKIE_NAME || 'kb_at';

    const response = NextResponse.json(
      {
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          display_name: newUser.displayName,
          role: newUser.role,
          must_change_password: false,
          email_verified: true,
          has_password: true,
        },
      },
      { status: 201 }
    );

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
    console.error('Erro no mock register:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Falha interna' } },
      { status: 500 }
    );
  }
}
