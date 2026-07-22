'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, KeyRound, Sparkles } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

export default function ConnexionPage() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur(null);
    const email = (new FormData(e.currentTarget).get('email') as string)?.trim();
    if (!email) return;
    setPending(true);
    const { error } = await authClient.emailOtp.sendVerificationOtp({ email, type: 'sign-in' });
    setPending(false);
    if (error) {
      setErreur("Envoi du code impossible. Réessaie dans un instant.");
      return;
    }
    router.push(`/verifier?email=${encodeURIComponent(email)}`);
  }

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
      <form onSubmit={onSubmit} className="space-y-3">
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
        {erreur && (
          <p role="alert" className="text-sm text-red-600">
            {erreur}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? 'Envoi…' : 'Recevoir mon code'}
        </Button>
      </form>

      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 border-t border-slate-100 pt-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <KeyRound className="h-3.5 w-3.5 text-navy" /> Sans mot de passe
        </span>
        <span className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-gold" /> Gratuit pour démarrer
        </span>
      </div>
    </div>
  );
}
