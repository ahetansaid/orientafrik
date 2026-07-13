'use client';
import { useState, useTransition } from 'react';
import { avancerCandidature } from '@/features/ecole/actions/avancer-candidature';
import type { InscriptionStatut } from '@/lib/supabase/types';

// Boutons d'avancement selon l'état courant de la candidature.
export function CandidatureActions({
  id,
  statut,
}: {
  id: string;
  statut: InscriptionStatut;
}) {
  const [pending, startTransition] = useTransition();
  const [erreur, setErreur] = useState<string | null>(null);

  function avancer(vers: 'candidature' | 'inscrite' | 'annulee') {
    setErreur(null);
    startTransition(async () => {
      const res = await avancerCandidature({ inscriptionId: id, statut: vers });
      if (!res.ok) setErreur(res.message);
    });
  }

  if (statut === 'inscrite' || statut === 'annulee') return null;

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        {statut === 'orientee' && (
          <Btn onClick={() => avancer('candidature')} disabled={pending} tone="navy">
            Passer en candidature
          </Btn>
        )}
        {statut === 'candidature' && (
          <Btn onClick={() => avancer('inscrite')} disabled={pending} tone="emerald">
            Confirmer l’inscription
          </Btn>
        )}
        <Btn onClick={() => avancer('annulee')} disabled={pending} tone="red">
          Annuler
        </Btn>
      </div>
      {erreur && <span className="text-xs text-red-600">{erreur}</span>}
    </div>
  );
}

function Btn({
  children,
  onClick,
  disabled,
  tone,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  tone: 'navy' | 'emerald' | 'red';
}) {
  const tones = {
    navy: 'border-slate-300 text-navy hover:bg-slate-50',
    emerald: 'border-emerald-200 text-emerald-700 hover:bg-emerald-50',
    red: 'border-red-200 text-red-700 hover:bg-red-50',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded border px-2 py-1 text-xs disabled:opacity-50 ${tones[tone]}`}
    >
      {children}
    </button>
  );
}
