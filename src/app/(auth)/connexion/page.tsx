'use client';
import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Mail } from 'lucide-react';
import { demanderOtp } from '@/features/compte/actions/connexion';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import type { ActionResult } from '@/shared/lib/result';

export default function ConnexionPage() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    (_prev, formData) => demanderOtp(_prev, formData),
    null,
  );

  useEffect(() => {
    if (state?.ok) {
      const email = (document.getElementById('email') as HTMLInputElement)?.value ?? '';
      router.push(`/verifier?email=${encodeURIComponent(email)}`);
    }
  }, [state, router]);

  return (
    <div className="space-y-4">
      <div>
        <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-navy/5 text-navy">
          <Mail className="h-5 w-5" />
        </span>
        <h1 className="text-lg font-bold text-navy">Connexion</h1>
        <p className="mt-1 text-sm text-slate-500">
          Reçois un code à 6 chiffres par email. Pas de mot de passe.
        </p>
      </div>
      <form action={formAction} className="space-y-3">
        <label htmlFor="email" className="sr-only">
          Adresse email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="ton.email@exemple.bj"
        />
        {state && !state.ok && (
          <p role="alert" className="text-sm text-red-600">
            {state.message}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? 'Envoi…' : 'Recevoir mon code'}
        </Button>
      </form>
    </div>
  );
}
