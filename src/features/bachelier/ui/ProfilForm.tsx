'use client';
import { useActionState } from 'react';
import { soumettreProfil } from '@/features/bachelier/actions/soumettre-profil';
import { SERIES_BAC, MOBILITES, INTERETS } from '@/features/bachelier/domain/profil.schema';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import type { ActionResult } from '@/shared/lib/result';

const LIBELLE_INTERET: Record<(typeof INTERETS)[number], string> = {
  sante: 'Santé',
  sciences: 'Sciences',
  technologie: 'Technologie',
  logique: 'Logique / maths',
  business: 'Business',
  communication: 'Communication',
  creer: 'Créer / concevoir',
  aider: 'Aider les autres',
  organiser: 'Organiser / gérer',
};

const LIBELLE_MOBILITE: Record<(typeof MOBILITES)[number], string> = {
  cotonou: 'Cotonou',
  benin: 'Bénin',
  uemoa: 'UEMOA (sous-région)',
  international: 'International',
};

export function ProfilForm() {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    (_prev, formData) => soumettreProfil(_prev, formData),
    null,
  );

  return (
    <form action={formAction} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Ton prénom" htmlFor="prenom">
          <Input id="prenom" name="prenom" required maxLength={60} placeholder="Aïcha" />
        </Field>
        <Field label="Série du bac" htmlFor="serie">
          <select id="serie" name="serie" required className={selectCls} defaultValue="">
            <option value="" disabled>
              Choisir…
            </option>
            {SERIES_BAC.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Moyenne au bac (/20)" htmlFor="moyenne">
          <Input
            id="moyenne"
            name="moyenne"
            type="number"
            step="0.01"
            min={0}
            max={20}
            required
            placeholder="12.5"
          />
        </Field>
        <Field label="Budget annuel (FCFA)" htmlFor="budgetAnnuelFcfa">
          <Input
            id="budgetAnnuelFcfa"
            name="budgetAnnuelFcfa"
            type="number"
            min={0}
            required
            placeholder="300000"
          />
        </Field>
        <Field label="Où veux-tu étudier ?" htmlFor="mobilite">
          <select id="mobilite" name="mobilite" required className={selectCls} defaultValue="benin">
            {MOBILITES.map((m) => (
              <option key={m} value={m}>
                {LIBELLE_MOBILITE[m]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-700">
          Tes centres d’intérêt (1 à 5)
        </legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {INTERETS.map((i) => (
            <label
              key={i}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <input type="checkbox" name="interets" value={i} className="accent-navy" />
              {LIBELLE_INTERET[i]}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" name="ambitionInternationale" className="accent-navy" />
        J’ai une ambition internationale (bourses, mobilité)
      </label>

      {state && !state.ok && (
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? 'Génération de ton plan…' : 'Générer mon Plan de Parcours'}
      </Button>
    </form>
  );
}

const selectCls =
  'h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy';

function Field({
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
