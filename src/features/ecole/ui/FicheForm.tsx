'use client';
import { useActionState } from 'react';
import { majFicheEcole } from '@/features/ecole/actions/maj-fiche';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import type { ActionResult } from '@/shared/lib/result';

export interface FicheDefaults {
  nom: string;
  ville: string;
  description: string;
  fraisMinFcfa: number | null;
  fraisMaxFcfa: number | null;
}

export function FicheForm({ defauts }: { defauts: FicheDefaults }) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    (_prev, formData) => majFicheEcole(_prev, formData),
    null,
  );

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
      <Champ label="Nom de l’école" htmlFor="nom">
        <Input id="nom" name="nom" required defaultValue={defauts.nom} maxLength={120} />
      </Champ>
      <Champ label="Ville" htmlFor="ville">
        <Input id="ville" name="ville" defaultValue={defauts.ville} maxLength={80} />
      </Champ>
      <Champ label="Description" htmlFor="description">
        <textarea
          id="description"
          name="description"
          defaultValue={defauts.description}
          maxLength={2000}
          rows={4}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
        />
      </Champ>
      <div className="grid grid-cols-2 gap-4">
        <Champ label="Frais min (FCFA)" htmlFor="fraisMinFcfa">
          <Input
            id="fraisMinFcfa"
            name="fraisMinFcfa"
            type="number"
            min={0}
            defaultValue={defauts.fraisMinFcfa ?? ''}
          />
        </Champ>
        <Champ label="Frais max (FCFA)" htmlFor="fraisMaxFcfa">
          <Input
            id="fraisMaxFcfa"
            name="fraisMaxFcfa"
            type="number"
            min={0}
            defaultValue={defauts.fraisMaxFcfa ?? ''}
          />
        </Champ>
      </div>

      {state && (
        <p role="alert" className={`text-sm ${state.ok ? 'text-emerald-600' : 'text-red-600'}`}>
          {state.ok ? 'Fiche mise à jour.' : state.message}
        </p>
      )}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? 'Enregistrement…' : 'Enregistrer'}
      </Button>
    </form>
  );
}

function Champ({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}
