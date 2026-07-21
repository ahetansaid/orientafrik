import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { assertRole } from '@/lib/auth/guards';
import { listParcours, listEcoles, listBourses } from '@/features/admin/data/admin.repo';
import { StatutContenu } from '@/features/admin/ui/StatutContenu';

export const metadata: Metadata = { title: 'Admin — contenu' };

export default async function ContenuPage() {
  await assertRole('admin');
  const [parcours, ecoles, bourses] = await Promise.all([
    listParcours(db),
    listEcoles(db),
    listBourses(db),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-navy">Contenu</h1>

      <Section titre="Parcours">
        {parcours.map((p) => (
          <Ligne key={p.id} nom={p.titre}>
            <StatutContenu type="parcours" id={p.id} statut={p.statut} />
          </Ligne>
        ))}
      </Section>

      <Section titre="Écoles">
        {ecoles.map((e) => (
          <Ligne key={e.id} nom={e.nom}>
            <StatutContenu type="ecoles" id={e.id} statut={e.statut} />
          </Ligne>
        ))}
      </Section>

      <Section titre="Bourses">
        {bourses.map((b) => (
          <Ligne key={b.id} nom={b.nom}>
            <StatutContenu type="bourses" id={b.id} statut={b.statut} />
          </Ligne>
        ))}
      </Section>
    </div>
  );
}

function Section({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">{titre}</h2>
      <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {children}
      </div>
    </section>
  );
}

function Ligne({ nom, children }: { nom: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 text-sm">
      <span className="font-medium text-navy">{nom}</span>
      {children}
    </div>
  );
}
