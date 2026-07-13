'use client';
import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { reserverConsultation } from '@/features/consultant/actions/reserver-consultation';
import { Button } from '@/shared/ui/button';
import { fcfa } from '@/shared/lib/format';

export interface ConsultantChoix {
  id: string;
  nom: string;
  creneaux: { id: string; label: string }[];
}
export interface TypeChoix {
  id: string;
  libelle: string;
  tarifFcfa: number;
  dureeMin: number;
}

export function ReserverForm({
  consultants,
  types,
}: {
  consultants: ConsultantChoix[];
  types: TypeChoix[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [erreur, setErreur] = useState<string | null>(null);
  const [consultantId, setConsultantId] = useState(consultants[0]?.id ?? '');
  const [typeId, setTypeId] = useState(types[0]?.id ?? '');
  const [slotId, setSlotId] = useState('');

  const consultant = useMemo(
    () => consultants.find((c) => c.id === consultantId),
    [consultants, consultantId],
  );
  const type = types.find((t) => t.id === typeId);

  function reserver() {
    setErreur(null);
    startTransition(async () => {
      const res = await reserverConsultation({
        consultantId,
        typeId,
        slotId: slotId || undefined,
      });
      if (!res.ok) {
        setErreur(res.message);
        return;
      }
      if (res.data.checkoutUrl) window.location.href = res.data.checkoutUrl;
      else router.push('/consultations');
    });
  }

  if (consultants.length === 0) {
    return <p className="text-slate-500">Aucun consultant disponible pour l’instant.</p>;
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
      <Champ label="Consultant">
        <select
          className={selectCls}
          value={consultantId}
          onChange={(e) => {
            setConsultantId(e.target.value);
            setSlotId('');
          }}
        >
          {consultants.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom}
            </option>
          ))}
        </select>
      </Champ>

      <Champ label="Type de consultation">
        <select className={selectCls} value={typeId} onChange={(e) => setTypeId(e.target.value)}>
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.libelle} · {t.dureeMin} min · {t.tarifFcfa === 0 ? 'gratuit' : fcfa(t.tarifFcfa)}
            </option>
          ))}
        </select>
      </Champ>

      <Champ label="Créneau">
        <select className={selectCls} value={slotId} onChange={(e) => setSlotId(e.target.value)}>
          <option value="">Sans créneau précis</option>
          {consultant?.creneaux.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </Champ>

      {erreur && (
        <p role="alert" className="text-sm text-red-600">
          {erreur}
        </p>
      )}

      <Button size="lg" className="w-full" onClick={reserver} disabled={pending}>
        {pending
          ? 'Traitement…'
          : type && type.tarifFcfa > 0
            ? `Payer et réserver (${fcfa(type.tarifFcfa)})`
            : 'Réserver (gratuit)'}
      </Button>
    </div>
  );
}

const selectCls =
  'h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy';

function Champ({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}
