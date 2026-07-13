'use client';
import { Suspense, useActionState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifierOtp } from '@/features/compte/actions/connexion';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import type { ActionResult } from '@/shared/lib/result';

function VerifierForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get('email') ?? '';

  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    (_prev, formData) => verifierOtp(_prev, formData),
    null,
  );

  useEffect(() => {
    // Le callback route déterminera l'accueil du rôle ; ici on renvoie sur / qui
    // laissera le middleware/layout rediriger selon le profil.
    if (state?.ok) router.push('/');
  }, [state, router]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-navy">Vérification</h1>
        <p className="mt-1 text-sm text-slate-500">
          Saisis le code à 6 chiffres envoyé à <span className="font-medium">{email}</span>.
        </p>
      </div>
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="email" value={email} />
        <label htmlFor="code" className="sr-only">
          Code de vérification
        </label>
        <Input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{6}"
          maxLength={6}
          required
          placeholder="123456"
          className="text-center text-lg tracking-[0.4em]"
        />
        {state && !state.ok && (
          <p role="alert" className="text-sm text-red-600">
            {state.message}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? 'Vérification…' : 'Me connecter'}
        </Button>
      </form>
    </div>
  );
}

export default function VerifierPage() {
  return (
    <Suspense fallback={null}>
      <VerifierForm />
    </Suspense>
  );
}
