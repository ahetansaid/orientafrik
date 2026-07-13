'use client';
import { useState, useTransition } from 'react';
import { demarrerPaiementPdf } from '@/features/bachelier/actions/demarrer-paiement-pdf';
import { TARIF_PDF_FCFA } from '@/shared/lib/constants';
import { fcfa } from '@/shared/lib/format';

export function PaywallPdf({ planId }: { planId: string }) {
  const [pending, startTransition] = useTransition();
  const [erreur, setErreur] = useState<string | null>(null);

  function payer() {
    setErreur(null);
    startTransition(async () => {
      const res = await demarrerPaiementPdf(planId);
      if (res.ok) {
        window.location.href = res.data.checkoutUrl;
      } else {
        setErreur(res.message);
      }
    });
  }

  return (
    <footer className="rounded-xl bg-navy p-5 text-center text-white">
      <p className="text-sm">
        Le dossier complet — 10 pages, curriculum détaillé, comparatif écoles, témoignages.
      </p>
      <button
        onClick={payer}
        disabled={pending}
        className="mt-3 rounded-lg bg-gold px-5 py-2.5 font-semibold text-white hover:bg-gold/90 disabled:opacity-60"
      >
        {pending ? 'Redirection vers le paiement…' : `Télécharger le PDF pour ${fcfa(TARIF_PDF_FCFA)}`}
      </button>
      {erreur && <p className="mt-2 text-sm text-amber-200">{erreur}</p>}
    </footer>
  );
}
