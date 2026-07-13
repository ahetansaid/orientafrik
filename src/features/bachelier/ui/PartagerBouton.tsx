'use client';
import { useState, useTransition } from 'react';
import { partagerPlan } from '@/features/bachelier/actions/partager-plan';
import { track } from '@/lib/analytics/events';

export function PartagerBouton({ planId }: { planId: string }) {
  const [pending, startTransition] = useTransition();
  const [url, setUrl] = useState<string | null>(null);
  const [copie, setCopie] = useState(false);

  function partager() {
    startTransition(async () => {
      const res = await partagerPlan(planId);
      if (res.ok) {
        setUrl(res.data.url);
        track('plan_partage');
        try {
          await navigator.clipboard.writeText(res.data.url);
          setCopie(true);
        } catch {
          // presse-papier indisponible : l'URL reste affichée pour copie manuelle.
        }
      }
    });
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
      <p className="font-medium text-slate-700">Partage ton plan</p>
      <p className="mt-1 text-slate-500">
        Un aperçu (prénom + tes 3 pistes) — sans ta moyenne ni ton email.
      </p>
      <button
        onClick={partager}
        disabled={pending}
        className="mt-3 rounded-lg bg-navy px-4 py-2 font-medium text-white hover:bg-navy/90 disabled:opacity-60"
      >
        {pending ? 'Création du lien…' : copie ? 'Lien copié ✓' : 'Créer un lien de partage'}
      </button>
      {url && (
        <p className="mt-2 break-all rounded bg-slate-50 px-2 py-1 font-mono text-xs text-slate-600">
          {url}
        </p>
      )}
    </div>
  );
}
