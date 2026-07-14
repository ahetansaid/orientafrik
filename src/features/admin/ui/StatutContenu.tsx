'use client';
import { useTransition } from 'react';
import { changerStatutContenu } from '@/features/admin/actions/contenu';
import type { ContenuStatut } from '@/lib/supabase/enums';

// Bascule le statut de publication d'un contenu (parcours / école / bourse).
export function StatutContenu({
  type,
  id,
  statut,
}: {
  type: 'parcours' | 'ecoles' | 'bourses';
  id: string;
  statut: ContenuStatut;
}) {
  const [pending, startTransition] = useTransition();

  function set(nouveau: ContenuStatut) {
    startTransition(async () => {
      await changerStatutContenu({ type, id, statut: nouveau });
    });
  }

  const options: ContenuStatut[] = ['draft', 'published', 'archived'];
  return (
    <select
      value={statut}
      disabled={pending}
      onChange={(e) => set(e.target.value as ContenuStatut)}
      className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
