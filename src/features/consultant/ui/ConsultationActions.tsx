'use client';
import { useTransition } from 'react';
import { changerStatutConsultation } from '@/features/consultant/actions/statut-consultation';
import type { ConsultationStatut } from '@/lib/db/enums';

// Actions du consultant sur une consultation confirmée (terminer / annuler / no-show).
export function ConsultationActions({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  function set(statut: ConsultationStatut) {
    startTransition(async () => {
      await changerStatutConsultation(id, statut);
    });
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => set('completed')}
        disabled={pending}
        className="rounded border border-emerald-200 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
      >
        Terminée
      </button>
      <button
        onClick={() => set('no_show')}
        disabled={pending}
        className="rounded border border-amber-200 px-2 py-1 text-xs text-amber-700 hover:bg-amber-50 disabled:opacity-50"
      >
        Absent
      </button>
      <button
        onClick={() => set('cancelled')}
        disabled={pending}
        className="rounded border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
      >
        Annuler
      </button>
    </div>
  );
}
