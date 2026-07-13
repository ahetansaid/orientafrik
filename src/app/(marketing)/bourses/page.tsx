import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bourses',
  description: "Bourses d'études applicables aux bacheliers du Bénin et de l'UEMOA.",
};

// Stub Vague 0 : la liste filtrable des bourses (B5) est câblée en Vague 1
// (lecture du catalogue `bourses` publié).
export default function BoursesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-2xl font-bold text-navy">Bourses</h1>
      <p className="mt-2 text-slate-600">
        Le catalogue des bourses arrive bientôt. Crée ton Plan de Parcours pour recevoir
        celles qui correspondent à ton profil.
      </p>
    </main>
  );
}
