import type { Metadata } from 'next';
import { Compass } from 'lucide-react';
import { ProfilForm } from '@/features/bachelier/ui/ProfilForm';
import { Reveal } from '@/shared/ui/motion/Reveal';

export const metadata: Metadata = { title: 'Mon profil' };

export default function ProfilPage() {
  return (
    <div className="space-y-6">
      <Reveal>
        <header>
          <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-navy/5 text-navy">
            <Compass className="h-5 w-5" />
          </span>
          <h1 className="text-2xl font-bold text-navy sm:text-3xl">Parlons de toi</h1>
          <p className="mt-1 text-slate-600">
            Quelques questions, et on t’assemble un Plan de Parcours sur mesure — gratuit.
          </p>
        </header>
      </Reveal>
      <Reveal delay={0.1}>
        <ProfilForm />
      </Reveal>
    </div>
  );
}
