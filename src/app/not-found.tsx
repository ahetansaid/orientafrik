import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-5xl font-bold text-navy">404</p>
      <p className="text-slate-600">Cette page n&apos;existe pas ou a été déplacée.</p>
      <Link href="/" className="rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white">
        Retour à l&apos;accueil
      </Link>
    </main>
  );
}
