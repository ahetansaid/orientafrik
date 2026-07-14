'use client';
import { useState, useTransition } from 'react';
import { promouvoirRole, rattacherEcole } from '@/features/admin/actions/provisioning';
import type { UserRole } from '@/lib/supabase/types';

export interface EcoleOption {
  id: string;
  nom: string;
}

// Contrôles admin d'un utilisateur : changer le rôle, ou le rattacher à une école.
export function RoleControls({
  userId,
  role,
  ecoles,
}: {
  userId: string;
  role: UserRole;
  ecoles: EcoleOption[];
}) {
  const [pending, startTransition] = useTransition();
  const [ecoleId, setEcoleId] = useState(ecoles[0]?.id ?? '');
  const [msg, setMsg] = useState<string | null>(null);

  function changerRole(nouveau: UserRole) {
    setMsg(null);
    startTransition(async () => {
      const res = await promouvoirRole({ userId, role: nouveau });
      setMsg(res.ok ? 'Rôle mis à jour.' : res.message);
    });
  }

  function rattacher() {
    if (!ecoleId) return;
    setMsg(null);
    startTransition(async () => {
      const res = await rattacherEcole({ userId, ecoleId, roleEcole: 'staff' });
      setMsg(res.ok ? 'Rattaché à l’école.' : res.message);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={role}
        disabled={pending}
        onChange={(e) => changerRole(e.target.value as UserRole)}
        className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm"
      >
        <option value="bachelier">bachelier</option>
        <option value="consultant">consultant</option>
        <option value="ecole">ecole</option>
        <option value="admin">admin</option>
      </select>

      {ecoles.length > 0 && (
        <div className="flex items-center gap-1">
          <select
            value={ecoleId}
            disabled={pending}
            onChange={(e) => setEcoleId(e.target.value)}
            className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm"
          >
            {ecoles.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nom}
              </option>
            ))}
          </select>
          <button
            onClick={rattacher}
            disabled={pending}
            className="h-9 rounded-lg border border-slate-300 px-2 text-xs text-navy hover:bg-slate-50 disabled:opacity-50"
          >
            Rattacher
          </button>
        </div>
      )}

      {msg && <span className="text-xs text-slate-500">{msg}</span>}
    </div>
  );
}
