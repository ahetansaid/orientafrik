'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

function VerifierForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get('email') ?? '';
  const [pending, setPending] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur(null);
    const otp = (new FormData(e.currentTarget).get('code') as string)?.trim();
    if (!otp) return;
    setPending(true);
    const { error } = await authClient.signIn.emailOtp({ email, otp });
    setPending(false);
    if (error) {
      setErreur('Code incorrect ou expiré.');
      return;
    }
    // Le middleware/layout redirige ensuite selon le rôle.
    router.push('/');
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div>
        <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <h1 className="text-lg font-bold text-navy">Vérification</h1>
        <p className="mt-1 text-sm text-slate-500">
          Saisis le code à 6 chiffres envoyé à <span className="font-medium">{email}</span>.
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-3">
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
        {erreur && (
          <p role="alert" className="text-sm text-red-600">
            {erreur}
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
