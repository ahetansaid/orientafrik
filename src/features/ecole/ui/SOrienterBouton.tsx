'use client';
import { useState, useTransition } from 'react';
import { sOrienter } from '@/features/ecole/actions/s-orienter';

// Un bachelier se déclare intéressé par une école. Non connecté -> l'action
// redirige vers /connexion.
export function SOrienterBouton({ ecoleId }: { ecoleId: string }) {
  const [pending, startTransition] = useTransition();
  const [fait, setFait] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  function orienter() {
    setErreur(null);
    startTransition(async () => {
      const res = await sOrienter(ecoleId);
      if (res.ok) setFait(true);
      else setErreur(res.message);
    });
  }

  return (
    <div>
      <button
        onClick={orienter}
        disabled={pending || fait}
        className="rounded-lg bg-navy px-5 py-2.5 font-semibold text-white hover:bg-navy/90 disabled:opacity-60"
      >
        {fait ? 'Intérêt enregistré ✓' : pending ? 'Enregistrement…' : 'Je m’intéresse à cette école'}
      </button>
      {erreur && <p className="mt-2 text-sm text-red-600">{erreur}</p>}
    </div>
  );
}
