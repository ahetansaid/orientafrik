import type { Metadata } from 'next';
import { ProfilForm } from '@/features/bachelier/ui/ProfilForm';

export const metadata: Metadata = { title: 'Mon profil' };

export default function ProfilPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-navy">Parlons de toi</h1>
        <p className="mt-1 text-slate-600">
          Quelques questions, et on t’assemble un Plan de Parcours sur mesure — gratuit.
        </p>
      </header>
      <ProfilForm />
    </div>
  );
}
