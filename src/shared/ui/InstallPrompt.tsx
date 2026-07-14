'use client';
import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { MARQUE } from '@/shared/lib/constants';

// Événement non-standard `beforeinstallprompt` (Chromium).
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'orientafrik-install-dismissed';

// Bannière discrète « Installer l'app ». N'apparaît que si le navigateur propose
// l'installation (Chromium) et que l'utilisateur ne l'a pas déjà écartée.
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(DISMISS_KEY)) return;
    // déjà installée ?
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', () => setVisible(false));
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  function fermer() {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* stockage indisponible : on se contente de masquer */
    }
  }

  async function installer() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-md animate-float rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-2xl shadow-navy/20 backdrop-blur sm:inset-x-auto sm:right-4">
      <button
        onClick={fermer}
        aria-label="Fermer"
        className="absolute right-2 top-2 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-center gap-3 pr-6">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy text-white">
          <Download className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-navy">Installe {MARQUE}</p>
          <p className="text-xs text-slate-500">Accès rapide, plein écran, même hors connexion.</p>
        </div>
      </div>
      <button
        onClick={installer}
        className="mt-3 w-full rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-white transition hover:bg-gold/90"
      >
        Ajouter à l’écran d’accueil
      </button>
    </div>
  );
}
