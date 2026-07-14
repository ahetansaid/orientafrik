'use client';
import { useActionState } from 'react';
import { configurerPartenariat } from '@/features/admin/actions/contenu';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import type { ActionResult } from '@/shared/lib/result';
import type { PartenariatStatut } from '@/lib/supabase/types';

export interface PartenariatDefaults {
  ecoleId: string;
  nom: string;
  partenariat: PartenariatStatut;
  commissionMinFcfa: number | null;
  commissionMaxFcfa: number | null;
}

const STATUTS: PartenariatStatut[] = ['non_partenaire', 'prospect', 'active', 'suspended'];

export function PartenariatForm({ d }: { d: PartenariatDefaults }) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    (_prev, formData) => configurerPartenariat(_prev, formData),
    null,
  );

  return (
    <form
      action={formAction}
      className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm"
    >
      <input type="hidden" name="ecoleId" value={d.ecoleId} />
      <span className="min-w-40 font-medium text-navy">{d.nom}</span>

      <select
        name="partenariat"
        defaultValue={d.partenariat}
        className="h-9 rounded-lg border border-slate-300 bg-white px-2"
      >
        {STATUTS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <Input
        name="commissionMinFcfa"
        type="number"
        min={0}
        defaultValue={d.commissionMinFcfa ?? ''}
        placeholder="commission min"
        className="h-9 w-36"
      />
      <Input
        name="commissionMaxFcfa"
        type="number"
        min={0}
        defaultValue={d.commissionMaxFcfa ?? ''}
        placeholder="commission max"
        className="h-9 w-36"
      />

      <Button type="submit" size="sm" disabled={pending}>
        {pending ? '…' : 'Enregistrer'}
      </Button>
      {state && (
        <span className={state.ok ? 'text-emerald-600' : 'text-red-600'}>
          {state.ok ? 'OK' : state.message}
        </span>
      )}
    </form>
  );
}
