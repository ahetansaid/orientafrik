import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { HOME_BY_ROLE } from '@/lib/auth/guards';
import type { UserRole } from '@/lib/supabase/types';

// Callback du magic link : échange le code contre une session, puis redirige
// l'utilisateur vers l'accueil de son rôle (ou vers ?next= si fourni et sûr).
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const next = searchParams.get('next');

  if (!code) {
    return NextResponse.redirect(`${origin}/connexion?erreur=lien_invalide`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/connexion?erreur=lien_expire`);
  }

  // Destination : ?next interne uniquement (anti open-redirect), sinon accueil du rôle.
  if (next && next.startsWith('/') && !next.startsWith('//')) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  let role: UserRole = 'bachelier';
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (profile) role = profile.role;
  }

  return NextResponse.redirect(`${origin}${HOME_BY_ROLE[role]}`);
}
