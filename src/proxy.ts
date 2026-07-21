import { NextResponse, type NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

// Filtre grossier UNIQUEMENT : présence d'une session sur les zones protégées.
// La vraie frontière (rôle) est assertRole() dans chaque layout de groupe.
const PROTECTED_PREFIXES = ['/admin', '/ecole', '/consultant', '/profil', '/plan', '/reserver', '/consultations'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  );
  if (!isProtected) return NextResponse.next();

  // Lecture optimiste du cookie de session (pas d'appel DB dans le middleware).
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/connexion';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
