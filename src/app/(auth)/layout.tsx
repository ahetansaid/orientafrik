import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        <Link href="/" className="block text-center text-xl font-bold text-navy">
          ORIENTAFRIK
        </Link>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">{children}</div>
        <p className="text-center text-xs text-slate-400">
          Ton orientation post-bac, sans hasard.
        </p>
      </div>
    </main>
  );
}
