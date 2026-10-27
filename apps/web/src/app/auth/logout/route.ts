import { NextResponse } from 'next/server';

export async function POST() {
  const cookieName = process.env.AUTH_ACCESS_COOKIE_NAME || 'kb_at';
  const response = NextResponse.json({ ok: true });

  response.cookies.delete(cookieName);
  response.cookies.set(cookieName, '', { path: '/', maxAge: 0 });
  response.cookies.delete('kb_rt');
  response.cookies.set('kb_rt', '', { path: '/auth', maxAge: 0 });

  return response;
}
