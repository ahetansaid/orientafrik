import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import type { UserRole } from '@/lib/supabase/types';

// Préfixes d'URL protégés -> rôle requis. Premier filtre grossier UNIQUEMENT :
// la vraie frontière reste assertRole() (serveur) + la RLS Postgres. On ne fait
// jamais confiance au middleware seul pour l'autorisation.
const ROLE_PREFIXES: { prefix: string; role: UserRole }[] = [
  { prefix: '/admin', role: 'admin' },
  { prefix: '/ecole', role: 'ecole' },
  { prefix: '/consultant', role: 'consultant' },
  // Zone bachelier (mass audience, URLs à la racine).
  { prefix: '/profil', role: 'bachelier' },
  { prefix: '/plan', role: 'bachelier' },
  { prefix: '/reserver', role: 'bachelier' },
  { prefix: '/consultations', role: 'bachelier' },
];

const HOME_BY_ROLE: Record<UserRole, string> = {
  bachelier: '/profil',
  ecole: '/ecole/tableau-de-bord',
  consultant: '/consultant/tableau-de-bord',
  admin: '/admin/tableau-de-bord',
};

export async function proxy(request: NextRequest) {
  const { user, supabaseResponse, supabase } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const match = ROLE_PREFIXES.find(
    (r) => pathname === r.prefix || pathname.startsWith(r.prefix + '/'),
  );
  if (!match) return supabaseResponse;

  // Non connecté -> connexion (avec retour prévu).
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/connexion';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // Vérifie le rôle. On relit profiles avec le client déjà porteur de la session.
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile && profile.role !== match.role) {
    const url = request.nextUrl.clone();
    url.pathname = HOME_BY_ROLE[profile.role];
    url.search = '';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  // Exclut assets statiques et images. Le middleware tourne sur les pages + API.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
};
