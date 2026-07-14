import Link from 'next/link';
import Image from 'next/image';
import { Reveal } from '@/shared/ui/motion/Reveal';
import { MARQUE, SLOGAN } from '@/shared/lib/constants';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      {/* fond dégradé + blobs (cohérent avec la landing) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-slate-50">
        <div className="animate-blob absolute -left-24 top-10 h-80 w-80 rounded-full bg-gold/20 blur-3xl" />
        <div className="animate-blob absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-navy/15 blur-3xl [animation-delay:4s]" />
      </div>

      <Reveal className="w-full max-w-sm">
        <div className="space-y-6">
          <Link href="/" className="flex items-center justify-center gap-2 text-xl font-bold text-navy">
            <Image src="/icon.svg" alt="" width={32} height={32} className="rounded-lg" />
            {MARQUE}
          </Link>
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-navy/5 backdrop-blur">
            {children}
          </div>
          <p className="text-center text-xs text-slate-400">{SLOGAN}</p>
        </div>
      </Reveal>
    </main>
  );
}
