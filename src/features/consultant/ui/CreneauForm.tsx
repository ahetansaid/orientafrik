'use client';
import { useActionState } from 'react';
import { publierCreneau } from '@/features/consultant/actions/publier-creneaux';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import type { ActionResult } from '@/shared/lib/result';

export function CreneauForm() {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    (_prev, formData) => publierCreneau(_prev, formData),
    null,
  );

  return (
    <form
      action={formAction}
      className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4"
    >
      <div>
        <label htmlFor="startAt" className="mb-1 block text-sm font-medium text-slate-700">
          Début
        </label>
        <Input id="startAt" name="startAt" type="datetime-local" required className="w-56" />
      </div>
      <div>
        <label htmlFor="endAt" className="mb-1 block text-sm font-medium text-slate-700">
          Fin
        </label>
        <Input id="endAt" name="endAt" type="datetime-local" required className="w-56" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? 'Ajout…' : 'Ajouter le créneau'}
      </Button>
      {state && (
        <p role="alert" className={`w-full text-sm ${state.ok ? 'text-emerald-600' : 'text-red-600'}`}>
          {state.ok ? 'Créneau ajouté.' : state.message}
        </p>
      )}
    </form>
  );
}
